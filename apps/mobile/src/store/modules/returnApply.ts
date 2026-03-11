import { defineStore } from 'pinia';
import {
  portalReturnApplyControllerCreateV1,
  portalReturnApplyControllerListV1,
  portalReturnApplyControllerGetItemV1,
} from '@/api';
import type {
  PortalCreateReturnApplyDto,
  PortalReturnApplyControllerListV1Params,
} from '@/api';

export const useReturnApplyStore = defineStore('returnApply', () => {
  /** 申请退货 */
  async function create(dto: PortalCreateReturnApplyDto) {
    const res = await portalReturnApplyControllerCreateV1(dto);
    return res.data ?? null;
  }

  /** 我的退货申请列表 */
  async function fetchList(params?: PortalReturnApplyControllerListV1Params) {
    const res = await portalReturnApplyControllerListV1(params);
    return res.data ?? null;
  }

  /** 退货申请详情 */
  async function fetchDetail(id: number) {
    const res = await portalReturnApplyControllerGetItemV1(id);
    return res.data ?? null;
  }

  return { create, fetchList, fetchDetail };
});
