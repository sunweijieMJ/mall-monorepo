import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
  /**
   * 聚合首页数据（移动端）
   * TODO: 迁移自 HomeController.content() + HomeService
   *   - banners（轮播广告，从 sms_home_advertise 查询 type=1 上线广告）
   *   - brands（首页品牌，从 sms_home_brand 查询 recommendStatus=1）
   *   - newProductList（新品，从 sms_home_new_product + pms_product 关联）
   *   - hotProductList（人气，从 sms_home_hot_product + pms_product 关联）
   *   - subjectList（专题，从 sms_home_subject + cms_subject 关联）
   *   - flashPromotion（当前时间段秒杀活动，从 sms_flash_promotion + sms_flash_session 查询）
   *
   * 实现要点：
   *   - 使用 Promise.all() 并行查询
   *   - 结果缓存到 Redis（TTL=300s）
   */
  async getHomeContent(): Promise<Record<string, unknown>> {
    // TODO: implement
    return {
      banners: [],
      brands: [],
      newProductList: [],
      hotProductList: [],
      subjectList: [],
      flashPromotion: null,
    };
  }
}
