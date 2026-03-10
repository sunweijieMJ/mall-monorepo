/**
 * 退货原因 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ReturnReasonVo } from '@/api';
import {
  returnReasonControllerListV1,
  returnReasonControllerCreateV1,
  returnReasonControllerUpdateV1,
  returnReasonControllerBatchDeleteV1,
  returnReasonControllerUpdateStatusV1,
  returnReasonControllerGetItemV1,
} from '@/api';

export const useReturnReasonStore = defineStore('returnReason', () => {
  const list = ref<ReturnReasonVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await returnReasonControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => returnReasonControllerCreateV1(dto);
  const update = (id: number, dto: any) =>
    returnReasonControllerUpdateV1(id, dto);
  const batchDelete = (ids: number[]) =>
    returnReasonControllerBatchDeleteV1({ ids });
  const updateStatus = (ids: number[], v: number) =>
    returnReasonControllerUpdateStatusV1({ ids, status: v });
  const getItem = (id: number) => returnReasonControllerGetItemV1(id);

  return {
    list,
    total,
    loading,
    getList,
    create,
    update,
    batchDelete,
    updateStatus,
    getItem,
  };
});
