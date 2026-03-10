/**
 * 首页专题 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HomeSubjectVo } from '@/api';
import {
  homeSubjectControllerListV1,
  homeSubjectControllerBatchCreateV1,
  homeSubjectControllerBatchDeleteV1,
  homeSubjectControllerUpdateStatusV1,
  homeSubjectControllerUpdateSortV1,
} from '@/api';

export const useHomeSubjectStore = defineStore('homeSubject', () => {
  const list = ref<HomeSubjectVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await homeSubjectControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const batchCreate = (dto: any) => homeSubjectControllerBatchCreateV1(dto);
  const batchDelete = (ids: number[]) =>
    homeSubjectControllerBatchDeleteV1({ ids });
  const updateStatus = (dto: any) => homeSubjectControllerUpdateStatusV1(dto);
  const updateSort = (id: number, dto: any) =>
    homeSubjectControllerUpdateSortV1(id, dto);

  return {
    list,
    total,
    loading,
    getList,
    batchCreate,
    batchDelete,
    updateStatus,
    updateSort,
  };
});
