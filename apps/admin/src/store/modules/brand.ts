/**
 * 品牌 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { BrandVo, CreateBrandDto, UpdateBrandDto } from '@/api';
import {
  brandControllerListV1,
  brandControllerCreateV1,
  brandControllerUpdateV1,
  brandControllerBatchDeleteV1,
  brandControllerUpdateShowStatusV1,
  brandControllerUpdateFactoryStatusV1,
  brandControllerGetItemV1,
  brandControllerListAllV1,
} from '@/api';

export const useBrandStore = defineStore('brand', () => {
  const list = ref<BrandVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const allBrands = ref<BrandVo[]>([]);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await brandControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: CreateBrandDto) => brandControllerCreateV1(dto);
  const update = (id: number, dto: UpdateBrandDto) =>
    brandControllerUpdateV1(id, dto);
  const batchDelete = (ids: number[]) => brandControllerBatchDeleteV1({ ids });
  const updateShowStatus = (ids: number[], status: number) =>
    brandControllerUpdateShowStatusV1({ ids, showStatus: status });
  const updateFactoryStatus = (ids: number[], status: number) =>
    brandControllerUpdateFactoryStatusV1({ ids, factoryStatus: status });
  const getItem = (id: number) => brandControllerGetItemV1(id);
  const getAllList = async () => {
    const data = await brandControllerListAllV1();
    allBrands.value = (data as any) || [];
    return data;
  };

  return {
    list,
    total,
    loading,
    allBrands,
    getList,
    create,
    update,
    batchDelete,
    updateShowStatus,
    updateFactoryStatus,
    getItem,
    getAllList,
  };
});
