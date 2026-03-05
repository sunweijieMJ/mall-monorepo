import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminMenuEntity } from '@/modules/ums/admin-menu/infrastructure/persistence/relational/entities/admin-menu.entity';

@Injectable()
export class MenuSeedService {
  private readonly logger = new Logger(MenuSeedService.name);

  constructor(
    @InjectRepository(AdminMenuEntity)
    private readonly menuRepo: Repository<AdminMenuEntity>,
  ) {}

  async run(): Promise<void> {
    const count = await this.menuRepo.count();
    if (count > 0) {
      this.logger.log('菜单数据已存在，跳过');
      return;
    }

    const menus: Partial<AdminMenuEntity>[] = [
      {
        parentId: 0,
        title: '商品',
        level: 0,
        sort: 1,
        name: 'pms',
        icon: 'product',
        hidden: '0',
      },
      {
        parentId: 0,
        title: '订单',
        level: 0,
        sort: 2,
        name: 'oms',
        icon: 'order',
        hidden: '0',
      },
      {
        parentId: 0,
        title: '营销',
        level: 0,
        sort: 3,
        name: 'sms',
        icon: 'sms',
        hidden: '0',
      },
      {
        parentId: 0,
        title: '权限',
        level: 0,
        sort: 4,
        name: 'ums',
        icon: 'ums',
        hidden: '0',
      },
    ];

    await this.menuRepo.save(menus.map((m) => this.menuRepo.create(m)));
    this.logger.log(`已创建 ${menus.length} 个根菜单`);
  }
}
