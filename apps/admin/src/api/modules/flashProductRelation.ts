/**
 * Mall 秒杀商品关联管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { FlashProductRelation } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/flashProductRelation';

/**
 * 获取秒杀商品关联列表
 */
export function fetchList(
  params?: PageParams & {
    flashPromotionId?: number;
    flashPromotionSessionId?: number;
  },
) {
  return http.get<PageResult<FlashProductRelation>>(`${BASE_URL}/list`, {
    params,
  });
}

/**
 * 创建秒杀商品关联
 */
export function createFlashProductRelation(
  data: Partial<FlashProductRelation>[],
) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 删除秒杀商品关联
 */
export function deleteFlashProductRelation(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

/**
 * 更新秒杀商品关联
 */
export function updateFlashProductRelation(
  id: number,
  data: Partial<FlashProductRelation>,
) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

export default {
  fetchList,
  createFlashProductRelation,
  deleteFlashProductRelation,
  updateFlashProductRelation,
};
