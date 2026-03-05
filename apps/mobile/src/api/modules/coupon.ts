import http from '../instance';
import type { Coupon, ApiResponse } from '@/interface';

const Dict = {
  fetchProductCouponList: `/member/coupon/listByProduct`,
  addMemberCoupon: `/member/coupon/add`,
  fetchMemberCouponList: `/member/coupon/list`,
} as const;

/**
 * 优惠券接口服务
 */
const CouponService = {
  /**
   * 获取产品优惠券列表
   * @param productId
   * @returns
   */
  fetchProductCouponList(productId: number) {
    return http.get<Coupon[]>(`${Dict.fetchProductCouponList}/${productId}`);
  },

  /**
   * 添加会员优惠券
   * @param couponId
   * @returns
   */
  addMemberCoupon(couponId: number) {
    return http.post<ApiResponse>(`${Dict.addMemberCoupon}/${couponId}`);
  },

  /**
   * 获取会员优惠券列表
   * @param useStatus
   * @returns
   */
  fetchMemberCouponList(useStatus: number) {
    return http.get<Coupon[]>(Dict.fetchMemberCouponList, {
      params: { useStatus },
    });
  },
};

export default CouponService;
