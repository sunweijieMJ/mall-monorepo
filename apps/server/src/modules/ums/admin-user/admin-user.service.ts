import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import { AdminUserEntity } from './infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminRoleRelationEntity } from './infrastructure/persistence/relational/entities/admin-role-relation.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

// 缓存 key，与 auth 模块保持一致
const CACHE_KEYS = {
  admin: (username: string) => `mall:admin:${username}`,
  resourceList: (adminId: number) => `mall:resourceList:${adminId}`,
};

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminRepo: Repository<AdminUserEntity>,
    @InjectRepository(AdminRoleRelationEntity)
    private readonly adminRoleRelationRepo: Repository<AdminRoleRelationEntity>,
    @InjectRepository(AdminRoleEntity)
    private readonly roleRepo: Repository<AdminRoleEntity>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly transactionService: TransactionService,
  ) {}

  /** 管理员列表 - 按 username/nickName LIKE 过滤 */
  async list(
    keyword: string,
    query: PageQueryDto,
  ): Promise<PageResult<AdminUserEntity>> {
    const qb = this.adminRepo.createQueryBuilder('admin');

    if (keyword) {
      qb.where('admin.username LIKE :keyword OR admin.nickName LIKE :keyword', {
        keyword: `%${keyword}%`,
      });
    }

    qb.skip((query.page - 1) * query.limit).take(query.limit);

    const [list, total] = await qb.getManyAndCount();
    return PageResult.of(list, total, query);
  }

  /** 根据 ID 获取管理员 */
  async getItem(id: number): Promise<AdminUserEntity> {
    const admin = await this.adminRepo.findOneBy({ id });
    if (!admin) throw new NotFoundException('管理员不存在');
    return admin;
  }

  /** 根据用户名查询（认证用） */
  async findByUsername(username: string): Promise<AdminUserEntity | null> {
    return this.adminRepo.findOneBy({ username });
  }

  /** 更新管理员 */
  async update(id: number, dto: Partial<AdminUserEntity>): Promise<number> {
    const rawAdmin = await this.adminRepo.findOneBy({ id });
    if (!rawAdmin) throw new NotFoundException('管理员不存在');

    // 密码处理逻辑：与原加密密码相同则不修改，不同则加密
    if (dto.password) {
      if (dto.password === rawAdmin.password) {
        delete dto.password;
      } else {
        dto.password = await bcrypt.hash(dto.password, 10);
      }
    } else {
      delete dto.password;
    }

    await this.adminRepo.update(id, dto);
    // 清除缓存
    await this.cacheManager.del(CACHE_KEYS.admin(rawAdmin.username));
    return 1;
  }

  /** 删除管理员 */
  async delete(id: number): Promise<number> {
    const admin = await this.adminRepo.findOneBy({ id });
    if (!admin) return 0;
    await this.adminRepo.delete(id);
    // 清除缓存
    await this.cacheManager.del(CACHE_KEYS.admin(admin.username));
    await this.cacheManager.del(CACHE_KEYS.resourceList(id));
    return 1;
  }

  /** 更新状态 */
  async updateStatus(id: number, status: number): Promise<number> {
    await this.adminRepo.update(id, { status });
    return 1;
  }

  /** 修改密码 */
  async updatePassword(dto: {
    username: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<number> {
    if (!dto.username || !dto.oldPassword || !dto.newPassword) {
      throw new BadRequestException('参数不完整');
    }

    const admin = await this.adminRepo.findOneBy({ username: dto.username });
    if (!admin) {
      throw new NotFoundException('用户不存在');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, admin.password);
    if (!isMatch) {
      throw new BadRequestException('旧密码错误');
    }

    admin.password = await bcrypt.hash(dto.newPassword, 10);
    await this.adminRepo.save(admin);
    // 清除缓存
    await this.cacheManager.del(CACHE_KEYS.admin(admin.username));
    return 1;
  }

  /** 分配角色 - 先删后插（事务保证原子性，防止删除成功插入失败导致角色丢失） */
  async updateRole(adminId: number, roleIds: number[]): Promise<number> {
    await this.transactionService.run(async (manager) => {
      await manager.delete(AdminRoleRelationEntity, { adminId });

      if (roleIds?.length) {
        const relations = roleIds.map((roleId) =>
          manager.create(AdminRoleRelationEntity, { adminId, roleId }),
        );
        await manager.save(AdminRoleRelationEntity, relations);
      }
    });

    // 清除资源缓存（事务提交后执行）
    await this.cacheManager.del(CACHE_KEYS.resourceList(adminId));
    return roleIds?.length ?? 0;
  }

  /** 获取管理员角色列表 */
  async getRoleList(adminId: number): Promise<AdminRoleEntity[]> {
    const relations = await this.adminRoleRelationRepo.find({
      where: { adminId },
    });
    const roleIds = relations.map((r) => r.roleId);
    if (!roleIds.length) return [];
    return this.roleRepo.find({ where: { id: In(roleIds) } });
  }
}
