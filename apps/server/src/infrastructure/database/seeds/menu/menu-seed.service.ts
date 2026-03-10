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
    // 先确保根菜单存在
    const rootDefs = [
      { name: 'pms', title: '商品', icon: 'product', sort: 1 },
      { name: 'oms', title: '订单', icon: 'order', sort: 2 },
      { name: 'sms', title: '营销', icon: 'sms', sort: 3 },
      { name: 'ums', title: '权限', icon: 'ums', sort: 4 },
    ];

    const rootMenus: AdminMenuEntity[] = [];
    for (const def of rootDefs) {
      let menu = await this.menuRepo.findOne({
        where: { name: def.name, parentId: 0 },
      });
      if (!menu) {
        menu = await this.menuRepo.save(
          this.menuRepo.create({ parentId: 0, level: 0, hidden: 0, ...def }),
        );
        this.logger.log(`创建根菜单: ${def.name}`);
      }
      rootMenus.push(menu);
    }

    const pmsId = rootMenus.find((m) => m.name === 'pms')!.id;
    const omsId = rootMenus.find((m) => m.name === 'oms')!.id;
    const smsId = rootMenus.find((m) => m.name === 'sms')!.id;
    const umsId = rootMenus.find((m) => m.name === 'ums')!.id;

    // 子菜单定义（name 与前端路由 name 一一对应，不区分大小写）
    const childDefs: Partial<AdminMenuEntity>[] = [
      // PMS
      {
        parentId: pmsId,
        title: '商品列表',
        level: 1,
        sort: 1,
        name: 'Product',
        icon: 'product-list',
        hidden: 0,
      },
      {
        parentId: pmsId,
        title: '商品分类',
        level: 1,
        sort: 2,
        name: 'ProductCate',
        icon: 'product-cate',
        hidden: 0,
      },
      {
        parentId: pmsId,
        title: '商品类型',
        level: 1,
        sort: 3,
        name: 'ProductAttr',
        icon: 'product-attr',
        hidden: 0,
      },
      {
        parentId: pmsId,
        title: '品牌管理',
        level: 1,
        sort: 4,
        name: 'Brand',
        icon: 'product-brand',
        hidden: 0,
      },
      // OMS
      {
        parentId: omsId,
        title: '订单列表',
        level: 1,
        sort: 1,
        name: 'Order',
        icon: 'product-list',
        hidden: 0,
      },
      {
        parentId: omsId,
        title: '订单设置',
        level: 1,
        sort: 2,
        name: 'OrderSetting',
        icon: 'order-setting',
        hidden: 0,
      },
      {
        parentId: omsId,
        title: '退货申请处理',
        level: 1,
        sort: 3,
        name: 'ReturnApply',
        icon: 'order-return',
        hidden: 0,
      },
      {
        parentId: omsId,
        title: '退货原因设置',
        level: 1,
        sort: 4,
        name: 'ReturnReason',
        icon: 'order-return-reason',
        hidden: 0,
      },
      // SMS
      {
        parentId: smsId,
        title: '秒杀活动列表',
        level: 1,
        sort: 1,
        name: 'Flash',
        icon: 'sms-flash',
        hidden: 0,
      },
      {
        parentId: smsId,
        title: '优惠券列表',
        level: 1,
        sort: 2,
        name: 'Coupon',
        icon: 'sms-coupon',
        hidden: 0,
      },
      {
        parentId: smsId,
        title: '品牌推荐',
        level: 1,
        sort: 3,
        name: 'HomeBrand',
        icon: 'product-brand',
        hidden: 0,
      },
      {
        parentId: smsId,
        title: '新品推荐',
        level: 1,
        sort: 4,
        name: 'HomeNew',
        icon: 'sms-new',
        hidden: 0,
      },
      {
        parentId: smsId,
        title: '人气推荐',
        level: 1,
        sort: 5,
        name: 'HomeHot',
        icon: 'sms-hot',
        hidden: 0,
      },
      {
        parentId: smsId,
        title: '专题推荐',
        level: 1,
        sort: 6,
        name: 'HomeSubject',
        icon: 'sms-subject',
        hidden: 0,
      },
      {
        parentId: smsId,
        title: '广告列表',
        level: 1,
        sort: 7,
        name: 'HomeAdvertise',
        icon: 'sms-ad',
        hidden: 0,
      },
      // UMS
      {
        parentId: umsId,
        title: '用户列表',
        level: 1,
        sort: 1,
        name: 'Admin',
        icon: 'ums-admin',
        hidden: 0,
      },
      {
        parentId: umsId,
        title: '角色列表',
        level: 1,
        sort: 2,
        name: 'Role',
        icon: 'ums-role',
        hidden: 0,
      },
      {
        parentId: umsId,
        title: '菜单列表',
        level: 1,
        sort: 3,
        name: 'Menu',
        icon: 'ums-menu',
        hidden: 0,
      },
      {
        parentId: umsId,
        title: '资源列表',
        level: 1,
        sort: 4,
        name: 'Resource',
        icon: 'ums-resource',
        hidden: 0,
      },
    ];

    let created = 0;
    for (const def of childDefs) {
      const exists = await this.menuRepo.findOne({
        where: { name: def.name, parentId: def.parentId },
      });
      if (!exists) {
        await this.menuRepo.save(this.menuRepo.create(def));
        created++;
      }
    }

    if (created > 0) {
      this.logger.log(`已创建 ${created} 个子菜单`);
    } else {
      this.logger.log('菜单数据已完整，无需补充');
    }
  }
}
