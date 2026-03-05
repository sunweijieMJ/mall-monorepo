/**
 * Mall 品牌管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { Brand } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/brand';

/**
 * 获取品牌列表
 */
export function fetchList(params: PageParams & { keyword?: string }) {
  return http.get<PageResult<Brand>>(`${BASE_URL}/list`, { params });
}

/**
 * 创建品牌
 */
export function createBrand(data: Partial<Brand>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新显示状态
 */
export function updateShowStatus(data: { ids: number[]; showStatus: number }) {
  return http.post(`${BASE_URL}/update/showStatus`, data);
}

/**
 * 更新厂家制造商状态
 */
export function updateFactoryStatus(data: {
  ids: number[];
  factoryStatus: number;
}) {
  return http.post(`${BASE_URL}/update/factoryStatus`, data);
}

/**
 * 删除品牌
 */
export function deleteBrand(id: number) {
  return http.get(`${BASE_URL}/delete/${id}`);
}

/**
 * 获取品牌详情
 */
export function getBrand(id: number) {
  return http.get<Brand>(`${BASE_URL}/${id}`);
}

/**
 * 更新品牌
 */
export function updateBrand(id: number, data: Partial<Brand>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

export default {
  fetchList,
  createBrand,
  updateShowStatus,
  updateFactoryStatus,
  deleteBrand,
  getBrand,
  updateBrand,
};
