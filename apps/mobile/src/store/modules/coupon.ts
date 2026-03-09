import { defineStore } from 'pinia';
import {
  memberCouponControllerCreateV1,
  memberCouponControllerListMemberCouponsV1,
  memberCouponControllerListCouponsByProductV1,
  portalCouponControllerListAvailableCouponsV1,
} from '@/api';
import type {
  MemberCouponControllerListMemberCouponsV1Params,
  PortalCouponControllerListAvailableCouponsV1Params,
} from '@/api';

export const useCouponStore = defineStore('coupon', () => {
  /** 获取我的优惠券历史列表 */
  async function fetchMemberList(
    params?: MemberCouponControllerListMemberCouponsV1Params,
  ) {
    const res = await memberCouponControllerListMemberCouponsV1(params);
    return res.data ?? null;
  }

  /** 获取商品相关可用优惠券 */
  async function fetchProductCoupons(productId: number) {
    const res = await memberCouponControllerListCouponsByProductV1(productId);
    return res.data ?? null;
  }

  /** 领取优惠券 */
  async function addCoupon(couponId: number) {
    const res = await memberCouponControllerCreateV1(couponId);
    return res.data ?? null;
  }

  /** 获取可领取的优惠券列表（领券中心） */
  async function fetchAvailableList(
    params?: PortalCouponControllerListAvailableCouponsV1Params,
  ) {
    const res = await portalCouponControllerListAvailableCouponsV1(params);
    return res.data ?? null;
  }

  return {
    fetchMemberList,
    fetchProductCoupons,
    addCoupon,
    fetchAvailableList,
  };
});
