/**
 * Mall 首页品牌推荐管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { HomeBrand } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/home/brand';

/**
 * 获取首页品牌推荐列表
 */
export function fetchList(
  params?: PageParams & {
    brandName?: string;
    recommendStatus?: number;
  },
) {
  return http.get<PageResult<HomeBrand>>(`${BASE_URL}/list`, { params });
}

/**
 * 更新品牌推荐状态
 */
export function updateRecommendStatus(data: {
  ids: number[];
  recommendStatus: number;
}) {
  return http.post(`${BASE_URL}/update/recommendStatus`, data);
}

/**
 * 删除首页品牌推荐
 */
export function deleteHomeBrand(data: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, data);
}

/**
 * 创建首页品牌推荐
 */
export function createHomeBrand(data: Partial<HomeBrand>[]) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新首页品牌推荐排序
 */
export function updateHomeBrandSort(params: { id: number; sort: number }) {
  return http.post(`${BASE_URL}/update/sort/${params.id}`, null, { params });
}

export default {
  fetchList,
  updateRecommendStatus,
  deleteHomeBrand,
  createHomeBrand,
  updateHomeBrandSort,
};
