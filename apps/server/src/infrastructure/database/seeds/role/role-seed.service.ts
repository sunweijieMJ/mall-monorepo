import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRoleEntity } from '@/modules/ums/admin-role/infrastructure/persistence/relational/entities/admin-role.entity';

@Injectable()
export class RoleSeedService {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    @InjectRepository(AdminRoleEntity)
    private readonly roleRepo: Repository<AdminRoleEntity>,
  ) {}

  async run(): Promise<void> {
    const count = await this.roleRepo.count();
    if (count > 0) {
      this.logger.log('角色数据已存在，跳过');
      return;
    }

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

    await this.roleRepo.save(roles.map((r) => this.roleRepo.create(r)));
    this.logger.log(`已创建 ${roles.length} 个默认角色`);
  }
}
