/**
 * 会员等级 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MemberLevelVo } from '@/api';
import { memberLevelControllerListV1 } from '@/api';

export const useMemberLevelStore = defineStore('memberLevel', () => {
  const list = ref<MemberLevelVo[]>([]);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await memberLevelControllerListV1(params);
      // 支持分页结果或直接数组
      list.value = (data as any)?.list || (Array.isArray(data) ? data : []);
    } finally {
      loading.value = false;
    }
  };

  return { list, loading, getList };
});
