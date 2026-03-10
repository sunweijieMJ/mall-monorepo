/**
 * 退货申请 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ReturnApplyVo } from '@/api';
import {
  returnApplyControllerListV1,
  returnApplyControllerBatchDeleteV1,
  returnApplyControllerUpdateStatusV1,
  returnApplyControllerGetItemV1,
  returnApplyControllerConfirmReceiveV1,
} from '@/api';

export const useReturnApplyStore = defineStore('returnApply', () => {
  const list = ref<ReturnApplyVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await returnApplyControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const batchDelete = (ids: number[]) =>
    returnApplyControllerBatchDeleteV1({ ids });
  const updateStatus = (id: number, dto: any) =>
    returnApplyControllerUpdateStatusV1(id, dto);
  const getItem = (id: number) => returnApplyControllerGetItemV1(id);
  const confirmReceive = (id: number, dto: any) =>
    returnApplyControllerConfirmReceiveV1(id, dto);

  return {
    list,
    total,
    loading,
    getList,
    batchDelete,
    updateStatus,
    getItem,
    confirmReceive,
  };
});
