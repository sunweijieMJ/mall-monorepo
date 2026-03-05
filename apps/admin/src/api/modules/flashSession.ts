/**
 * Mall 秒杀时间段管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { FlashSession } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/flashSession';

/**
 * 获取秒杀时间段列表
 */
export function fetchList(params?: PageParams) {
  return http.get<PageResult<FlashSession>>(`${BASE_URL}/list`, { params });
}

/**
 * 获取秒杀时间段下拉列表
 */
export function fetchSelectList(params?: { flashPromotionId?: number }) {
  return http.get<FlashSession[]>(`${BASE_URL}/selectList`, { params });
}

/**
 * 更新秒杀时间段状态
 */
export function updateStatus(id: number, params: { status: number }) {
  return http.post(`${BASE_URL}/update/status/${id}`, null, { params });
}

/**
 * 删除秒杀时间段
 */
export function deleteSession(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

/**
 * 创建秒杀时间段
 */
export function createSession(data: Partial<FlashSession>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新秒杀时间段
 */
export function updateSession(id: number, data: Partial<FlashSession>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

export default {
  fetchList,
  fetchSelectList,
  updateStatus,
  deleteSession,
  createSession,
  updateSession,
};
