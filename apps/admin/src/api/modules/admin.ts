/**
 * Mall 登录相关 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { LoginResponse, UserInfo, Admin } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/admin';

/**
 * 登录
 */
export function login(username: string, password: string) {
  return http.post<LoginResponse>(`${BASE_URL}/login`, {
    username,
    password,
  });
}

/**
 * 获取当前登录用户信息
 */
export function getInfo() {
  return http.get<UserInfo>(`${BASE_URL}/info`);
}

/**
 * 登出
 */
export function logout() {
  return http.post(`${BASE_URL}/logout`);
}

/**
 * 获取管理员列表
 */
export function fetchList(params: PageParams & { keyword?: string }) {
  return http.get<PageResult<Admin>>(`${BASE_URL}/list`, { params });
}

/**
 * 创建管理员
 */
export function createAdmin(data: Partial<Admin>) {
  return http.post(`${BASE_URL}/register`, data);
}

/**
 * 更新管理员信息
 */
export function updateAdmin(id: number, data: Partial<Admin>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 更新管理员状态
 */
export function updateStatus(id: number, params: { status: number }) {
  return http.post(`${BASE_URL}/updateStatus/${id}`, null, { params });
}

/**
 * 删除管理员
 */
export function deleteAdmin(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

/**
 * 获取管理员的角色
 */
export function getRoleByAdmin(id: number) {
  return http.get(`${BASE_URL}/role/${id}`);
}

/**
 * 分配角色
 */
export function allocRole(data: { adminId: number; roleIds: number[] }) {
  return http.post(`${BASE_URL}/role/update`, data);
}

export default {
  login,
  getInfo,
  logout,
  fetchList,
  createAdmin,
  updateAdmin,
  updateStatus,
  deleteAdmin,
  getRoleByAdmin,
  allocRole,
};
