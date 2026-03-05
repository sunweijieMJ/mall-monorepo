/**
 * Mall 优惠券管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { Coupon } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/coupon';

/**
 * 获取优惠券列表
 */
export function fetchList(
  params: PageParams & { name?: string; type?: number },
) {
  return http.get<PageResult<Coupon>>(`${BASE_URL}/list`, { params });
}

/**
 * 创建优惠券
 */
export function createCoupon(data: Partial<Coupon>) {
  return http.post(`${BASE_URL}/create`, data);
}

/**
 * 获取优惠券详情
 */
export function getCoupon(id: number) {
  return http.get<Coupon>(`${BASE_URL}/${id}`);
}

/**
 * 更新优惠券
 */
export function updateCoupon(id: number, data: Partial<Coupon>) {
  return http.post(`${BASE_URL}/update/${id}`, data);
}

/**
 * 删除优惠券
 */
export function deleteCoupon(id: number) {
  return http.post(`${BASE_URL}/delete/${id}`);
}

export default {
  fetchList,
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
};
