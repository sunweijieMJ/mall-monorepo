/**
 * 订单状态常量
 */
export enum ORDER_STATUS {
  /** 等待付款 */
  WAITING_PAYMENT = 0,
  /** 等待发货 */
  WAITING_DELIVERY = 1,
  /** 等待收货 */
  WAITING_RECEIVE = 2,
  /** 交易完成 */
  COMPLETED = 3,
  /** 交易关闭 */
  CLOSED = 4,
}

/**
 * 订单状态文本常量
 */
export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.WAITING_PAYMENT]: '等待付款',
  [ORDER_STATUS.WAITING_DELIVERY]: '等待发货',
  [ORDER_STATUS.WAITING_RECEIVE]: '等待收货',
  [ORDER_STATUS.COMPLETED]: '交易完成',
  [ORDER_STATUS.CLOSED]: '交易关闭',
} as const;

/**
 * 订单状态颜色常量
 */
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.WAITING_PAYMENT]: 'var(--color-order-waiting-payment)',
  [ORDER_STATUS.WAITING_DELIVERY]: 'var(--color-order-waiting-delivery)',
  [ORDER_STATUS.WAITING_RECEIVE]: 'var(--color-order-waiting-receive)',
  [ORDER_STATUS.COMPLETED]: 'var(--color-order-completed)',
  [ORDER_STATUS.CLOSED]: 'var(--color-order-closed)',
} as const;
