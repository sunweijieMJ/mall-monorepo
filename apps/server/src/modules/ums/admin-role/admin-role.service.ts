import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRoleEntity } from './infrastructure/persistence/relational/entities/admin-role.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class AdminRoleService {
  constructor(
    @InjectRepository(AdminRoleEntity)
    private readonly roleRepo: Repository<AdminRoleEntity>,
  ) {}

  async list(query: PageQueryDto): Promise<PageResult<AdminRoleEntity>> {
    const [list, total] = await this.roleRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  async listAll(): Promise<AdminRoleEntity[]> {
    return this.roleRepo.find({ where: { status: 1 } });
  }

  async create(dto: any): Promise<AdminRoleEntity> {
    return this.roleRepo.save(dto);
  }

  async update(id: number, dto: any): Promise<void> {
    await this.roleRepo.update(id, dto);
  }

  async delete(ids: number[]): Promise<void> {
    await this.roleRepo.delete(ids);
  }

  async updateStatus(id: number, status: number): Promise<void> {
    await this.roleRepo.update(id, { status });
  }

  /** 获取角色权限（菜单）- TODO: 迁移自 UmsRoleServiceImpl.listMenu() */
  async listMenus(roleId: number): Promise<any[]> {
    // TODO: 查询 ums_role_menu_relation + ums_menu
    return [];
  }

  /** 分配菜单权限 - TODO: 迁移自 UmsRoleServiceImpl.allocMenus() */
  async allocMenus(roleId: number, menuIds: number[]): Promise<void> {
    // TODO: implement - 先删后插 ums_role_menu_relation
    throw new Error('TODO: AdminRoleService.allocMenus');
  }

  /** 获取角色资源权限 - TODO */
  async listResources(roleId: number): Promise<any[]> {
    // TODO: 查询 ums_role_resource_relation + ums_resource
    return [];
  }

  /** 分配资源权限 - TODO */
  async allocResources(roleId: number, resourceIds: number[]): Promise<void> {
    // TODO: implement
    throw new Error('TODO: AdminRoleService.allocResources');
  }
}
