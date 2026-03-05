/**
 * Mall 角色管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { Role, MenuItem, Resource } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/role';

/**
 * 获取角色列表
 */
export function fetchList(params?: PageParams & { keyword?: string }) {
  return http.get<PageResult<Role>>(`${BASE_URL}/list`, { params });
}

/**
 * 创建角色
 */
export function createRole(data: Partial<Role>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新角色
 */
export function updateRole(id: number, data: Partial<Role>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 更新角色状态
 */
export function updateStatus(id: number, params: { status: number }) {
  return http.post(`${BASE_URL}/updateStatus/${id}`, null, { params });
}

/**
 * 删除角色
 */
export function deleteRole(data: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, data);
}

/**
 * 获取所有角色列表
 */
export function fetchAllRoleList() {
  return http.get<Role[]>(`${BASE_URL}/listAll`);
}

/**
 * 获取角色相关菜单
 */
export function listMenuByRole(roleId: number) {
  return http.get<MenuItem[]>(`${BASE_URL}/listMenu/${roleId}`);
}

/**
 * 获取角色相关资源
 */
export function listResourceByRole(roleId: number) {
  return http.get<Resource[]>(`${BASE_URL}/listResource/${roleId}`);
}

/**
 * 给角色分配菜单
 */
export function allocMenu(data: { roleId: number; menuIds: number[] }) {
  return http.post(`${BASE_URL}/allocMenu`, data);
}

/**
 * 给角色分配资源
 */
export function allocResource(data: { roleId: number; resourceIds: number[] }) {
  return http.post(`${BASE_URL}/allocResource`, data);
}

export default {
  fetchList,
  createRole,
  updateRole,
  updateStatus,
  deleteRole,
  fetchAllRoleList,
  listMenuByRole,
  listResourceByRole,
  allocMenu,
  allocResource,
};
