import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PreferenceAreaEntity } from './infrastructure/persistence/relational/entities/preference-area.entity';
import { PreferenceAreaProductRelationEntity } from './infrastructure/persistence/relational/entities/preference-area-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import {
  CreatePreferenceAreaDto,
  UpdatePreferenceAreaDto,
} from './dto/create-preference-area.dto';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';

@Injectable()
export class PreferenceAreaService {
  constructor(
    @InjectRepository(PreferenceAreaEntity)
    private readonly areaRepo: Repository<PreferenceAreaEntity>,
    @InjectRepository(PreferenceAreaProductRelationEntity)
    private readonly relationRepo: Repository<PreferenceAreaProductRelationEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * 查询全部优选专区列表
   */
  async list(): Promise<PreferenceAreaEntity[]> {
    return this.areaRepo.find({ order: { sort: 'ASC', id: 'DESC' } });
  }

  /**
   * 根据 ID 获取优选专区详情
   */
  async getItem(id: number): Promise<PreferenceAreaEntity> {
    const area = await this.areaRepo.findOneBy({ id });
    if (!area) throw new NotFoundException(`优选专区 ${id} 不存在`);
    return area;
  }

  /**
   * 创建优选专区
   * @param dto 优选专区信息
   */
  async create(dto: CreatePreferenceAreaDto): Promise<PreferenceAreaEntity> {
    const entity = this.areaRepo.create(dto);
    return this.areaRepo.save(entity);
  }

  /**
   * 更新优选专区
   * @param id 专区 ID
   * @param dto 更新内容
   */
  async update(id: number, dto: UpdatePreferenceAreaDto): Promise<void> {
    await this.areaRepo.update(id, dto);
  }

  /**
   * 批量删除优选专区（同时删除关联关系）
   * @param ids 专区 ID 数组
   */
  async delete(ids: number[]): Promise<void> {
    await this.transactionService.run(async (manager) => {
      // 先删除关联关系
      await manager.delete(PreferenceAreaProductRelationEntity, {
        preferenceAreaId: In(ids),
      });
      // 软删除专区
      await manager.softDelete(PreferenceAreaEntity, ids);
    });
  }

  /**
   * 查询优选专区下的商品列表
   * @param preferenceAreaId 专区 ID
   * @param query 分页参数
   */
  async getProductList(
    preferenceAreaId: number,
    query: PageQueryDto,
  ): Promise<PageResult<ProductEntity>> {
    const { page, limit } = query;

    const [relations, totalCount] = await this.relationRepo.findAndCount({
      where: { preferenceAreaId },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'ASC' },
    });

    if (relations.length === 0) {
      return PageResult.of([], totalCount, query);
    }

    const productIds = relations.map((r) => r.productId);
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
    });

    // 按 productIds 顺序排列结果（In() 查询不保证顺序）
    const productMap = new Map(products.map((p) => [p.id, p]));
    const sorted = productIds
      .map((id) => productMap.get(id))
      .filter(Boolean) as ProductEntity[];

    return PageResult.of(sorted, totalCount, query);
  }
}
