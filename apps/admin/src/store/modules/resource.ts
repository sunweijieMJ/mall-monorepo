/**
 * 资源 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AdminResourceVo, AdminResourceCategoryVo } from '@/api';
import {
  adminResourceControllerListV1,
  adminResourceControllerCreateV1,
  adminResourceControllerUpdateV1,
  adminResourceControllerDeleteV1,
  adminResourceControllerGetItemV1,
  adminResourceControllerListAllV1,
  adminResourceCategoryControllerListAllV1,
  adminResourceCategoryControllerCreateV1,
  adminResourceCategoryControllerUpdateV1,
  adminResourceCategoryControllerDeleteV1,
} from '@/api';

export const useResourceStore = defineStore('resource', () => {
  const list = ref<AdminResourceVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const allResources = ref<AdminResourceVo[]>([]);
  const allCategories = ref<AdminResourceCategoryVo[]>([]);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await adminResourceControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => adminResourceControllerCreateV1(dto);
  const update = (id: number, dto: any) =>
    adminResourceControllerUpdateV1(id, dto);
  const deleteItem = (id: number) => adminResourceControllerDeleteV1(id);
  const getItem = (id: number) => adminResourceControllerGetItemV1(id);
  const getAllList = async () => {
    const data = await adminResourceControllerListAllV1();
    allResources.value = (data as any) || [];
    return data;
  };
  const getAllCategories = async () => {
    const data = await adminResourceCategoryControllerListAllV1();
    allCategories.value = (data as any) || [];
    return data;
  };
  const createCategory = (dto: any) =>
    adminResourceCategoryControllerCreateV1(dto);
  const updateCategory = (id: number, dto: any) =>
    adminResourceCategoryControllerUpdateV1(id, dto);
  const deleteCategory = (id: number) =>
    adminResourceCategoryControllerDeleteV1(id);

  return {
    list,
    total,
    loading,
    allResources,
    allCategories,
    getList,
    create,
    update,
    deleteItem,
    getItem,
    getAllList,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
