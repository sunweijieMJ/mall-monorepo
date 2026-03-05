import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  AdminResourceEntity,
  AdminResourceCategoryEntity,
} from './infrastructure/persistence/relational/entities/admin-resource.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class AdminResourceService {
  constructor(
    @InjectRepository(AdminResourceEntity)
    private readonly resourceRepo: Repository<AdminResourceEntity>,
    @InjectRepository(AdminResourceCategoryEntity)
    private readonly categoryRepo: Repository<AdminResourceCategoryEntity>,
    @InjectRepository(RoleResourceRelationEntity)
    private readonly roleResourceRelationRepo: Repository<RoleResourceRelationEntity>,
    @InjectRepository(AdminRoleRelationEntity)
    private readonly adminRoleRelationRepo: Repository<AdminRoleRelationEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // ---- 资源 CRUD ----

  /** 创建资源 */
  async create(
    dto: Partial<AdminResourceEntity>,
  ): Promise<AdminResourceEntity> {
    const saved = await this.resourceRepo.save(dto);
    // 清除全局资源缓存
    await this.cacheManager.del('mall:resourceList:all');
    return saved;
  }

  /** 更新资源 */
  async update(id: number, dto: Partial<AdminResourceEntity>): Promise<number> {
    await this.resourceRepo.update(id, dto);
    // 清除相关 admin 的资源缓存
    await this.delResourceListByResource(id);
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
    // 清除相关 admin 的资源缓存
    await this.delResourceListByResource(id);
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

  // ---- 私有方法 ----

  /** 清除指定资源关联的所有 admin 的资源权限缓存 */
  private async delResourceListByResource(resourceId: number): Promise<void> {
    const roleRelations = await this.roleResourceRelationRepo.find({
      where: { resourceId },
    });
    const roleIds = roleRelations.map((r) => r.roleId);
    if (!roleIds.length) {
      await this.cacheManager.del('mall:resourceList:all');
      return;
    }

    const adminRelations = await this.adminRoleRelationRepo.find({
      where: { roleId: In(roleIds) },
    });
    for (const rel of adminRelations) {
      await this.cacheManager.del(`mall:resourceList:${rel.adminId}`);
    }
    await this.cacheManager.del('mall:resourceList:all');
  }
}
