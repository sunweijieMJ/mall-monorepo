/**
 * Mall 订单管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { Order, OrderDetail, OrderListQuery } from '@/interface';
import type { PageResult } from '@/interface/common';

const BASE_URL = '/order';

/**
 * 获取订单列表
 */
export function fetchList(params: OrderListQuery) {
  return http.get<PageResult<Order>>(`${BASE_URL}/list`, { params });
}

/**
 * 关闭订单
 */
export function closeOrder(params: { ids: number[]; note: string }) {
  return http.post(`${BASE_URL}/update/close`, null, { params });
}

/**
 * 删除订单
 */
export function deleteOrder(params: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, null, { params });
}

/**
 * 订单发货项
 */
export interface DeliveryOrderItem {
  orderId: number;
  deliveryCompany: string;
  deliverySn: string;
}

/**
 * 发货（支持单个或批量）
 */
export function deliveryOrder(data: DeliveryOrderItem | DeliveryOrderItem[]) {
  return http.post(`${BASE_URL}/update/delivery`, data);
}

/**
 * 获取订单详情
 */
export function getOrderDetail(id: number) {
  return http.get<OrderDetail>(`${BASE_URL}/${id}`);
}

/**
 * 修改收货人信息
 */
export function updateReceiverInfo(data: {
  orderId: number;
  receiverName: string;
  receiverPhone: string;
  receiverPostCode: string;
  receiverDetailAddress: string;
  receiverProvince: string;
  receiverCity: string;
  receiverRegion: string;
  status: number;
}) {
  return http.post(`${BASE_URL}/update/receiverInfo`, data);
}

/**
 * 修改订单费用信息
 */
export function updateMoneyInfo(data: {
  orderId: number;
  freightAmount: number;
  discountAmount: number;
  status: number;
}) {
  return http.post(`${BASE_URL}/update/moneyInfo`, data);
}

/**
 * 修改订单备注
 */
export function updateOrderNote(params: {
  id: number;
  note: string;
  status: number;
}) {
  return http.post(`${BASE_URL}/update/note`, null, { params });
}

export default {
  fetchList,
  closeOrder,
  deleteOrder,
  deliveryOrder,
  getOrderDetail,
  updateReceiverInfo,
  updateMoneyInfo,
  updateOrderNote,
};
