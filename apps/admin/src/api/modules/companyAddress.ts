/**
 * Mall 公司收发货地址管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { CompanyAddress } from '@/interface';

const BASE_URL = '/companyAddress';

/**
 * 获取公司收发货地址列表
 */
export function fetchList() {
  return http.get<CompanyAddress[]>(`${BASE_URL}/list`);
}

export default {
  fetchList,
};
