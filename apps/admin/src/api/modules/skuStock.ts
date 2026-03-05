/**
 * Mall SKU库存管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { SkuStock } from '@/interface';

const BASE_URL = '/sku';

/**
 * 获取SKU库存列表
 */
export function fetchList(pid: number, params?: { keyword?: string }) {
  return http.get<SkuStock[]>(`${BASE_URL}/${pid}`, { params });
}

/**
 * 更新SKU库存
 */
export function update(pid: number, data: SkuStock[]) {
  return http.post(`${BASE_URL}/update/${pid}`, data);
}

export default {
  fetchList,
  update,
};
