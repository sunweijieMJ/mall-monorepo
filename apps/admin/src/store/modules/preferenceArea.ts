/**
 * 优选专区 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PreferenceAreaVo } from '@/api';
import { preferenceAreaControllerListV1 } from '@/api';

export const usePreferenceAreaStore = defineStore('preferenceArea', () => {
  const list = ref<PreferenceAreaVo[]>([]);
  const loading = ref(false);

  const getList = async () => {
    loading.value = true;
    try {
      const data = await preferenceAreaControllerListV1();
      list.value = (data as any)?.list || (Array.isArray(data) ? data : []);
    } finally {
      loading.value = false;
    }
  };

  return { list, loading, getList };
});
