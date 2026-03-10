/**
 * 秒杀活动 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  FlashPromotionVo,
  FlashSessionVo,
  FlashSessionWithCountVo,
} from '@/api';
import {
  flashPromotionControllerListV1,
  flashPromotionControllerCreateV1,
  flashPromotionControllerUpdateV1,
  flashPromotionControllerDeleteV1,
  flashPromotionControllerUpdateStatusV1,
  flashPromotionControllerGetItemV1,
  flashSessionControllerListV1,
  flashSessionControllerCreateV1,
  flashSessionControllerUpdateV1,
  flashSessionControllerDeleteV1,
  flashSessionControllerUpdateStatusV1,
  flashSessionControllerGetItemV1,
  flashSessionControllerListSelectableV1,
} from '@/api';

export const useFlashPromotionStore = defineStore('flashPromotion', () => {
  const list = ref<FlashPromotionVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const sessionList = ref<FlashSessionVo[]>([]);
  const sessionSelectList = ref<FlashSessionWithCountVo[]>([]);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await flashPromotionControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => flashPromotionControllerCreateV1(dto);
  const update = (id: number, dto: any) =>
    flashPromotionControllerUpdateV1(id, dto);
  const deleteItem = (id: number) => flashPromotionControllerDeleteV1(id);
  const updateStatus = (id: number, dto: any) =>
    flashPromotionControllerUpdateStatusV1(id, dto);
  const getItem = (id: number) => flashPromotionControllerGetItemV1(id);

  const getSessionList = async () => {
    const data = await flashSessionControllerListV1();
    sessionList.value = (data as any) || [];
    return data;
  };
  const createSession = (dto: any) => flashSessionControllerCreateV1(dto);
  const updateSession = (id: number, dto: any) =>
    flashSessionControllerUpdateV1(id, dto);
  const deleteSession = (id: number) => flashSessionControllerDeleteV1(id);
  const updateSessionStatus = (id: number, dto: any) =>
    flashSessionControllerUpdateStatusV1(id, dto);
  const getSessionItem = (id: number) => flashSessionControllerGetItemV1(id);
  const getSelectableSessions = async (params?: any) => {
    const data = await flashSessionControllerListSelectableV1(params);
    sessionSelectList.value = (data as any) || [];
    return data;
  };

  return {
    list,
    total,
    loading,
    sessionList,
    sessionSelectList,
    getList,
    create,
    update,
    deleteItem,
    updateStatus,
    getItem,
    getSessionList,
    createSession,
    updateSession,
    deleteSession,
    updateSessionStatus,
    getSessionItem,
    getSelectableSessions,
  };
});
