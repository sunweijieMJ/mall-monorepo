/**
 * Mall 首页新品推荐管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { NewProduct } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/home/newProduct';

/**
 * 获取新品推荐列表
 */
export function fetchList(
  params?: PageParams & {
    productName?: string;
    recommendStatus?: number;
  },
) {
  return http.get<PageResult<NewProduct>>(`${BASE_URL}/list`, { params });
}

/**
 * 更新新品推荐状态
 */
export function updateRecommendStatus(data: {
  ids: number[];
  recommendStatus: number;
}) {
  return http.post(`${BASE_URL}/update/recommendStatus`, data);
}

/**
 * 删除新品推荐
 */
export function deleteNewProduct(data: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, data);
}

/**
 * 创建新品推荐
 */
export function createNewProduct(data: Partial<NewProduct>[]) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新新品推荐排序
 */
export function updateNewProductSort(params: { id: number; sort: number }) {
  return http.post(`${BASE_URL}/update/sort/${params.id}`, null, { params });
}

export default {
  fetchList,
  updateRecommendStatus,
  deleteNewProduct,
  createNewProduct,
  updateNewProductSort,
};
