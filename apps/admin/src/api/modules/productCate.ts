/**
 * Mall 商品分类管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { ProductCategory } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/productCategory';

/**
 * 根据父分类ID获取分类列表
 */
export function fetchList(parentId: number, params?: PageParams) {
  return http.get<PageResult<ProductCategory>>(`${BASE_URL}/list/${parentId}`, {
    params,
  });
}

/**
 * 删除商品分类
 */
export function deleteProductCate(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

/**
 * 创建商品分类
 */
export function createProductCate(data: Partial<ProductCategory>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新商品分类
 */
export function updateProductCate(id: number, data: Partial<ProductCategory>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 获取商品分类详情
 */
export function getProductCate(id: number) {
  return http.get<ProductCategory>(`${BASE_URL}/${id}`);
}

/**
 * 更新显示状态
 */
export function updateShowStatus(data: { ids: number[]; showStatus: number }) {
  return http.post(`${BASE_URL}/update/showStatus`, data);
}

/**
 * 更新导航栏状态
 */
export function updateNavStatus(data: { ids: number[]; navStatus: number }) {
  return http.post(`${BASE_URL}/update/navStatus`, data);
}

/**
 * 获取分类列表（包含子分类）
 */
export function fetchListWithChildren() {
  return http.get<ProductCategory[]>(`${BASE_URL}/list/withChildren`);
}

export default {
  fetchList,
  deleteProductCate,
  createProductCate,
  updateProductCate,
  getProductCate,
  updateShowStatus,
  updateNavStatus,
  fetchListWithChildren,
};
