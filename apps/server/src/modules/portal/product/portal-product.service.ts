import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { BrandEntity } from '@/modules/pms/brand/infrastructure/persistence/relational/entities/brand.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { ProductAttrEntity } from '@/modules/pms/product-attr/infrastructure/persistence/relational/entities/product-attr.entity';
import { ProductAttrValueEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-attr-value.entity';
import { ProductLadderEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product-full-reduction.entity';
import { ProductCategoryEntity } from '@/modules/pms/product-category/infrastructure/persistence/relational/entities/product-category.entity';
import { CouponEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon.entity';
import { CouponProductRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-relation.entity';
import { CouponProductCategoryRelationEntity } from '@/modules/sms/coupon/infrastructure/persistence/relational/entities/coupon-product-category-relation.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

/** 商品详情聚合对象 */
export interface PmsPortalProductDetail {
  product: ProductEntity;
  brand: BrandEntity | null;
  skuStockList: SkuStockEntity[];
  productAttrList: ProductAttrEntity[];
  productAttrValueList: ProductAttrValueEntity[];
  productLadderList?: ProductLadderEntity[];
  productFullReductionList?: ProductFullReductionEntity[];
  couponList: CouponEntity[];
}

/** 商品分类树节点（扩展 children） */
export interface ProductCategoryNode extends Omit<
  ProductCategoryEntity,
  'parent' | 'children'
> {
  children: ProductCategoryNode[];
}

@Injectable()
export class PortalProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,

    @InjectRepository(BrandEntity)
    private readonly brandRepo: Repository<BrandEntity>,

    @InjectRepository(SkuStockEntity)
    private readonly skuStockRepo: Repository<SkuStockEntity>,

    @InjectRepository(ProductAttrEntity)
    private readonly productAttrRepo: Repository<ProductAttrEntity>,

    @InjectRepository(ProductAttrValueEntity)
    private readonly productAttrValueRepo: Repository<ProductAttrValueEntity>,

    @InjectRepository(ProductLadderEntity)
    private readonly productLadderRepo: Repository<ProductLadderEntity>,

    @InjectRepository(ProductFullReductionEntity)
    private readonly productFullReductionRepo: Repository<ProductFullReductionEntity>,

    @InjectRepository(ProductCategoryEntity)
    private readonly productCategoryRepo: Repository<ProductCategoryEntity>,

    @InjectRepository(CouponEntity)
    private readonly couponRepo: Repository<CouponEntity>,

    @InjectRepository(CouponProductRelationEntity)
    private readonly couponProductRelationRepo: Repository<CouponProductRelationEntity>,

    @InjectRepository(CouponProductCategoryRelationEntity)
    private readonly couponProductCategoryRelationRepo: Repository<CouponProductCategoryRelationEntity>,
  ) {}

  /**
   * 搜索商品列表（仅返回已上架且未删除的商品）
   * @param keyword 关键词（模糊匹配商品名称）
   * @param brandId 品牌 ID 过滤
   * @param productCategoryId 分类 ID 过滤
   * @param query 分页参数
   * @param sort 排序：1→新品(id DESC)，2→销量(sale DESC)，3→价格升序，4→价格降序
   */
  async search(
    query: PageQueryDto,
    keyword?: string,
    brandId?: number,
    productCategoryId?: number,
    sort?: number,
  ): Promise<PageResult<ProductEntity>> {
    const qb = this.productRepo.createQueryBuilder('p');

    // 只查已上架、未删除的商品
    qb.where('p.publish_status = :publishStatus', { publishStatus: 1 });
    qb.andWhere('p.delete_status = :deleteStatus', { deleteStatus: 0 });

    if (keyword) {
      qb.andWhere('p.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
    if (brandId != null) {
      qb.andWhere('p.brand_id = :brandId', { brandId });
    }
    if (productCategoryId != null) {
      qb.andWhere('p.product_category_id = :productCategoryId', {
        productCategoryId,
      });
    }

    // 排序：1-新品(默认)、2-销量、3-价格升序、4-价格降序
    switch (sort) {
      case 2:
        qb.orderBy('p.sale', 'DESC');
        break;
      case 3:
        qb.orderBy('p.price', 'ASC');
        break;
      case 4:
        qb.orderBy('p.price', 'DESC');
        break;
      default:
        // 默认按新品（id 倒序）
        qb.orderBy('p.id', 'DESC');
    }

    const offset = (query.page - 1) * query.limit;
    qb.skip(offset).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  /**
   * 获取商品详情（聚合多表数据）
   * @param id 商品 ID
   */
  async detail(id: number): Promise<PmsPortalProductDetail> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`商品 ${id} 不存在`);
    }

    // 并行查询关联数据
    const [brand, skuStockList, productAttrList, productAttrValueListRaw] =
      await Promise.all([
        // 品牌信息
        product.brandId
          ? this.brandRepo.findOne({ where: { id: product.brandId } })
          : Promise.resolve(null),
        // SKU 库存列表
        this.skuStockRepo.find({ where: { productId: id } }),
        // 商品属性列表（按属性分类 ID 查询）
        product.productAttributeCategoryId
          ? this.productAttrRepo.find({
              where: {
                productAttributeCategoryId: product.productAttributeCategoryId,
              },
            })
          : Promise.resolve([]),
        // 商品属性值（先全部查出，后面根据 attrIds 过滤）
        this.productAttrValueRepo.find({ where: { productId: id } }),
      ]);

    // 根据已查出的 attrIds 过滤属性值
    const attrIds = productAttrList.map((a) => a.id);
    const productAttrValueList =
      attrIds.length > 0
        ? productAttrValueListRaw.filter((v) =>
            attrIds.includes(v.productAttributeId),
          )
        : [];

    // 促销类型 3：阶梯价格
    let productLadderList: ProductLadderEntity[] | undefined;
    if (product.promotionType === 3) {
      productLadderList = await this.productLadderRepo.find({
        where: { productId: id },
      });
    }

    // 促销类型 4：满减价格
    let productFullReductionList: ProductFullReductionEntity[] | undefined;
    if (product.promotionType === 4) {
      productFullReductionList = await this.productFullReductionRepo.find({
        where: { productId: id },
      });
    }

    // 查询当前商品可用优惠券
    const couponList = await this.getAvailableCoupons(
      id,
      product.productCategoryId,
    );

    return {
      product,
      brand,
      skuStockList,
      productAttrList,
      productAttrValueList,
      productLadderList,
      productFullReductionList,
      couponList,
    };
  }

  /**
   * 获取商品分类树（parentId=0 为根节点）
   */
  async categoryTreeList(): Promise<ProductCategoryNode[]> {
    // 查询所有分类
    const allCategories = await this.productCategoryRepo.find();

    // 递归构建树结构
    const buildTree = (parentId: number | null): ProductCategoryNode[] => {
      return allCategories
        .filter((c) =>
          parentId === null
            ? !c.parentId || c.parentId === 0
            : c.parentId === parentId,
        )
        .map((c) => {
          // 移除 TypeORM 树关系字段，避免循环引用
          const { parent: _parent, children: _children, ...rest } = c as any;
          return {
            ...rest,
            children: buildTree(c.id),
          } as ProductCategoryNode;
        });
    };

    return buildTree(null);
  }

  /**
   * 查询商品可用优惠券
   * - useType=0：全场通用
   * - useType=1：指定分类（匹配 productCategoryId）
   * - useType=2：指定商品（匹配 productId）
   */
  private async getAvailableCoupons(
    productId: number,
    productCategoryId: number,
  ): Promise<CouponEntity[]> {
    const now = new Date();

    // 查询全场通用优惠券（useType=0）
    const universalCoupons = await this.couponRepo
      .createQueryBuilder('c')
      .where('c.use_type = :useType', { useType: 0 })
      .andWhere('(c.start_time IS NULL OR c.start_time < :now)', { now })
      .andWhere('(c.end_time IS NULL OR c.end_time > :now)', { now })
      .getMany();

    // 查询与该商品绑定的优惠券 ID
    const productRelations = await this.couponProductRelationRepo.find({
      where: { productId },
    });
    const productCouponIds = productRelations.map((r) => r.couponId);

    // 查询与该分类绑定的优惠券 ID
    const categoryRelations = await this.couponProductCategoryRelationRepo.find(
      {
        where: { productCategoryId },
      },
    );
    const categoryCouponIds = categoryRelations.map((r) => r.couponId);

    // 合并需要额外查询的优惠券 ID（去重）
    const extraIds = [...new Set([...productCouponIds, ...categoryCouponIds])];

    let extraCoupons: CouponEntity[] = [];
    if (extraIds.length > 0) {
      extraCoupons = await this.couponRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: extraIds })
        .andWhere('(c.start_time IS NULL OR c.start_time < :now)', { now })
        .andWhere('(c.end_time IS NULL OR c.end_time > :now)', { now })
        .getMany();
    }

    // 合并去重（按 id 去重）
    const couponMap = new Map<number, CouponEntity>();
    for (const c of [...universalCoupons, ...extraCoupons]) {
      couponMap.set(c.id, c);
    }

    return Array.from(couponMap.values());
  }
}
