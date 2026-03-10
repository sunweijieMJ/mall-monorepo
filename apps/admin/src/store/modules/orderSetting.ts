/**
 * 订单设置 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { OrderSettingVo } from '@/api';
import {
  orderSettingControllerGetItemV1,
  orderSettingControllerUpdateV1,
} from '@/api';

export const useOrderSettingStore = defineStore('orderSetting', () => {
  const setting = ref<OrderSettingVo | null>(null);
  const loading = ref(false);

  const getSetting = async (id: number) => {
    loading.value = true;
    try {
      const data = await orderSettingControllerGetItemV1(id);
      setting.value = data || null;
      return data;
    } finally {
      loading.value = false;
    }
  };

  const updateSetting = (id: number, dto: any) =>
    orderSettingControllerUpdateV1(id, dto);

  return { setting, loading, getSetting, updateSetting };
});
