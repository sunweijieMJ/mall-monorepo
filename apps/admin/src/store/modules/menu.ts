/**
 * 菜单 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AdminMenuVo, AdminMenuTreeNodeVo } from '@/api';
import {
  adminMenuControllerListV1,
  adminMenuControllerCreateV1,
  adminMenuControllerUpdateV1,
  adminMenuControllerDeleteV1,
  adminMenuControllerGetItemV1,
  adminMenuControllerUpdateHiddenStatusV1,
  adminMenuControllerTreeListV1,
} from '@/api';

export const useMenuStore = defineStore('menu', () => {
  const list = ref<AdminMenuVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const treeList = ref<AdminMenuTreeNodeVo[]>([]);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await adminMenuControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => adminMenuControllerCreateV1(dto);
  const update = (id: number, dto: any) => adminMenuControllerUpdateV1(id, dto);
  const deleteItem = (id: number) => adminMenuControllerDeleteV1(id);
  const getItem = (id: number) => adminMenuControllerGetItemV1(id);
  const updateHidden = (id: number, dto: any) =>
    adminMenuControllerUpdateHiddenStatusV1(id, dto);
  const getTreeList = async () => {
    const data = await adminMenuControllerTreeListV1();
    treeList.value = (data as any) || [];
    return data;
  };

  return {
    list,
    total,
    loading,
    treeList,
    getList,
    create,
    update,
    deleteItem,
    getItem,
    updateHidden,
    getTreeList,
  };
});
