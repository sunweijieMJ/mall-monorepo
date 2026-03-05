import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { ProductEntity } from './infrastructure/persistence/relational/entities/product.entity';
import { ProductAttrValueEntity } from './infrastructure/persistence/relational/entities/product-attr-value.entity';
import { ProductLadderEntity } from './infrastructure/persistence/relational/entities/product-ladder.entity';
import { ProductFullReductionEntity } from './infrastructure/persistence/relational/entities/product-full-reduction.entity';
import { MemberPriceEntity } from './infrastructure/persistence/relational/entities/member-price.entity';
import { ProductVertifyRecordEntity } from './infrastructure/persistence/relational/entities/product-vertify-record.entity';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { SubjectProductRelationEntity } from '@/modules/cms/subject/infrastructure/persistence/relational/entities/subject-product-relation.entity';
import { PrefrenceAreaProductRelationEntity } from '@/modules/cms/prefrence-area/infrastructure/persistence/relational/entities/prefrence-area-product-relation.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-param.dto';

/**
 * 将日期格式化为 yyyyMMdd 字符串（用于生成 SKU 编码）
 */
function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * 分页查询商品列表
   * 支持 keyword / publishStatus / verifyStatus / brandId / productCategoryId / productSn 过滤
   */
  async findList(
    query: PageQueryDto & {
      keyword?: string;
      productSn?: string;
      publishStatus?: number;
      verifyStatus?: number;
      brandId?: number;
      productCategoryId?: number;
    },
  ): Promise<PageResult<ProductEntity>> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .where('p.deleteStatus = :deleteStatus', { deleteStatus: 0 });

    // 商品名称模糊查询
    if (query.keyword) {
      qb.andWhere('p.name LIKE :keyword', { keyword: `%${query.keyword}%` });
    }
    // 货号精确匹配
    if (query.productSn) {
      qb.andWhere('p.productSn = :productSn', { productSn: query.productSn });
    }
    // 上架状态过滤
    if (query.publishStatus !== undefined && query.publishStatus !== null) {
      qb.andWhere('p.publishStatus = :publishStatus', {
        publishStatus: Number(query.publishStatus),
      });
    }
    // 审核状态过滤
    if (query.verifyStatus !== undefined && query.verifyStatus !== null) {
      qb.andWhere('p.verifyStatus = :verifyStatus', {
        verifyStatus: Number(query.verifyStatus),
      });
    }
    // 品牌过滤
    if (query.brandId !== undefined && query.brandId !== null) {
      qb.andWhere('p.brandId = :brandId', { brandId: Number(query.brandId) });
    }
    // 商品分类过滤
    if (
      query.productCategoryId !== undefined &&
      query.productCategoryId !== null
    ) {
      qb.andWhere('p.productCategoryId = :productCategoryId', {
        productCategoryId: Number(query.productCategoryId),
      });
    }

    qb.orderBy('p.id', 'DESC')
      .skip((query.page - 1) * query.limit)
      .take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  /**
   * 查询简单商品列表（用于选择器），只返回 id/name/pic
   */
  async findSimpleList(keyword?: string): Promise<Partial<ProductEntity>[]> {
    const qb = this.productRepo
      .createQueryBuilder('p')
      .select(['p.id', 'p.name', 'p.pic'])
      .where('p.deleteStatus = 0');
    if (keyword) {
      qb.andWhere('p.name LIKE :keyword', { keyword: `%${keyword}%` });
    }
    return qb.getMany();
  }

  /**
   * 创建商品（事务写入多张关联表）
   * 商品主表 + SKU + 属性值 + 阶梯价 + 满减价 + 会员价 + 专题关联 + 优选区域关联
   */
  async create(dto: CreateProductDto): Promise<ProductEntity> {
    return this.dataSource.manager.transaction(async (manager) => {
      // 1. 插入商品主表（清空 id 避免主键冲突）
      const productEntity = manager.create(ProductEntity, {
        ...dto,
        id: undefined,
      } as any);
      const savedProduct = await manager.save(ProductEntity, productEntity);
      const productId = savedProduct.id;

      const dateStr = formatDateYMD(new Date());

      // 2. 处理 SKU 列表并批量插入
      const skuStockList: any[] = dto.skuStockList ?? [];
      if (skuStockList.length > 0) {
        const skuEntities = skuStockList.map((sku, index) => {
          // 生成 skuCode：日期(8位) + 商品ID(4位，不足补0) + 序号(3位，从1开始)
          const skuCode =
            sku.skuCode ||
            `${dateStr}${String(productId).padStart(4, '0')}${String(index + 1).padStart(3, '0')}`;
          return manager.create(SkuStockEntity, {
            ...sku,
            id: undefined,
            productId,
            skuCode,
          });
        });
        await manager.save(SkuStockEntity, skuEntities);
      }

      // 3. 批量插入商品属性值
      const attrValueList: any[] = dto.productAttributeValueList ?? [];
      if (attrValueList.length > 0) {
        const attrEntities = attrValueList.map((item) =>
          manager.create(ProductAttrValueEntity, {
            ...item,
            id: undefined,
            productId,
          }),
        );
        await manager.save(ProductAttrValueEntity, attrEntities);
      }

      // 4. 批量插入阶梯价格
      const ladderList: any[] = dto.productLadderList ?? [];
      if (ladderList.length > 0) {
        const ladderEntities = ladderList.map((item) =>
          manager.create(ProductLadderEntity, {
            ...item,
            id: undefined,
            productId,
          }),
        );
        await manager.save(ProductLadderEntity, ladderEntities);
      }

      // 5. 批量插入满减价格
      const fullReductionList: any[] = dto.productFullReductionList ?? [];
      if (fullReductionList.length > 0) {
        const fullReductionEntities = fullReductionList.map((item) =>
          manager.create(ProductFullReductionEntity, {
            ...item,
            id: undefined,
            productId,
          }),
        );
        await manager.save(ProductFullReductionEntity, fullReductionEntities);
      }

      // 6. 批量插入会员价格
      const memberPriceList: any[] = dto.memberPriceList ?? [];
      if (memberPriceList.length > 0) {
        const memberPriceEntities = memberPriceList.map((item) =>
          manager.create(MemberPriceEntity, {
            ...item,
            id: undefined,
            productId,
          }),
        );
        await manager.save(MemberPriceEntity, memberPriceEntities);
      }

      // 7. 批量插入专题关联
      const subjectRelationList: any[] = dto.subjectProductRelationList ?? [];
      if (subjectRelationList.length > 0) {
        const subjectEntities = subjectRelationList.map((item) =>
          manager.create(SubjectProductRelationEntity, {
            ...item,
            id: undefined,
            productId,
          }),
        );
        await manager.save(SubjectProductRelationEntity, subjectEntities);
      }

      // 8. 批量插入优选区域关联
      const prefrenceAreaList: any[] =
        dto.prefrenceAreaProductRelationList ?? [];
      if (prefrenceAreaList.length > 0) {
        const prefrenceAreaEntities = prefrenceAreaList.map((item) =>
          manager.create(PrefrenceAreaProductRelationEntity, {
            ...item,
            id: undefined,
            productId,
          }),
        );
        await manager.save(
          PrefrenceAreaProductRelationEntity,
          prefrenceAreaEntities,
        );
      }

      return savedProduct;
    });
  }

  /**
   * 更新商品（事务：先删后插 + SKU 增量更新）
   */
  async update(id: number, dto: UpdateProductDto): Promise<ProductEntity> {
    return this.dataSource.manager.transaction(async (manager) => {
      // 1. 更新商品主表（排除子表字段，避免被 TypeORM 当作主表字段处理）
      await manager.update(ProductEntity, id, {
        ...dto,
        id: undefined,
        skuStockList: undefined,
        productAttributeValueList: undefined,
        productLadderList: undefined,
        productFullReductionList: undefined,
        memberPriceList: undefined,
        subjectProductRelationList: undefined,
        prefrenceAreaProductRelationList: undefined,
      } as any);

      const dateStr = formatDateYMD(new Date());

      // 2. 属性值：先删后插
      await manager.delete(ProductAttrValueEntity, { productId: id });
      const attrValueList: any[] = dto.productAttributeValueList ?? [];
      if (attrValueList.length > 0) {
        const attrEntities = attrValueList.map((item) =>
          manager.create(ProductAttrValueEntity, {
            ...item,
            id: undefined,
            productId: id,
          }),
        );
        await manager.save(ProductAttrValueEntity, attrEntities);
      }

      // 3. 阶梯价格：先删后插
      await manager.delete(ProductLadderEntity, { productId: id });
      const ladderList: any[] = dto.productLadderList ?? [];
      if (ladderList.length > 0) {
        const ladderEntities = ladderList.map((item) =>
          manager.create(ProductLadderEntity, {
            ...item,
            id: undefined,
            productId: id,
          }),
        );
        await manager.save(ProductLadderEntity, ladderEntities);
      }

      // 4. 满减价格：先删后插
      await manager.delete(ProductFullReductionEntity, { productId: id });
      const fullReductionList: any[] = dto.productFullReductionList ?? [];
      if (fullReductionList.length > 0) {
        const fullReductionEntities = fullReductionList.map((item) =>
          manager.create(ProductFullReductionEntity, {
            ...item,
            id: undefined,
            productId: id,
          }),
        );
        await manager.save(ProductFullReductionEntity, fullReductionEntities);
      }

      // 5. 会员价格：先删后插
      await manager.delete(MemberPriceEntity, { productId: id });
      const memberPriceList: any[] = dto.memberPriceList ?? [];
      if (memberPriceList.length > 0) {
        const memberPriceEntities = memberPriceList.map((item) =>
          manager.create(MemberPriceEntity, {
            ...item,
            id: undefined,
            productId: id,
          }),
        );
        await manager.save(MemberPriceEntity, memberPriceEntities);
      }

      // 6. SKU 三路处理（增量更新）
      const currSkuList: any[] = dto.skuStockList ?? [];
      if (currSkuList.length === 0) {
        // 当前无 SKU 则全部删除
        await manager.delete(SkuStockEntity, { productId: id });
      } else {
        // 查询 DB 中当前该商品的 SKU 列表
        const oriSkuList = await manager.find(SkuStockEntity, {
          where: { productId: id },
        });

        // 有 id 的为更新，无 id 的为新增
        const insertSkuList = currSkuList.filter(
          (item) => item.id == null || item.id === undefined,
        );
        const updateSkuList = currSkuList.filter(
          (item) => item.id != null && item.id !== undefined,
        );
        const updateSkuIds = updateSkuList.map((item) => item.id);

        // 在 DB 中存在但不在 updateList 中的，为需要删除的 SKU
        const deleteSkuIds = oriSkuList
          .filter((item) => !updateSkuIds.includes(item.id))
          .map((item) => item.id);

        // 新增 SKU（生成 skuCode）
        if (insertSkuList.length > 0) {
          const skuEntities = insertSkuList.map((sku, index) => {
            const skuCode =
              sku.skuCode ||
              `${dateStr}${String(id).padStart(4, '0')}${String(index + 1).padStart(3, '0')}`;
            return manager.create(SkuStockEntity, {
              ...sku,
              id: undefined,
              productId: id,
              skuCode,
            });
          });
          await manager.save(SkuStockEntity, skuEntities);
        }

        // 删除不再需要的 SKU
        if (deleteSkuIds.length > 0) {
          await manager.delete(SkuStockEntity, { id: In(deleteSkuIds) });
        }

        // 逐条更新现有 SKU（同时更新 skuCode）
        for (let i = 0; i < updateSkuList.length; i++) {
          const sku = updateSkuList[i];
          const skuCode =
            sku.skuCode ||
            `${dateStr}${String(id).padStart(4, '0')}${String(i + 1).padStart(3, '0')}`;
          await manager.update(SkuStockEntity, sku.id, {
            ...sku,
            productId: id,
            skuCode,
          });
        }
      }

      // 7. 专题关联：先删后插
      await manager.delete(SubjectProductRelationEntity, { productId: id });
      const subjectRelationList: any[] = dto.subjectProductRelationList ?? [];
      if (subjectRelationList.length > 0) {
        const subjectEntities = subjectRelationList.map((item) =>
          manager.create(SubjectProductRelationEntity, {
            ...item,
            id: undefined,
            productId: id,
          }),
        );
        await manager.save(SubjectProductRelationEntity, subjectEntities);
      }

      // 8. 优选区域关联：先删后插
      await manager.delete(PrefrenceAreaProductRelationEntity, {
        productId: id,
      });
      const prefrenceAreaList: any[] =
        dto.prefrenceAreaProductRelationList ?? [];
      if (prefrenceAreaList.length > 0) {
        const prefrenceAreaEntities = prefrenceAreaList.map((item) =>
          manager.create(PrefrenceAreaProductRelationEntity, {
            ...item,
            id: undefined,
            productId: id,
          }),
        );
        await manager.save(
          PrefrenceAreaProductRelationEntity,
          prefrenceAreaEntities,
        );
      }

      // 返回更新后的商品信息
      return manager.findOne(ProductEntity, {
        where: { id },
      }) as Promise<ProductEntity>;
    });
  }

  /**
   * 获取商品详情（含 SKU 列表、属性值列表等聚合信息）
   * 并行查询所有关联子表，聚合返回
   */
  async getUpdateInfo(id: number): Promise<any> {
    const [
      product,
      skuStockList,
      productAttributeValueList,
      productLadderList,
      productFullReductionList,
      memberPriceList,
      subjectProductRelationList,
      prefrenceAreaProductRelationList,
    ] = await Promise.all([
      this.productRepo.findOne({ where: { id } }),
      this.dataSource
        .getRepository(SkuStockEntity)
        .find({ where: { productId: id } }),
      this.dataSource
        .getRepository(ProductAttrValueEntity)
        .find({ where: { productId: id } }),
      this.dataSource
        .getRepository(ProductLadderEntity)
        .find({ where: { productId: id } }),
      this.dataSource
        .getRepository(ProductFullReductionEntity)
        .find({ where: { productId: id } }),
      this.dataSource
        .getRepository(MemberPriceEntity)
        .find({ where: { productId: id } }),
      this.dataSource
        .getRepository(SubjectProductRelationEntity)
        .find({ where: { productId: id } }),
      this.dataSource
        .getRepository(PrefrenceAreaProductRelationEntity)
        .find({ where: { productId: id } }),
    ]);

    return {
      ...product,
      skuStockList,
      productAttributeValueList,
      productLadderList,
      productFullReductionList,
      memberPriceList,
      subjectProductRelationList,
      prefrenceAreaProductRelationList,
    };
  }

  /**
   * 批量删除商品（软删除，设置 deleteStatus = 1）
   */
  async delete(ids: number[]): Promise<void> {
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ deleteStatus: 1 })
      .whereInIds(ids)
      .execute();
  }

  /**
   * 批量更新审核状态，并写入审核记录
   * 对应 PmsProductServiceImpl.updateVerifyStatus()
   */
  async updateVerifyStatus(
    ids: number[],
    verifyStatus: number,
    detail: string,
  ): Promise<void> {
    await this.dataSource.manager.transaction(async (manager) => {
      // 1. 批量更新商品审核状态
      await manager
        .createQueryBuilder()
        .update(ProductEntity)
        .set({ verifyStatus })
        .whereInIds(ids)
        .execute();

      // 2. 批量插入审核记录（vertifyMan 固定为 'test'，与 Java 实现一致）
      const now = new Date();
      const records = ids.map((productId) =>
        manager.create(ProductVertifyRecordEntity, {
          productId,
          status: verifyStatus,
          detail,
          createTime: now,
          vertifyMan: 'test',
        }),
      );
      await manager.save(ProductVertifyRecordEntity, records);
    });
  }

  /** 批量更新上架状态 */
  async updatePublishStatus(
    ids: number[],
    publishStatus: number,
  ): Promise<void> {
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ publishStatus })
      .whereInIds(ids)
      .execute();
  }

  /** 批量更新新品状态 */
  async updateNewStatus(ids: number[], newStatus: number): Promise<void> {
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ newStatus })
      .whereInIds(ids)
      .execute();
  }

  /** 批量更新推荐状态 */
  async updateRecommendStatus(
    ids: number[],
    recommandStatus: number,
  ): Promise<void> {
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ recommandStatus })
      .whereInIds(ids)
      .execute();
  }
}
