/**
 * Mall 首页广告管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { HomeAdvertise } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/home/advertise';

/**
 * 获取首页广告列表
 */
export function fetchList(
  params?: PageParams & {
    name?: string;
    type?: number;
    endTime?: string;
  },
) {
  return http.get<PageResult<HomeAdvertise>>(`${BASE_URL}/list`, { params });
}

/**
 * 更新首页广告状态
 */
export function updateStatus(id: number, params: { status: number }) {
  return http.post(`${BASE_URL}/update/status/${id}`, null, { params });
}

/**
 * 删除首页广告
 */
export function deleteHomeAdvertise(data: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, data);
}

/**
 * 创建首页广告
 */
export function createHomeAdvertise(data: Partial<HomeAdvertise>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 获取首页广告详情
 */
export function getHomeAdvertise(id: number) {
  return http.get<HomeAdvertise>(`${BASE_URL}/${id}`);
}

/**
 * 更新首页广告
 */
export function updateHomeAdvertise(id: number, data: Partial<HomeAdvertise>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

export default {
  fetchList,
  updateStatus,
  deleteHomeAdvertise,
  createHomeAdvertise,
  getHomeAdvertise,
  updateHomeAdvertise,
};
