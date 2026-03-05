/**
 * Mall 资源分类管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { ResourceCategory } from '@/interface';

const BASE_URL = '/resourceCategory';

/**
 * 获取所有资源分类
 */
export function listAllCate() {
  return http.get<ResourceCategory[]>(`${BASE_URL}/listAll`);
}

/**
 * 创建资源分类
 */
export function createResourceCategory(data: Partial<ResourceCategory>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新资源分类
 */
export function updateResourceCategory(
  id: number,
  data: Partial<ResourceCategory>,
) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 删除资源分类
 */
export function deleteResourceCategory(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

export default {
  listAllCate,
  createResourceCategory,
  updateResourceCategory,
  deleteResourceCategory,
};
