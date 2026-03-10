/**
 * 专题 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SubjectVo } from '@/api';
import { subjectControllerListV1, subjectControllerGetItemV1 } from '@/api';

export const useSubjectStore = defineStore('subject', () => {
  const list = ref<SubjectVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await subjectControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const getItem = (id: number) => subjectControllerGetItemV1(id);

  return { list, total, loading, getList, getItem };
});
