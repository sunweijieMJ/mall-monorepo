/**
 * Mall 首页人气推荐管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { HotProduct } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/home/recommendProduct';

/**
 * 获取人气推荐列表
 */
export function fetchList(
  params?: PageParams & {
    productName?: string;
    recommendStatus?: number;
  },
) {
  return http.get<PageResult<HotProduct>>(`${BASE_URL}/list`, { params });
}

/**
 * 更新人气推荐状态
 */
export function updateRecommendStatus(data: {
  ids: number[];
  recommendStatus: number;
}) {
  return http.post(`${BASE_URL}/update/recommendStatus`, data);
}

/**
 * 删除人气推荐
 */
export function deleteHotProduct(data: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, data);
}

/**
 * 创建人气推荐
 */
export function createHotProduct(data: Partial<HotProduct>[]) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新人气推荐排序
 */
export function updateHotProductSort(params: { id: number; sort: number }) {
  return http.post(`${BASE_URL}/update/sort/${params.id}`, null, { params });
}

export default {
  fetchList,
  updateRecommendStatus,
  deleteHotProduct,
  createHotProduct,
  updateHotProductSort,
};
