/**
 * Mall 秒杀活动管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { FlashPromotion } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/flash';

/**
 * 获取秒杀活动列表
 */
export function fetchList(params?: PageParams & { keyword?: string }) {
  return http.get<PageResult<FlashPromotion>>(`${BASE_URL}/list`, { params });
}

/**
 * 更新秒杀活动状态
 */
export function updateStatus(id: number, params: { status: number }) {
  return http.post(`${BASE_URL}/update/status/${id}`, null, { params });
}

/**
 * 删除秒杀活动
 */
export function deleteFlash(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

/**
 * 创建秒杀活动
 */
export function createFlash(data: Partial<FlashPromotion>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新秒杀活动
 */
export function updateFlash(id: number, data: Partial<FlashPromotion>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

export default {
  fetchList,
  updateStatus,
  deleteFlash,
  createFlash,
  updateFlash,
};
