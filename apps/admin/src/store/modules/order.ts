/**
 * 订单 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { OrderVo } from '@/api';
import {
  adminOrderControllerListV1,
  adminOrderControllerBatchDeleteV1,
  adminOrderControllerCloseV1,
  adminOrderControllerDeliveryV1,
  adminOrderControllerGetItemV1,
  adminOrderControllerUpdateReceiverInfoV1,
  adminOrderControllerUpdateMoneyInfoV1,
  adminOrderControllerUpdateNoteV1,
} from '@/api';

export const useOrderStore = defineStore('order', () => {
  const list = ref<OrderVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await adminOrderControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const batchDelete = (ids: number[]) =>
    adminOrderControllerBatchDeleteV1({ ids });
  const close = (dto: any) => adminOrderControllerCloseV1(dto);
  const delivery = (dto: any) => adminOrderControllerDeliveryV1(dto);
  const getItem = (id: number) => adminOrderControllerGetItemV1(id);
  const updateReceiverInfo = (id: number, dto: any) =>
    adminOrderControllerUpdateReceiverInfoV1(id, dto);
  const updateMoneyInfo = (id: number, dto: any) =>
    adminOrderControllerUpdateMoneyInfoV1(id, dto);
  const updateNote = (id: number, dto: any) =>
    adminOrderControllerUpdateNoteV1(id, dto);

  return {
    list,
    total,
    loading,
    getList,
    batchDelete,
    close,
    delivery,
    getItem,
    updateReceiverInfo,
    updateMoneyInfo,
    updateNote,
  };
});
