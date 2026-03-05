import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdminResourceCategoryEntity,
  AdminResourceEntity,
} from '@/modules/ums/admin-resource/infrastructure/persistence/relational/entities/admin-resource.entity';

@Injectable()
export class ResourceSeedService {
  private readonly logger = new Logger(ResourceSeedService.name);

  constructor(
    @InjectRepository(AdminResourceCategoryEntity)
    private readonly categoryRepo: Repository<AdminResourceCategoryEntity>,
    @InjectRepository(AdminResourceEntity)
    private readonly resourceRepo: Repository<AdminResourceEntity>,
  ) {}

  async run(): Promise<void> {
    const count = await this.resourceRepo.count();
    if (count > 0) {
      this.logger.log('资源数据已存在，跳过');
      return;
    }

    // 创建资源分类
    const categories = [
      { name: '商品模块', sort: 0 },
      { name: '订单模块', sort: 1 },
      { name: '营销模块', sort: 2 },
      { name: '权限模块', sort: 3 },
    ];

    const savedCategories = await this.categoryRepo.save(
      categories.map((c) => this.categoryRepo.create(c)),
    );
    this.logger.log(`已创建 ${savedCategories.length} 个资源分类`);

    // 创建资源
    const resources: Partial<AdminResourceEntity>[] = [
      {
        categoryId: savedCategories[0].id,
        name: '商品品牌管理',
        url: '/brand/**',
        description: '商品品牌的增删改查',
      },
      {
        categoryId: savedCategories[0].id,
        name: '商品属性管理',
        url: '/productAttribute/**',
        description: '商品属性的增删改查',
      },
      {
        categoryId: savedCategories[0].id,
        name: '商品分类管理',
        url: '/productCategory/**',
        description: '商品分类的增删改查',
      },
      {
        categoryId: savedCategories[1].id,
        name: '订单管理',
        url: '/order/**',
        description: '订单的查询、发货、关闭',
      },
      {
        categoryId: savedCategories[1].id,
        name: '退货申请管理',
        url: '/returnApply/**',
        description: '退货申请的处理',
      },
      {
        categoryId: savedCategories[2].id,
        name: '优惠券管理',
        url: '/coupon/**',
        description: '优惠券的增删改查',
      },
      {
        categoryId: savedCategories[2].id,
        name: '秒杀活动管理',
        url: '/flash/**',
        description: '秒杀活动的增删改查',
      },
      {
        categoryId: savedCategories[3].id,
        name: '后台用户管理',
        url: '/admin/**',
        description: '后台用户的增删改查',
      },
      {
        categoryId: savedCategories[3].id,
        name: '后台角色管理',
        url: '/role/**',
        description: '后台角色的增删改查',
      },
      {
        categoryId: savedCategories[3].id,
        name: '后台菜单管理',
        url: '/menu/**',
        description: '后台菜单的增删改查',
      },
      {
        categoryId: savedCategories[3].id,
        name: '后台资源管理',
        url: '/resource/**',
        description: '后台资源的增删改查',
      },
    ];

    await this.resourceRepo.save(
      resources.map((r) => this.resourceRepo.create(r)),
    );
    this.logger.log(`已创建 ${resources.length} 个资源`);
  }
}
