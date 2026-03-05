import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './infrastructure/persistence/relational/entities/product.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  /**
   * 分页查询商品列表
   * TODO: 迁移自 PmsProductServiceImpl.list()
   *   - 支持 keyword / publishStatus / verifyStatus / brandId / productCategoryId / productSn 过滤
   */
  async findList(
    query: PageQueryDto & Record<string, any>,
  ): Promise<PageResult<ProductEntity>> {
    // TODO: implement
    const [list, total] = await this.productRepo.findAndCount({
      where: { deleteStatus: 0 },
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { id: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 查询简单商品列表（用于选择器）
   * TODO: 迁移自 PmsProductServiceImpl.list() 精简版，只返回 id/name/pic
   */
  async findSimpleList(keyword?: string): Promise<Partial<ProductEntity>[]> {
    // TODO: implement
    const qb = this.productRepo
      .createQueryBuilder('p')
      .select(['p.id', 'p.name', 'p.pic']);
    if (keyword) qb.where('p.name LIKE :keyword', { keyword: `%${keyword}%` });
    return qb.getMany();
  }

  /**
   * 创建商品（聚合操作：商品主表 + SKU + 属性值 + 关联专题/优选区域）
   * TODO: 迁移自 PmsProductServiceImpl.create()
   *   - 事务包裹，写入：pms_product / pms_sku_stock / pms_product_attr_value
   *   - 写入阶梯价格、满减价格、会员价格（若有）
   *   - 写入专题关联、优选区域关联
   */
  async create(dto: any): Promise<ProductEntity> {
    // TODO: implement（需要事务 @Transactional）
    throw new Error('TODO: ProductService.create not implemented');
  }

  /**
   * 更新商品
   * TODO: 迁移自 PmsProductServiceImpl.update()
   *   - 先删除旧的 SKU / 属性值 / 关联，再重新插入
   */
  async update(id: number, dto: any): Promise<ProductEntity> {
    // TODO: implement
    throw new Error('TODO: ProductService.update not implemented');
  }

  /**
   * 获取商品详情（含 SKU 列表、属性值列表）
   * TODO: 迁移自 PmsProductServiceImpl.getUpdateInfo()
   */
  async getUpdateInfo(id: number): Promise<any> {
    // TODO: implement - 返回 PmsProductResult（商品 + SKU + 属性值 + 阶梯价 + ...）
    throw new Error('TODO: ProductService.getUpdateInfo not implemented');
  }

  /**
   * 批量删除商品（软删除）
   * TODO: 迁移自 PmsProductServiceImpl.delete()
   */
  async delete(ids: number[]): Promise<void> {
    // TODO: implement - update delete_status = 1
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ deleteStatus: 1 })
      .whereInIds(ids)
      .execute();
  }

  /** 更新上架状态（TODO） */
  async updatePublishStatus(
    ids: number[],
    publishStatus: number,
  ): Promise<void> {
    // TODO: 迁移自 PmsProductServiceImpl.updatePublishStatus()
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ publishStatus })
      .whereInIds(ids)
      .execute();
  }

  /** 更新新品状态（TODO） */
  async updateNewStatus(ids: number[], newStatus: number): Promise<void> {
    await this.productRepo
      .createQueryBuilder()
      .update()
      .set({ newStatus })
      .whereInIds(ids)
      .execute();
  }

  /** 更新推荐状态（TODO） */
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
