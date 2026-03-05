/**
 * Mall 首页专题推荐管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { HomeSubject } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/home/recommendSubject';

/**
 * 获取首页专题推荐列表
 */
export function fetchList(
  params?: PageParams & {
    subjectName?: string;
    recommendStatus?: number;
  },
) {
  return http.get<PageResult<HomeSubject>>(`${BASE_URL}/list`, { params });
}

/**
 * 更新专题推荐状态
 */
export function updateRecommendStatus(data: {
  ids: number[];
  recommendStatus: number;
}) {
  return http.post(`${BASE_URL}/update/recommendStatus`, data);
}

/**
 * 删除首页专题推荐
 */
export function deleteHomeSubject(data: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, data);
}

/**
 * 创建首页专题推荐
 */
export function createHomeSubject(data: Partial<HomeSubject>[]) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新首页专题推荐排序
 */
export function updateHomeSubjectSort(params: { id: number; sort: number }) {
  return http.post(`${BASE_URL}/update/sort/${params.id}`, null, { params });
}

export default {
  fetchList,
  updateRecommendStatus,
  deleteHomeSubject,
  createHomeSubject,
  updateHomeSubjectSort,
};
