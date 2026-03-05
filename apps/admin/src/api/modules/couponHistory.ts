/**
 * Mall 优惠券领取历史 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { CouponHistory } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/couponHistory';

/**
 * 获取优惠券领取历史列表
 */
export function fetchList(
  params?: PageParams & {
    couponId?: number;
    useStatus?: number;
  },
) {
  return http.get<PageResult<CouponHistory>>(`${BASE_URL}/list`, { params });
}

export default {
  fetchList,
};
