/**
 * 管理员用户 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AdminUserVo } from '@/api';
import {
  adminUserControllerListV1,
  adminUserControllerUpdateV1,
  adminUserControllerDeleteV1,
  adminUserControllerGetItemV1,
  adminUserControllerUpdateStatusV1,
  adminUserControllerUpdateRoleV1,
  adminUserControllerGetRoleListV1,
  adminAuthControllerRegisterV1,
} from '@/api';

export const useAdminUserStore = defineStore('adminUser', () => {
  const list = ref<AdminUserVo[]>([]);
  const total = ref(0);
  const loading = ref(false);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await adminUserControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const update = (id: number, dto: any) => adminUserControllerUpdateV1(id, dto);
  const deleteItem = (id: number) => adminUserControllerDeleteV1(id);
  const getItem = (id: number) => adminUserControllerGetItemV1(id);
  const updateStatus = (id: number, dto: any) =>
    adminUserControllerUpdateStatusV1(id, dto);
  const assignRoles = (id: number, dto: any) =>
    adminUserControllerUpdateRoleV1(id, dto);
  const getRoles = (id: number) => adminUserControllerGetRoleListV1(id);
  const register = (dto: any) => adminAuthControllerRegisterV1(dto);

  return {
    list,
    total,
    loading,
    getList,
    update,
    deleteItem,
    getItem,
    updateStatus,
    assignRoles,
    getRoles,
    register,
  };
});
