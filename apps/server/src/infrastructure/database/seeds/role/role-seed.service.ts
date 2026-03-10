import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { RoleMenuRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-menu-relation.entity';
import { RoleResourceRelationEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/role-resource-relation.entity';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';
import { AdminResourceEntity } from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';

@Injectable()
export class RoleSeedService {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    @InjectRepository(AdminRoleEntity)
    private readonly roleRepo: Repository<AdminRoleEntity>,
    @InjectRepository(RoleMenuRelationEntity)
    private readonly roleMenuRepo: Repository<RoleMenuRelationEntity>,
    @InjectRepository(RoleResourceRelationEntity)
    private readonly roleResourceRepo: Repository<RoleResourceRelationEntity>,
    @InjectRepository(AdminMenuEntity)
    private readonly menuRepo: Repository<AdminMenuEntity>,
    @InjectRepository(AdminResourceEntity)
    private readonly resourceRepo: Repository<AdminResourceEntity>,
  ) {}

  async run(): Promise<void> {
    // 确保角色存在
    let superRole = await this.roleRepo.findOne({
      where: { name: '超级管理员' },
    });
    if (!superRole) {
      const roles = [
        {
          name: '超级管理员',
          description: '拥有所有权限',
          adminCount: 0,
          sort: 0,
          status: 1,
        },
        {
          name: '商品管理员',
          description: '商品模块全部权限',
          adminCount: 0,
          sort: 1,
          status: 1,
        },
        {
          name: '订单管理员',
          description: '订单模块全部权限',
          adminCount: 0,
          sort: 2,
          status: 1,
        },
      ];
      const savedRoles = await this.roleRepo.save(
        roles.map((r) => this.roleRepo.create(r)),
      );
      this.logger.log(`已创建 ${savedRoles.length} 个默认角色`);
      superRole = savedRoles.find((r) => r.name === '超级管理员')!;
    }

    // 超级管理员补充分配所有未分配的菜单
    const allMenus = await this.menuRepo.find();
    if (allMenus.length > 0) {
      const existingMenuRelations = await this.roleMenuRepo.find({
        where: { roleId: superRole.id },
      });
      const assignedMenuIds = new Set(
        existingMenuRelations.map((r) => r.menuId),
      );
      const missingMenus = allMenus.filter((m) => !assignedMenuIds.has(m.id));

      if (missingMenus.length > 0) {
        await this.roleMenuRepo.save(
          missingMenus.map((m) =>
            this.roleMenuRepo.create({ roleId: superRole.id, menuId: m.id }),
          ),
        );
        this.logger.log(`超级管理员新增分配 ${missingMenus.length} 个菜单`);
      } else {
        this.logger.log('超级管理员菜单已完整，无需补充');
      }
    }

    // 超级管理员补充分配所有未分配的资源
    const allResources = await this.resourceRepo.find();
    if (allResources.length > 0) {
      const existingResourceRelations = await this.roleResourceRepo.find({
        where: { roleId: superRole.id },
      });
      const assignedResourceIds = new Set(
        existingResourceRelations.map((r) => r.resourceId),
      );
      const missingResources = allResources.filter(
        (r) => !assignedResourceIds.has(r.id),
      );

      if (missingResources.length > 0) {
        await this.roleResourceRepo.save(
          missingResources.map((r) =>
            this.roleResourceRepo.create({
              roleId: superRole.id,
              resourceId: r.id,
            }),
          ),
        );
        this.logger.log(`超级管理员新增分配 ${missingResources.length} 个资源`);
      } else {
        this.logger.log('超级管理员资源已完整，无需补充');
      }
    }
  }
}
