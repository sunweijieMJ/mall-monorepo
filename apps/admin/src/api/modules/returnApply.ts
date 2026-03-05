/**
 * Mall 退货申请管理 API
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import http from '@/api';
import type { ReturnApply, ReturnApplyDetail } from '@/interface';
import type { PageParams, PageResult } from '@/interface/common';

const BASE_URL = '/returnApply';

/**
 * 获取退货申请列表
 */
export function fetchList(
  params?: PageParams & {
    id?: number;
    receiverKeyword?: string;
    status?: number;
    createTime?: string;
    handleMan?: string;
    handleTime?: string;
  },
) {
  return http.get<PageResult<ReturnApply>>(`${BASE_URL}/list`, { params });
}

/**
 * 删除退货申请
 */
export function deleteApply(params: { ids: string }) {
  return http.post(`${BASE_URL}/delete`, null, { params });
}

/**
 * 更新退货申请状态
 */
export function updateApplyStatus(
  id: number,
  data: {
    status: number;
    handleNote?: string;
    receiveNote?: string;
    returnAmount?: number;
    companyAddressId?: number;
  },
) {
  return http.post(`${BASE_URL}/update/status/${id}`, data);
}

/**
 * 获取退货申请详情
 */
export function getApplyDetail(id: number) {
  return http.get<ReturnApplyDetail>(`${BASE_URL}/${id}`);
}

export default {
  fetchList,
  deleteApply,
  updateApplyStatus,
  getApplyDetail,
};
