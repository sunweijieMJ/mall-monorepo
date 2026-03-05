import { BaseEntity } from './Common';

/**
 * 优惠券信息接口
 */
export interface Coupon extends BaseEntity {
  /** 优惠券类型 0-满减券 1-折扣券 */
  type: number;
  /** 优惠券名称 */
  name: string;
  /** 使用平台 0-全平台 1-移动端 2-PC端 */
  platform: number;
  /** 发放数量 */
  count?: number;
  /** 优惠券面额或折扣 */
  amount: number;
  /** 每人限领张数 */
  perLimit?: number;
  /** 最低使用积分 */
  minPoint?: number;
  /** 使用开始时间 */
  startTime?: string;
  /** 使用结束时间 */
  endTime?: string;
  /** 使用类型 0-全场通用 1-指定分类 2-指定商品 */
  useType: number;
  /** 使用说明 */
  note?: string;
  /** 发放数量 */
  publishCount?: number;
  /** 使用数量 */
  useCount?: number;
  /** 领取数量 */
  receiveCount?: number;
  /** 可以领取的时间 */
  enableTime?: string;
  /** 优惠码 */
  code?: string;
  /** 可领取的会员等级 */
  memberLevel?: number;
}
