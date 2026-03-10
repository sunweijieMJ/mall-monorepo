/**
 * 广告 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HomeAdvertiseVo } from '@/api';
import {
  homeAdvertiseControllerListV1,
  homeAdvertiseControllerCreateV1,
  homeAdvertiseControllerUpdateV1,
  homeAdvertiseControllerBatchDeleteV1,
  homeAdvertiseControllerUpdateStatusV1,
  homeAdvertiseControllerGetItemV1,
} from '@/api';

export const useAdvertiseStore = defineStore('advertise', () => {
  const list = ref<HomeAdvertiseVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await homeAdvertiseControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => homeAdvertiseControllerCreateV1(dto);
  const update = (id: number, dto: any) =>
    homeAdvertiseControllerUpdateV1(id, dto);
  const batchDelete = (ids: number[]) =>
    homeAdvertiseControllerBatchDeleteV1({ ids });
  const updateStatus = (id: number, dto: any) =>
    homeAdvertiseControllerUpdateStatusV1(id, dto);
  const getItem = (id: number) => homeAdvertiseControllerGetItemV1(id);

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
