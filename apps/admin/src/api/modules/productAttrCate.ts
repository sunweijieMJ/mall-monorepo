/**
 * Mall 商品属性分类管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { ProductAttributeCategory } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/productAttribute/category';

/**
 * 获取属性分类列表
 */
export function fetchList(params?: PageParams) {
  return http.get<PageResult<ProductAttributeCategory>>(`${BASE_URL}/list`, {
    params,
  });
}

/**
 * 创建属性分类
 */
export function createProductAttrCate(data: Partial<ProductAttributeCategory>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 删除属性分类
 */
export function deleteProductAttrCate(id: number) {
  return http.get(`${BASE_URL}/delete/${id}`);
}

/**
 * 更新属性分类
 */
export function updateProductAttrCate(
  id: number,
  data: Partial<ProductAttributeCategory>,
) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 获取属性分类列表（包含属性）
 */
export function fetchListWithAttr() {
  return http.get<ProductAttributeCategory[]>(`${BASE_URL}/list/withAttr`);
}

export default {
  fetchList,
  createProductAttrCate,
  deleteProductAttrCate,
  updateProductAttrCate,
  fetchListWithAttr,
};
