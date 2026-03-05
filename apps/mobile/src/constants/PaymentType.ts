/**
 * 支付类型常量
 */
export enum PAYMENT_TYPE {
  /** 支付宝 */
  ALIPAY = 0,
  /** 微信支付 */
  WECHAT = 1,
}

/**
 * 支付类型文本常量
 */
export const PAYMENT_TYPE_TEXT = {
  [PAYMENT_TYPE.ALIPAY]: '支付宝',
  [PAYMENT_TYPE.WECHAT]: '微信支付',
} as const;
