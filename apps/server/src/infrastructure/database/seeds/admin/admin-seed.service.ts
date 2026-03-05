import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AdminUserEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-user.entity';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';
import { AdminRoleRelationEntity } from '@/modules/ums/admin-user/infrastructure/persistence/relational/entities/admin-role-relation.entity';

@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectRepository(AdminUserEntity)
    private readonly adminRepo: Repository<AdminUserEntity>,
    @InjectRepository(AdminRoleEntity)
    private readonly roleRepo: Repository<AdminRoleEntity>,
    @InjectRepository(AdminRoleRelationEntity)
    private readonly roleRelationRepo: Repository<AdminRoleRelationEntity>,
  ) {}

  async run(): Promise<void> {
    const count = await this.adminRepo.count();
    if (count > 0) {
      this.logger.log('管理员数据已存在，跳过');
      return;
    }

    // 创建默认管理员，密码使用 bcrypt 加密
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await this.adminRepo.save(
      this.adminRepo.create({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@mall.com',
        nickName: '系统管理员',
        status: 1,
      }),
    );

    // 关联超级管理员角色（第一个角色）
    const superRole = await this.roleRepo.findOne({
      where: { name: '超级管理员' },
    });
    if (superRole) {
      await this.roleRelationRepo.save(
        this.roleRelationRepo.create({
          adminId: admin.id,
          roleId: superRole.id,
        }),
      );
    }

    this.logger.log('已创建默认管理员: admin / admin123');
  }
}
