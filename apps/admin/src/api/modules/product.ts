/**
 * Mall 商品管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { Product, ProductListQuery } from '@/interface';
import type { PageResult } from '@/interface/common';

const BASE_URL = '/product';

/**
 * 获取商品列表
 */
export function fetchList(params: ProductListQuery) {
  return http.get<PageResult<Product>>(`${BASE_URL}/list`, { params });
}

/**
 * 获取简单商品列表（用于选择器）
 */
export function fetchSimpleList(params?: { keyword?: string }) {
  return http.get<Product[]>(`${BASE_URL}/simpleList`, { params });
}

/**
 * 更新删除状态
 */
export function updateDeleteStatus(params: {
  ids: number[];
  deleteStatus: number;
}) {
  return http.post(`${BASE_URL}/update/deleteStatus`, null, { params });
}

/**
 * 更新新品状态
 */
export function updateNewStatus(params: { ids: number[]; newStatus: number }) {
  return http.post(`${BASE_URL}/update/newStatus`, null, { params });
}

/**
 * 更新推荐状态
 */
export function updateRecommendStatus(params: {
  ids: number[];
  recommendStatus: number;
}) {
  return http.post(`${BASE_URL}/update/recommendStatus`, null, { params });
}

/**
 * 更新上架状态
 */
export function updatePublishStatus(params: {
  ids: number[];
  publishStatus: number;
}) {
  return http.post(`${BASE_URL}/update/publishStatus`, null, { params });
}

/**
 * 创建商品
 */
export function createProduct(data: Partial<Product>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新商品
 */
export function updateProduct(id: number, data: Partial<Product>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 获取商品详情
 */
export function getProduct(id: number) {
  return http.get<Product>(`${BASE_URL}/updateInfo/${id}`);
}

/**
 * 删除商品
 */
export function deleteProduct(ids: number[]) {
  return http.post(`${BASE_URL}/delete`, null, {
    params: { ids: ids.join(',') },
  });
}

export default {
  fetchList,
  fetchSimpleList,
  updateDeleteStatus,
  updateNewStatus,
  updateRecommendStatus,
  updatePublishStatus,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
};
