import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PrefrenceAreaEntity } from './infrastructure/persistence/relational/entities/prefrence-area.entity';
import { PrefrenceAreaProductRelationEntity } from './infrastructure/persistence/relational/entities/prefrence-area-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

/** 创建/更新优选专区的 DTO */
export interface CreatePrefrenceAreaDto {
  name?: string;
  subTitle?: string;
  sort?: number;
  showStatus?: number;
  pic?: Buffer;
}

@Injectable()
export class PrefrenceAreaService {
  constructor(
    @InjectRepository(PrefrenceAreaEntity)
    private readonly areaRepo: Repository<PrefrenceAreaEntity>,
    @InjectRepository(PrefrenceAreaProductRelationEntity)
    private readonly relationRepo: Repository<PrefrenceAreaProductRelationEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  /**
   * 查询全部优选专区列表
   */
  async list(): Promise<PrefrenceAreaEntity[]> {
    return this.areaRepo.find({ order: { sort: 'ASC', id: 'DESC' } });
  }

  /**
   * 创建优选专区
   * @param dto 优选专区信息
   */
  async create(dto: CreatePrefrenceAreaDto): Promise<PrefrenceAreaEntity> {
    const entity = this.areaRepo.create(dto);
    return this.areaRepo.save(entity);
  }

  /**
   * 更新优选专区
   * @param id 专区 ID
   * @param dto 更新内容
   */
  async update(id: number, dto: CreatePrefrenceAreaDto): Promise<void> {
    await this.areaRepo.update(id, dto);
  }

  /**
   * 批量删除优选专区（同时删除关联关系）
   * @param ids 专区 ID 数组
   */
  async delete(ids: number[]): Promise<void> {
    // 先删除关联关系
    await this.relationRepo.delete({ prefrenceAreaId: In(ids) });
    // 再删除专区
    await this.areaRepo.delete(ids);
  }

  /**
   * 查询优选专区下的商品列表
   * @param prefrenceAreaId 专区 ID
   * @param query 分页参数
   */
  async getProductList(
    prefrenceAreaId: number,
    query: PageQueryDto,
  ): Promise<PageResult<ProductEntity>> {
    const { page, limit } = query;

    const totalCount = await this.relationRepo.count({
      where: { prefrenceAreaId },
    });

    const relations = await this.relationRepo.find({
      where: { prefrenceAreaId },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (relations.length === 0) {
      return PageResult.of([], totalCount, query);
    }

    const productIds = relations.map((r) => r.productId);
    const products = await this.productRepo.find({
      where: { id: In(productIds) },
    });

    return PageResult.of(products, totalCount, query);
  }
}
