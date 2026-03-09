import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { SubjectEntity } from './infrastructure/persistence/relational/entities/subject.entity';
import { SubjectProductRelationEntity } from './infrastructure/persistence/relational/entities/subject-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';
import {
  CreateSubjectDto,
  UpdateSubjectDto,
  SubjectQueryDto,
} from './dto/create-subject.dto';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly subjectRepo: Repository<SubjectEntity>,
    @InjectRepository(SubjectProductRelationEntity)
    private readonly relationRepo: Repository<SubjectProductRelationEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    private readonly transactionService: TransactionService,
  ) {}

  /**
   * 分页查询专题列表
   * @param query 查询条件：keyword（模糊匹配标题）、pageNum、pageSize
   */
  async list(query: SubjectQueryDto): Promise<PageResult<SubjectEntity>> {
    const { keyword, page, limit } = query;
    const where = keyword ? { title: Like(`%${keyword}%`) } : {};
    const [list, total] = await this.subjectRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /**
   * 根据 ID 获取专题详情
   */
  async getItem(id: number): Promise<SubjectEntity> {
    const subject = await this.subjectRepo.findOneBy({ id });
    if (!subject) throw new NotFoundException(`专题 ${id} 不存在`);
    return subject;
  }

  /**
   * 创建专题
   * @param dto 专题信息
   */
  async create(dto: CreateSubjectDto): Promise<SubjectEntity> {
    const entity = this.subjectRepo.create({
      ...dto,
      createdAt: new Date(),
    });
    return this.subjectRepo.save(entity);
  }

  /**
   * 更新专题
   * @param id 专题 ID
   * @param dto 更新内容
   */
  async update(id: number, dto: UpdateSubjectDto): Promise<void> {
    await this.subjectRepo.update(id, dto);
  }

  /**
   * 批量删除专题（同时删除关联关系）
   * @param ids 专题 ID 数组
   */
  async delete(ids: number[]): Promise<void> {
    await this.transactionService.run(async (manager) => {
      // 先删除关联关系
      await manager.delete(SubjectProductRelationEntity, {
        subjectId: In(ids),
      });
      // 软删除专题
      await manager.softDelete(SubjectEntity, ids);
    });
  }

  /**
   * 查询专题下的商品列表（关联 pms_product）
   * @param subjectId 专题 ID
   * @param query 分页参数
   */
  async getProductList(
    subjectId: number,
    query: PageQueryDto,
  ): Promise<PageResult<ProductEntity>> {
    const { page, limit } = query;

    // 查关联表获取商品 ID 列表（findAndCount 保证 count 与 find 一致）
    const [relations, totalCount] = await this.relationRepo.findAndCount({
      where: { subjectId },
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
