/**
 * Mall 退货原因管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { ReturnReason } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/returnReason';

/**
 * 获取退货原因列表
 */
export function fetchList(params?: PageParams) {
  return http.get<PageResult<ReturnReason>>(`${BASE_URL}/list`, { params });
}

/**
 * 删除退货原因
 */
export function deleteReason(params: { ids: string }) {
  return http.post(`${BASE_URL}/delete`, null, { params });
}

/**
 * 更新退货原因状态
 */
export function updateStatus(params: { id: number; status: number }) {
  return http.post(`${BASE_URL}/update/status`, null, { params });
}

/**
 * 创建退货原因
 */
export function addReason(data: Partial<ReturnReason>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 获取退货原因详情
 */
export function getReasonDetail(id: number) {
  return http.get<ReturnReason>(`${BASE_URL}/${id}`);
}

/**
 * 更新退货原因
 */
export function updateReason(id: number, data: Partial<ReturnReason>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

export default {
  fetchList,
  deleteReason,
  updateStatus,
  addReason,
  getReasonDetail,
  updateReason,
};
