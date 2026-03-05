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

/**
 * 优惠券状态常量
 */
export enum COUPON_STATUS {
  /** 未使用 */
  UNUSED = 0,
  /** 已使用 */
  USED = 1,
  /** 已过期 */
  EXPIRED = 2,
}

/**
 * 优惠券状态文本常量
 */
export const COUPON_STATUS_TEXT = {
  [COUPON_STATUS.UNUSED]: '未使用',
  [COUPON_STATUS.USED]: '已使用',
  [COUPON_STATUS.EXPIRED]: '已过期',
} as const;
