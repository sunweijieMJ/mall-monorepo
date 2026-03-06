import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_KEYS } from '@/common/constants';
import { AdminRoleEntity } from './infrastructure/persistence/relational/entities/admin-role.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { RoleMenuRelationEntity } from './infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { RoleResourceRelationEntity } from './infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class AdminRoleService {
  constructor(
    @InjectRepository(AdminRoleEntity)
    private readonly roleRepo: Repository<AdminRoleEntity>,
    @InjectRepository(AdminRoleRelationEntity)
    private readonly adminRoleRelationRepo: Repository<AdminRoleRelationEntity>,
    @InjectRepository(RoleMenuRelationEntity)
    private readonly roleMenuRelationRepo: Repository<RoleMenuRelationEntity>,
    @InjectRepository(RoleResourceRelationEntity)
    private readonly roleResourceRelationRepo: Repository<RoleResourceRelationEntity>,
    @InjectRepository(AdminMenuEntity)
    private readonly menuRepo: Repository<AdminMenuEntity>,
    @InjectRepository(AdminResourceEntity)
    private readonly resourceRepo: Repository<AdminResourceEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly transactionService: TransactionService,
  ) {}

  /** 创建角色 */
  async create(dto: Partial<AdminRoleEntity>): Promise<AdminRoleEntity> {
    dto.adminCount = 0;
    dto.sort = dto.sort ?? 0;
    return this.roleRepo.save(dto);
  }

  /** 更新角色 */
  async update(id: number, dto: Partial<AdminRoleEntity>): Promise<number> {
    await this.roleRepo.update(id, dto);
    return 1;
  }

  /** 批量删除角色 */
  async delete(ids: number[]): Promise<number> {
    const count = await this.roleRepo
      .createQueryBuilder()
      .delete()
      .where('id IN (:...ids)', { ids })
      .execute();

    // 清除相关 admin 的资源缓存
    await this.delResourceListByRoleIds(ids);
    return count.affected ?? 0;
  }

  /** 获取所有角色 */
  async listAll(): Promise<AdminRoleEntity[]> {
    return this.roleRepo.find();
  }

  /** 分页获取角色 */
  async list(
    keyword: string,
    query: PageQueryDto,
  ): Promise<PageResult<AdminRoleEntity>> {
    const where: any = {};
    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }
    const [list, total] = await this.roleRepo.findAndCount({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  /** 更新角色状态 */
  async updateStatus(id: number, status: number): Promise<number> {
    await this.roleRepo.update(id, { status });
    return 1;
  }

  /** 获取角色菜单列表 */
  async listMenu(roleId: number): Promise<AdminMenuEntity[]> {
    const relations = await this.roleMenuRelationRepo.find({
      where: { roleId },
    });
    const menuIds = relations.map((r) => r.menuId);
    if (!menuIds.length) return [];
    return this.menuRepo.find({ where: { id: In(menuIds) } });
  }

  /** 获取角色资源列表 */
  async listResource(roleId: number): Promise<AdminResourceEntity[]> {
    const relations = await this.roleResourceRelationRepo.find({
      where: { roleId },
    });
    const resourceIds = relations.map((r) => r.resourceId);
    if (!resourceIds.length) return [];
    return this.resourceRepo.find({ where: { id: In(resourceIds) } });
  }

  /** 分配菜单（事务保证原子性，防止删除成功插入失败导致菜单丢失） */
  async allocMenu(roleId: number, menuIds: number[]): Promise<number> {
    await this.transactionService.run(async (manager) => {
      await manager.delete(RoleMenuRelationEntity, { roleId });

      if (menuIds?.length) {
        const relations = menuIds.map((menuId) =>
          manager.create(RoleMenuRelationEntity, { roleId, menuId }),
        );
        await manager.save(RoleMenuRelationEntity, relations);
      }
    });
    return menuIds?.length ?? 0;
  }

  /** 分配资源（事务保证原子性，防止删除成功插入失败导致权限丢失） */
  async allocResource(roleId: number, resourceIds: number[]): Promise<number> {
    await this.transactionService.run(async (manager) => {
      await manager.delete(RoleResourceRelationEntity, { roleId });

      if (resourceIds?.length) {
        const relations = resourceIds.map((resourceId) =>
          manager.create(RoleResourceRelationEntity, { roleId, resourceId }),
        );
        await manager.save(RoleResourceRelationEntity, relations);
      }
    });

    // 清除受影响的 admin 缓存（事务提交后执行）
    await this.delResourceListByRoleIds([roleId]);
    return resourceIds?.length ?? 0;
  }

  /** 获取管理员菜单列表（通过 adminId -> roleIds -> menuIds） */
  async getMenuList(adminId: number): Promise<AdminMenuEntity[]> {
    const roleRelations = await this.adminRoleRelationRepo.find({
      where: { adminId },
    });
    const roleIds = roleRelations.map((r) => r.roleId);
    if (!roleIds.length) return [];

    const menuRelations = await this.roleMenuRelationRepo.find({
      where: { roleId: In(roleIds) },
    });
    const menuIds = [...new Set(menuRelations.map((r) => r.menuId))];
    if (!menuIds.length) return [];

    return this.menuRepo.find({ where: { id: In(menuIds) } });
  }

  /** 清除多个角色下所有 admin 的资源权限缓存 */
  private async delResourceListByRoleIds(roleIds: number[]): Promise<void> {
    if (!roleIds.length) return;
    const relations = await this.adminRoleRelationRepo.find({
      where: { roleId: In(roleIds) },
    });
    // 并行清除缓存，避免顺序 await 导致的性能问题
    await Promise.all(
      relations.map((rel) =>
        this.cacheManager.del(CACHE_KEYS.resourceList(rel.adminId)),
      ),
    );
  }
}
