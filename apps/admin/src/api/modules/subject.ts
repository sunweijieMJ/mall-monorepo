/**
 * Mall 专题分类管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { Subject } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/subject';

/**
 * 获取所有专题分类
 */
export function fetchListAll() {
  return http.get<Subject[]>(`${BASE_URL}/listAll`);
}

/**
 * 获取专题分类列表
 */
export function fetchList(params?: PageParams) {
  return http.get<PageResult<Subject>>(`${BASE_URL}/list`, { params });
}

export default {
  fetchListAll,
  fetchList,
};
