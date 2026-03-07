import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdminResourceEntity,
  AdminResourceCategoryEntity,
} from './infrastructure/persistence/relational/entities/admin-resource.entity';
import { AdminCacheService } from '@/core/auth/services/admin-cache.service';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class AdminResourceService {
  constructor(
    @InjectRepository(AdminResourceEntity)
    private readonly resourceRepo: Repository<AdminResourceEntity>,
    @InjectRepository(AdminResourceCategoryEntity)
    private readonly categoryRepo: Repository<AdminResourceCategoryEntity>,
    private readonly adminCacheService: AdminCacheService,
  ) {}

  // ---- 资源 CRUD ----

  /** 创建资源 */
  async create(
    dto: Partial<AdminResourceEntity>,
  ): Promise<AdminResourceEntity> {
    const saved = await this.resourceRepo.save(dto);
    // 清除全局资源缓存
    await this.adminCacheService.delAllResourceCache();
    return saved;
  }

  /** 更新资源 */
  async update(id: number, dto: Partial<AdminResourceEntity>): Promise<number> {
    await this.resourceRepo.update(id, dto);
    // 清除相关 admin 的资源缓存（委托给 AdminCacheService）
    await this.adminCacheService.delResourceListByResource(id);
    return 1;
  }

  /** 获取资源详情 */
  async getItem(id: number): Promise<AdminResourceEntity> {
    const resource = await this.resourceRepo.findOneBy({ id });
    if (!resource) throw new NotFoundException('资源不存在');
    return resource;
  }

  /** 删除资源 */
  async delete(id: number): Promise<number> {
    await this.resourceRepo.delete(id);
    // 清除相关 admin 的资源缓存（委托给 AdminCacheService）
    await this.adminCacheService.delResourceListByResource(id);
    return 1;
  }

  /** 分页查询资源 */
  async list(
    categoryId: number | undefined,
    nameKeyword: string | undefined,
    urlKeyword: string | undefined,
    query: PageQueryDto,
  ): Promise<PageResult<AdminResourceEntity>> {
    const qb = this.resourceRepo.createQueryBuilder('r');

    if (categoryId != null) {
      qb.andWhere('r.categoryId = :categoryId', { categoryId });
    }
    if (nameKeyword) {
      qb.andWhere('r.name LIKE :nameKeyword', {
        nameKeyword: `%${nameKeyword}%`,
      });
    }
    if (urlKeyword) {
      qb.andWhere('r.url LIKE :urlKeyword', {
        urlKeyword: `%${urlKeyword}%`,
      });
    }

    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  /** 获取全部资源 */
  async listAll(): Promise<AdminResourceEntity[]> {
    return this.resourceRepo.find();
  }

  // ---- 资源分类 CRUD ----

  /** 创建资源分类 */
  async createCategory(
    dto: Partial<AdminResourceCategoryEntity>,
  ): Promise<AdminResourceCategoryEntity> {
    return this.categoryRepo.save(dto);
  }

  /** 更新资源分类 */
  async updateCategory(
    id: number,
    dto: Partial<AdminResourceCategoryEntity>,
  ): Promise<number> {
    await this.categoryRepo.update(id, dto);
    return 1;
  }

  /** 删除资源分类 */
  async deleteCategory(id: number): Promise<number> {
    await this.categoryRepo.delete(id);
    return 1;
  }

  /** 获取所有资源分类 */
  async listCategory(): Promise<AdminResourceCategoryEntity[]> {
    return this.categoryRepo.find({ order: { sort: 'ASC' } });
  }
}
