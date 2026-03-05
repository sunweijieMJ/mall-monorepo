/**
 * Mall 会员等级管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { MemberLevel } from '@/interface';

const BASE_URL = '/memberLevel';

/**
 * 获取会员等级列表
 */
export function fetchList(params?: { defaultStatus?: number }) {
  return http.get<MemberLevel[]>(`${BASE_URL}/list`, { params });
}

export default {
  fetchList,
};
