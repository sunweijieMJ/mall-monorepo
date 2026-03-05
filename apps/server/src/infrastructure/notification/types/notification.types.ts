export enum NotificationChannel {
  /** 站内信 */
  IN_APP = 'in_app',
  /** 短信 */
  SMS = 'sms',
  /** 邮件 */
  EMAIL = 'email',
}

export enum NotificationEvent {
  /** 订单创建 */
  ORDER_CREATED = 'order.created',
  /** 订单支付成功 */
  ORDER_PAID = 'order.paid',
  /** 订单发货 */
  ORDER_SHIPPED = 'order.shipped',
  /** 订单完成 */
  ORDER_COMPLETED = 'order.completed',
  /** 退货申请审核 */
  RETURN_APPROVED = 'return.approved',
  /** 优惠券到期提醒 */
  COUPON_EXPIRING = 'coupon.expiring',
}

export interface NotificationPayload {
  /** 通知事件类型 */
  event: NotificationEvent;
  /** 接收人 ID (memberId) */
  recipientId: number;
  /** 通知渠道 */
  channel: NotificationChannel;
  /** 通知标题 */
  title: string;
  /** 通知内容 */
  content: string;
  /** 额外数据 (JSON) */
  metadata?: Record<string, unknown>;
}
