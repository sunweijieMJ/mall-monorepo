/**
 * 优惠券类型常量
 */
export enum COUPON_USE_TYPE {
  /** 全场通用 */
  ALL = 0,
  /** 指定分类商品可用 */
  CATEGORY = 1,
  /** 指定商品可用 */
  PRODUCT = 2,
}

/**
 * 优惠券使用类型文本常量
 */
export const COUPON_USE_TYPE_TEXT = {
  [COUPON_USE_TYPE.ALL]: '全场通用',
  [COUPON_USE_TYPE.CATEGORY]: '指定分类商品可用',
  [COUPON_USE_TYPE.PRODUCT]: '指定商品可用',
} as const;
