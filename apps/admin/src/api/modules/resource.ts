/**
 * Mall 资源管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { Resource } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/resource';

/**
 * 获取资源列表
 */
export function fetchList(
  params?: PageParams & {
    categoryId?: number;
    nameKeyword?: string;
    urlKeyword?: string;
  },
) {
  return http.get<PageResult<Resource>>(`${BASE_URL}/list`, { params });
}

/**
 * 创建资源
 */
export function createResource(data: Partial<Resource>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新资源
 */
export function updateResource(id: number, data: Partial<Resource>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 删除资源
 */
export function deleteResource(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

/**
 * 获取所有资源列表
 */
export function fetchAllResourceList() {
  return http.get<Resource[]>(`${BASE_URL}/listAll`);
}

export default {
  fetchList,
  createResource,
  updateResource,
  deleteResource,
  fetchAllResourceList,
};
