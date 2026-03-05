/**
 * Mall 订单设置 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { OrderSetting } from '@/interface';

const BASE_URL = '/orderSetting';

/**
 * 获取订单设置
 */
export function getOrderSetting(id: number) {
  return http.get<OrderSetting>(`${BASE_URL}/${id}`);
}

/**
 * 更新订单设置
 */
export function updateOrderSetting(id: number, data: Partial<OrderSetting>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

export default {
  getOrderSetting,
  updateOrderSetting,
};
