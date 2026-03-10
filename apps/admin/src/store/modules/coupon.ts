/**
 * 优惠券 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { CouponVo, CouponHistoryVo } from '@/api';
import {
  couponControllerListV1,
  couponControllerCreateV1,
  couponControllerUpdateV1,
  couponControllerDeleteV1,
  couponControllerGetItemV1,
  couponHistoryControllerListV1,
} from '@/api';

export const useCouponStore = defineStore('coupon', () => {
  const list = ref<CouponVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const historyList = ref<CouponHistoryVo[]>([]);
  const historyTotal = ref(0);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await couponControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => couponControllerCreateV1(dto);
  const update = (id: number, dto: any) => couponControllerUpdateV1(id, dto);
  const deleteItem = (id: number) => couponControllerDeleteV1(id);
  const getItem = (id: number) => couponControllerGetItemV1(id);

  const getHistoryList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await couponHistoryControllerListV1(params);
      historyList.value = data?.list || [];
      historyTotal.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  return {
    list,
    total,
    loading,
    historyList,
    historyTotal,
    getList,
    create,
    update,
    deleteItem,
    getItem,
    getHistoryList,
  };
});
