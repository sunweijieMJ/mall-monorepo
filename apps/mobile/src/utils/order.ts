import {
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  ORDER_STATUS_COLORS,
} from '@/constants/OrderStatus';

/**
 * 格式化订单状态文本
 * 将数字状态码转换为可读的状态文本
 * @param {number} status - 订单状态码
 * @returns {string} 状态文本，如果状态未知则返回"未知状态"
 */
export const formatOrderStatus = (status: number): string => {
  return (
    ORDER_STATUS_TEXT[status as keyof typeof ORDER_STATUS_TEXT] || '未知状态'
  );
};

/**
 * 获取订单状态颜色
 * 根据订单状态返回对应的显示颜色
 * @param {number} status - 订单状态码
 * @returns {string} 状态颜色的十六进制值，默认为 '#999999'

 */
export const getOrderStatusColor = (status: number): string => {
  return (
    ORDER_STATUS_COLORS[status as keyof typeof ORDER_STATUS_COLORS] || '#999999'
  );
};

/**
 * 判断订单是否可以取消
 * 只有待付款状态的订单才可以取消
 * @param {number} status - 订单状态码
 * @returns {boolean} 是否可以取消订单
 */
export const canCancelOrder = (status: number): boolean => {
  return status === ORDER_STATUS.WAITING_PAYMENT;
};

/**
 * 判断订单是否可以支付
 * 只有待付款状态的订单才可以支付
 * @param {number} status - 订单状态码
 * @returns {boolean} 是否可以支付订单
 */
export const canPayOrder = (status: number): boolean => {
  return status === ORDER_STATUS.WAITING_PAYMENT;
};

/**
 * 判断订单是否可以确认收货
 * 只有待收货状态的订单才可以确认收货
 * @param {number} status - 订单状态码
 * @returns {boolean} 是否可以确认收货
 */
export const canConfirmReceive = (status: number): boolean => {
  return status === ORDER_STATUS.WAITING_RECEIVE;
};

/**
 * 判断订单是否可以删除
 * 只有已完成或已关闭状态的订单才可以删除
 * @param {number} status - 订单状态码
 * @returns {boolean} 是否可以删除订单
 */
export const canDeleteOrder = (status: number): boolean => {
  return status === ORDER_STATUS.COMPLETED || status === ORDER_STATUS.CLOSED;
};

/**
 * 获取订单操作按钮配置
 * 根据订单状态返回可用的操作按钮配置列表
 * @param {number} status - 订单状态码
 * @returns {Array<Object>} 按钮配置数组
 * @returns {string} returns[].text - 按钮文本
 * @returns {string} returns[].type - 按钮类型 ('primary'|'default'|'danger')
 * @returns {string} returns[].action - 按钮操作类型 ('pay'|'cancel'|'confirm'|'delete'|'detail')
 */
export const getOrderActions = (status: number) => {
  const actions = [];

  if (canPayOrder(status)) {
    actions.push({
      text: '立即支付',
      type: 'primary',
      action: 'pay',
    });
  }

  if (canCancelOrder(status)) {
    actions.push({
      text: '取消订单',
      type: 'default',
      action: 'cancel',
    });
  }

  if (canConfirmReceive(status)) {
    actions.push({
      text: '确认收货',
      type: 'primary',
      action: 'confirm',
    });
  }

  if (canDeleteOrder(status)) {
    actions.push({
      text: '删除订单',
      type: 'danger',
      action: 'delete',
    });
  }

  // 查看详情按钮始终显示
  actions.unshift({
    text: '查看详情',
    type: 'default',
    action: 'detail',
  });

  return actions;
};
