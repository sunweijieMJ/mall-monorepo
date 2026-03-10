/**
 * 商品分类 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProductCategoryVo, ProductCategoryWithChildrenVo } from '@/api';
import {
  productCategoryControllerListV1,
  productCategoryControllerCreateV1,
  productCategoryControllerUpdateV1,
  productCategoryControllerDeleteV1,
  productCategoryControllerGetItemV1,
  productCategoryControllerUpdateShowStatusV1,
  productCategoryControllerUpdateNavStatusV1,
  productCategoryControllerListWithChildrenV1,
} from '@/api';

export const useProductCateStore = defineStore('productCate', () => {
  const list = ref<ProductCategoryVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const cateWithChildren = ref<ProductCategoryWithChildrenVo[]>([]);

  const getList = async (parentId?: number, params?: any) => {
    loading.value = true;
    try {
      const data = await productCategoryControllerListV1({
        parentId,
        ...params,
      });
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => productCategoryControllerCreateV1(dto);
  const update = (id: number, dto: any) =>
    productCategoryControllerUpdateV1(id, dto);
  const deleteItem = (id: number) => productCategoryControllerDeleteV1(id);
  const getItem = (id: number) => productCategoryControllerGetItemV1(id);
  const updateShowStatus = (ids: number[], v: number) =>
    productCategoryControllerUpdateShowStatusV1({ ids, status: v });
  const updateNavStatus = (ids: number[], v: number) =>
    productCategoryControllerUpdateNavStatusV1({ ids, status: v });
  const getListWithChildren = async () => {
    const data = await productCategoryControllerListWithChildrenV1();
    cateWithChildren.value = (data as any) || [];
    return data;
  };

  return {
    list,
    total,
    loading,
    cateWithChildren,
    getList,
    create,
    update,
    deleteItem,
    getItem,
    updateShowStatus,
    updateNavStatus,
    getListWithChildren,
  };
});
