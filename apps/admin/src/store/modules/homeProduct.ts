/**
 * 首页商品 Store（新品/热品）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { HomeNewProductVo, HomeRecommendProductVo } from '@/api';
import {
  homeNewProductControllerListV1,
  homeNewProductControllerBatchCreateV1,
  homeNewProductControllerBatchDeleteV1,
  homeNewProductControllerUpdateStatusV1,
  homeNewProductControllerUpdateSortV1,
  homeRecommendProductControllerListV1,
  homeRecommendProductControllerBatchCreateV1,
  homeRecommendProductControllerBatchDeleteV1,
  homeRecommendProductControllerUpdateStatusV1,
  homeRecommendProductControllerUpdateSortV1,
} from '@/api';

export const useHomeProductStore = defineStore('homeProduct', () => {
  const newList = ref<HomeNewProductVo[]>([]);
  const newTotal = ref(0);
  const hotList = ref<HomeRecommendProductVo[]>([]);
  const hotTotal = ref(0);
  const loading = ref(false);

  const getNewList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await homeNewProductControllerListV1(params);
      newList.value = data?.list || [];
      newTotal.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };
  const batchCreateNew = (dto: any) =>
    homeNewProductControllerBatchCreateV1(dto);
  const batchDeleteNew = (ids: number[]) =>
    homeNewProductControllerBatchDeleteV1({ ids });
  const updateNewStatus = (dto: any) =>
    homeNewProductControllerUpdateStatusV1(dto);
  const updateNewSort = (id: number, dto: any) =>
    homeNewProductControllerUpdateSortV1(id, dto);

  const getHotList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await homeRecommendProductControllerListV1(params);
      hotList.value = data?.list || [];
      hotTotal.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };
  const batchCreateHot = (dto: any) =>
    homeRecommendProductControllerBatchCreateV1(dto);
  const batchDeleteHot = (ids: number[]) =>
    homeRecommendProductControllerBatchDeleteV1({ ids });
  const updateHotStatus = (dto: any) =>
    homeRecommendProductControllerUpdateStatusV1(dto);
  const updateHotSort = (id: number, dto: any) =>
    homeRecommendProductControllerUpdateSortV1(id, dto);

  return {
    newList,
    newTotal,
    hotList,
    hotTotal,
    loading,
    getNewList,
    batchCreateNew,
    batchDeleteNew,
    updateNewStatus,
    updateNewSort,
    getHotList,
    batchCreateHot,
    batchDeleteHot,
    updateHotStatus,
    updateHotSort,
  };
});
