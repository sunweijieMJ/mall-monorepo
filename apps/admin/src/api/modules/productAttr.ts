/**
 * Mall 商品属性管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { ProductAttribute } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/productAttribute';

/**
 * 根据分类ID获取属性列表
 */
export function fetchList(
  cid: number,
  params?: PageParams & { type?: number },
) {
  return http.get<PageResult<ProductAttribute>>(`${BASE_URL}/list/${cid}`, {
    params,
  });
}

/**
 * 删除商品属性
 */
export function deleteProductAttr(data: { ids: number[] }) {
  return http.post(`${BASE_URL}/delete`, data);
}

/**
 * 创建商品属性
 */
export function createProductAttr(data: Partial<ProductAttribute>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 更新商品属性
 */
export function updateProductAttr(id: number, data: Partial<ProductAttribute>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 获取商品属性详情
 */
export function getProductAttr(id: number) {
  return http.get<ProductAttribute>(`${BASE_URL}/${id}`);
}

/**
 * 获取商品分类对应的筛选属性列表
 */
export function getProductAttrInfo(productCategoryId: number) {
  return http.get(`${BASE_URL}/attrInfo/${productCategoryId}`);
}

export default {
  fetchList,
  deleteProductAttr,
  createProductAttr,
  updateProductAttr,
  getProductAttr,
  getProductAttrInfo,
};
