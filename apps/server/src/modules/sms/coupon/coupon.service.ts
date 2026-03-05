import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CouponEntity } from './infrastructure/persistence/relational/entities/coupon.entity';
import { PageQueryDto, PageResult } from '@/common/dto/page-result.dto';

@Injectable()
export class CouponService {
  constructor(
    @InjectRepository(CouponEntity)
    private readonly repo: Repository<CouponEntity>,
  ) {}

  /** 分页列表 - TODO: 迁移自 SmsCouponServiceImpl.list() */
  async list(query: PageQueryDto & any): Promise<PageResult<CouponEntity>> {
    const [list, total] = await this.repo.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { id: 'DESC' },
    });
    return PageResult.of(list, total, query);
  }

  /** 创建优惠券 - TODO: 迁移自 SmsCouponServiceImpl.create()，包含商品/分类关联 */
  async create(dto: any): Promise<CouponEntity> {
    // TODO: implement - 含 coupon_product_relation / coupon_product_category_relation 写入
    throw new Error('TODO: CouponService.create');
  }

  /** 获取详情（含关联商品）- TODO */
  async detail(id: number): Promise<any> {
    // TODO: implement - 返回 SmsCouponParam（coupon + productList + productCategoryList）
    throw new Error('TODO: CouponService.detail');
  }

  /** 更新 - TODO */
  async update(id: number, dto: any): Promise<void> {
    // TODO: implement
    throw new Error('TODO: CouponService.update');
  }

  /** 删除 - TODO */
  async delete(ids: number[]): Promise<void> {
    await this.repo.delete(ids);
  }

  /** 领取记录 - TODO: 迁移自 SmsCouponHistoryServiceImpl */
  async listHistory(couponId: number, query: PageQueryDto & any): Promise<any> {
    // TODO: implement - 查询 sms_coupon_history 表
    return { list: [], total: 0 };
  }
}
