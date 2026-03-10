/**
 * 首页品牌 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HomeBrandVo } from '@/api';
import {
  homeBrandControllerListV1,
  homeBrandControllerBatchCreateV1,
  homeBrandControllerBatchDeleteV1,
  homeBrandControllerUpdateStatusV1,
  homeBrandControllerUpdateSortV1,
} from '@/api';

export const useHomeBrandStore = defineStore('homeBrand', () => {
  const list = ref<HomeBrandVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await homeBrandControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const batchCreate = (dto: any) => homeBrandControllerBatchCreateV1(dto);
  const batchDelete = (ids: number[]) =>
    homeBrandControllerBatchDeleteV1({ ids });
  const updateStatus = (dto: any) => homeBrandControllerUpdateStatusV1(dto);
  const updateSort = (id: number, dto: any) =>
    homeBrandControllerUpdateSortV1(id, dto);

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
