/**
 * Mall 优选区域管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { PrefrenceArea } from '@/interface';

const BASE_URL = '/prefrenceArea';

/**
 * 获取所有优选区域
 */
export function fetchList() {
  return http.get<PrefrenceArea[]>(`${BASE_URL}/listAll`);
}

export default {
  fetchList,
};
