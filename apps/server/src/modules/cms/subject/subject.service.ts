import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { SubjectEntity } from './infrastructure/persistence/relational/entities/subject.entity';
import { SubjectProductRelationEntity } from './infrastructure/persistence/relational/entities/subject-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

/** 创建/更新专题的 DTO */
export interface CreateSubjectDto {
  categoryId?: number;
  title?: string;
  pic?: string;
  productCount?: number;
  recommendStatus?: number;
  collectCount?: number;
  readCount?: number;
  commentCount?: number;
  albumPics?: string;
  description?: string;
  showStatus?: number;
  forwardCount?: number;
  categoryName?: string;
  content?: string;
}

/** 专题列表查询条件 */
export interface SubjectQueryDto extends PageQueryDto {
  keyword?: string;
}

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly subjectRepo: Repository<SubjectEntity>,
    @InjectRepository(SubjectProductRelationEntity)
    private readonly relationRepo: Repository<SubjectProductRelationEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
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
   * 创建专题
   * @param dto 专题信息
   */
  async create(dto: CreateSubjectDto): Promise<SubjectEntity> {
    const entity = this.subjectRepo.create({
      ...dto,
      createTime: new Date(),
    });
    return this.subjectRepo.save(entity);
  }

  /**
   * 更新专题
   * @param id 专题 ID
   * @param dto 更新内容
   */
  async update(id: number, dto: CreateSubjectDto): Promise<void> {
    await this.subjectRepo.update(id, dto);
  }

  /**
   * 批量删除专题（同时删除关联关系）
   * @param ids 专题 ID 数组
   */
  async delete(ids: number[]): Promise<void> {
    // 先删除关联关系
    await this.relationRepo.delete({ subjectId: In(ids) });
    // 再删除专题
    await this.subjectRepo.delete(ids);
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

    // 先查关联表获取商品 ID 列表
    const relations = await this.relationRepo.find({
      where: { subjectId },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalCount = await this.relationRepo.count({ where: { subjectId } });

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
