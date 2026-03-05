import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUserEntity } from './infrastructure/persistence/relational/entities/admin-user.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminRepo: Repository<AdminUserEntity>,
  ) {}

  /** 管理员列表 - TODO: 迁移自 UmsAdminServiceImpl.list() */
  async list(
    keyword: string,
    query: PageQueryDto,
  ): Promise<PageResult<AdminUserEntity>> {
    // TODO: implement keyword 搜索
    const [list, total] = await this.adminRepo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    });
    return PageResult.of(list, total, query);
  }

  /** 根据用户名查询（认证用）- TODO */
  async findByUsername(username: string): Promise<AdminUserEntity | null> {
    return this.adminRepo.findOneBy({ username });
  }

  /** 创建管理员 - TODO: 迁移自 UmsAdminServiceImpl.create() - 密码 BCrypt 加密 */
  async create(dto: any): Promise<AdminUserEntity> {
    // TODO: implement - bcrypt.hash(password, 10)
    throw new Error('TODO: AdminUserService.create');
  }

  /** 更新管理员 - TODO */
  async update(id: number, dto: any): Promise<void> {
    // TODO: implement
    throw new Error('TODO: AdminUserService.update');
  }

  /** 删除管理员 - TODO */
  async delete(ids: number[]): Promise<void> {
    await this.adminRepo.delete(ids);
  }

  /** 更新状态 - TODO */
  async updateStatus(id: number, status: number): Promise<void> {
    await this.adminRepo.update(id, { status });
  }

  /** 获取角色列表 - TODO: 迁移自 UmsAdminServiceImpl.getRoleList() */
  async getRoles(adminId: number): Promise<any[]> {
    // TODO: implement - 查询 ums_admin_role_relation
    return [];
  }

  /** 分配角色 - TODO */
  async assignRoles(adminId: number, roleIds: number[]): Promise<void> {
    // TODO: implement - 更新 ums_admin_role_relation
    throw new Error('TODO: AdminUserService.assignRoles');
  }

  /** 修改密码 - TODO */
  async updatePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    // TODO: implement - 验证旧密码后更新
    throw new Error('TODO: AdminUserService.updatePassword');
  }
}
