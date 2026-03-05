import { COUPON_USE_TYPE_TEXT } from '@/constants/CouponType';

/**
 * 格式化优惠券使用类型
 * 将数字类型码转换为可读的使用类型文本
 * @param {number} useType - 使用类型码
 * @returns {string} 使用类型文本，如果类型未知则返回"未知类型"
 */
export const formatCouponUseType = (useType: number): string => {
  return (
    COUPON_USE_TYPE_TEXT[useType as keyof typeof COUPON_USE_TYPE_TEXT] ||
    '未知类型'
  );
};

/**
 * 格式化优惠券面额显示
 * 根据优惠券类型格式化面额显示文本
 * @param {Object} coupon - 优惠券信息对象
 * @param {number} coupon.type - 优惠券类型 (0: 满减券, 1: 折扣券)
 * @param {number} coupon.amount - 优惠券面额
 * @returns {string} 格式化后的面额显示文本
 */
export const formatCouponAmount = (coupon: {
  type: number;
  amount: number;
}): string => {
  // 满减券
  if (coupon.type === 0) {
    return `${coupon.amount}元`;
  }

  // 折扣券
  if (coupon.type === 1) {
    return `${coupon.amount / 10}折`;
  }

  return `${coupon.amount}`;
};

/**
 * 获取优惠券颜色主题
 * 根据优惠券类型返回对应的颜色主题配置
 * @param {Object} coupon - 优惠券信息对象
 * @param {number} coupon.type - 优惠券类型 (0: 满减券, 1: 折扣券)
 * @returns {Object} 颜色主题对象
 * @returns {string} returns.primary - 主色调
 * @returns {string} returns.secondary - 次要颜色/背景色
 * @returns {string} returns.text - 文字颜色
 */
export const getCouponTheme = (coupon: { type: number }) => {
  // 满减券 - 红色主题
  if (coupon.type === 0) {
    return {
      primary: 'var(--color-coupon-discount-primary)',
      secondary: 'var(--color-coupon-discount-secondary)',
      text: 'var(--color-white)',
    };
  }

  // 折扣券 - 蓝色主题
  if (coupon.type === 1) {
    return {
      primary: 'var(--color-coupon-reduction-primary)',
      secondary: 'var(--color-coupon-reduction-secondary)',
      text: 'var(--color-white)',
    };
  }

  // 默认主题
  return {
    primary: 'var(--color-coupon-default-primary)',
    secondary: 'var(--color-coupon-default-secondary)',
    text: 'var(--color-white)',
  };
};
