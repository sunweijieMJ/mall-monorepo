/**
 * Mall 菜单管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { MenuItem } from '@/interface';
import type { PageParams } from '@/interface/common';

const BASE_URL = '/menu';

/**
 * 根据父菜单ID获取菜单列表
 */
export function fetchList(parentId: number, params?: PageParams) {
  return http.get<MenuItem[]>(`${BASE_URL}/list/${parentId}`, { params });
}

/**
 * 删除菜单
 */
export function deleteMenu(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

/**
 * 创建菜单
 */
export function createMenu(data: Partial<MenuItem>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新菜单
 */
export function updateMenu(id: number, data: Partial<MenuItem>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 获取菜单详情
 */
export function getMenu(id: number) {
  return http.get<MenuItem>(`${BASE_URL}/${id}`);
}

/**
 * 更新菜单隐藏状态
 */
export function updateHidden(id: number, params: { hidden: number }) {
  return http.post(`${BASE_URL}/updateHidden/${id}`, null, { params });
}

/**
 * 获取菜单树形列表
 */
export function fetchTreeList() {
  return http.get<MenuItem[]>(`${BASE_URL}/treeList`);
}

export default {
  fetchList,
  deleteMenu,
  createMenu,
  updateMenu,
  getMenu,
  updateHidden,
  fetchTreeList,
};
