import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { CACHE_KEYS, CACHE_TTL_MS } from '@/common/constants';

@Injectable()
export class AdminCacheService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(AdminRoleRelationEntity)
    private readonly adminRoleRelationRepo: Repository<AdminRoleRelationEntity>,
    @InjectRepository(RoleResourceRelationEntity)
    private readonly roleResourceRelationRepo: Repository<RoleResourceRelationEntity>,
    @InjectRepository(AdminResourceEntity)
    private readonly resourceRepo: Repository<AdminResourceEntity>,
  ) {}

  private adminKey(username: string) {
    return CACHE_KEYS.admin(username);
  }

  private resourceListKey(adminId: number) {
    return CACHE_KEYS.resourceList(adminId);
  }

  private allResourceKey() {
    return CACHE_KEYS.resourceListAll();
  }

  /** 清除指定 admin 的资源权限缓存 */
  async delResourceList(adminId: number): Promise<void> {
    await this.cacheManager.del(this.resourceListKey(adminId));
  }

  /** 清除角色下所有 admin 的资源权限缓存 */
  async delResourceListByRole(roleId: number): Promise<void> {
    const relations = await this.adminRoleRelationRepo.find({
      where: { roleId },
    });
    await Promise.all(
      relations.map((rel) =>
        this.cacheManager.del(this.resourceListKey(rel.adminId)),
      ),
    );
  }

  /** 清除多个角色下所有 admin 的资源权限缓存 */
  async delResourceListByRoleIds(roleIds: number[]): Promise<void> {
    if (!roleIds.length) return;
    const relations = await this.adminRoleRelationRepo.find({
      where: { roleId: In(roleIds) },
    });
    await Promise.all(
      relations.map((rel) =>
        this.cacheManager.del(this.resourceListKey(rel.adminId)),
      ),
    );
  }

  /** 清除指定资源关联的所有 admin 的资源权限缓存 */
  async delResourceListByResource(resourceId: number): Promise<void> {
    const roleRelations = await this.roleResourceRelationRepo.find({
      where: { resourceId },
    });
    const roleIds = roleRelations.map((r) => r.roleId);
    if (!roleIds.length) return;
    await this.delResourceListByRoleIds(roleIds);
    await this.cacheManager.del(this.allResourceKey());
  }

  /** 清全局资源表缓存（资源增删改时调用） */
  async delAllResourceCache(): Promise<void> {
    await this.cacheManager.del(this.allResourceKey());
  }

  /** 获取指定 admin 的资源列表（先缓存，后 DB） */
  async getResourceList(adminId: number): Promise<AdminResourceEntity[]> {
    const cached = await this.cacheManager.get<AdminResourceEntity[]>(
      this.resourceListKey(adminId),
    );
    if (cached) return cached;

    // 联表查询：admin -> roles -> resources
    const roleRelations = await this.adminRoleRelationRepo.find({
      where: { adminId },
    });
    const roleIds = roleRelations.map((r) => r.roleId);
    if (!roleIds.length) return [];

    const resourceRelations = await this.roleResourceRelationRepo.find({
      where: { roleId: In(roleIds) },
    });
    const resourceIds = [
      ...new Set(resourceRelations.map((r) => r.resourceId)),
    ];
    if (!resourceIds.length) return [];

    const resources = await this.resourceRepo.find({
      where: { id: In(resourceIds) },
    });
    await this.cacheManager.set(
      this.resourceListKey(adminId),
      resources,
      CACHE_TTL_MS,
    );
    return resources;
  }

  /** 获取全部资源（URL pattern -> resourceId:name 映射，用于动态权限） */
  async getAllResourceMap(): Promise<Map<string, string>> {
    const cached = await this.cacheManager.get<
      Array<{ url: string; id: number; name: string }>
    >(this.allResourceKey());
    const resources = cached ?? (await this.resourceRepo.find());
    if (!cached) {
      await this.cacheManager.set(
        this.allResourceKey(),
        resources,
        CACHE_TTL_MS,
      );
    }
    const map = new Map<string, string>();
    for (const r of resources) {
      if (r.url) map.set(r.url, `${r.id}:${r.name}`);
    }
    return map;
  }
}
