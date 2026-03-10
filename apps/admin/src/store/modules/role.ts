/**
 * 角色 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AdminRoleVo } from '@/api';
import {
  adminRoleControllerListV1,
  adminRoleControllerCreateV1,
  adminRoleControllerUpdateV1,
  adminRoleControllerBatchDeleteV1,
  adminRoleControllerUpdateStatusV1,
  adminRoleControllerGetItemV1,
  adminRoleControllerListAllV1,
  adminRoleControllerListMenuV1,
  adminRoleControllerAllocMenuV1,
  adminRoleControllerListResourceV1,
  adminRoleControllerAllocResourceV1,
} from '@/api';

export const useRoleStore = defineStore('role', () => {
  const list = ref<AdminRoleVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const allRoles = ref<AdminRoleVo[]>([]);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await adminRoleControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => adminRoleControllerCreateV1(dto);
  const update = (id: number, dto: any) => adminRoleControllerUpdateV1(id, dto);
  const batchDelete = (ids: number[]) =>
    adminRoleControllerBatchDeleteV1({ ids });
  const updateStatus = (id: number, dto: any) =>
    adminRoleControllerUpdateStatusV1(id, dto);
  const getItem = (id: number) => adminRoleControllerGetItemV1(id);
  const getAllList = async () => {
    const data = await adminRoleControllerListAllV1();
    allRoles.value = (data as any) || [];
    return data;
  };
  const getMenuList = (id: number) => adminRoleControllerListMenuV1(id);
  const assignMenus = (id: number, dto: any) =>
    adminRoleControllerAllocMenuV1(id, dto);
  const getResourceList = (id: number) => adminRoleControllerListResourceV1(id);
  const assignResources = (id: number, dto: any) =>
    adminRoleControllerAllocResourceV1(id, dto);

  return {
    list,
    total,
    loading,
    allRoles,
    getList,
    create,
    update,
    batchDelete,
    updateStatus,
    getItem,
    getAllList,
    getMenuList,
    assignMenus,
    getResourceList,
    assignResources,
  };
});
