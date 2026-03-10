/**
 * 商品属性 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type {
  ProductAttrCategoryVo,
  ProductAttrVo,
  AttrCategoryWithAttrVo,
} from '@/api';
import {
  productAttrCategoryControllerListV1,
  productAttrCategoryControllerCreateV1,
  productAttrCategoryControllerUpdateV1,
  productAttrCategoryControllerDeleteV1,
  productAttrCategoryControllerGetItemV1,
  productAttrCategoryControllerListWithAttrV1,
  productAttrControllerListV1,
  productAttrControllerCreateV1,
  productAttrControllerUpdateV1,
  productAttrControllerBatchDeleteV1,
  productAttrControllerGetItemV1,
} from '@/api';

export const useProductAttrStore = defineStore('productAttr', () => {
  const cateList = ref<ProductAttrCategoryVo[]>([]);
  const cateTotal = ref(0);
  const cateWithAttr = ref<AttrCategoryWithAttrVo[]>([]);
  const attrList = ref<ProductAttrVo[]>([]);
  const attrTotal = ref(0);
  const loading = ref(false);

  const getCateList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await productAttrCategoryControllerListV1(params);
      cateList.value = data?.list || [];
      cateTotal.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const createCate = (dto: any) => productAttrCategoryControllerCreateV1(dto);
  const updateCate = (id: number, dto: any) =>
    productAttrCategoryControllerUpdateV1(id, dto);
  const deleteCate = (id: number) => productAttrCategoryControllerDeleteV1(id);
  const getCateItem = (id: number) =>
    productAttrCategoryControllerGetItemV1(id);

  const getCateWithAttr = async () => {
    const data = await productAttrCategoryControllerListWithAttrV1();
    cateWithAttr.value = (data as any) || [];
    return data;
  };

  const getAttrList = async (cid: number, params?: any) => {
    loading.value = true;
    try {
      const data = await productAttrControllerListV1({
        categoryId: cid,
        ...params,
      });
      attrList.value = data?.list || [];
      attrTotal.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const createAttr = (dto: any) => productAttrControllerCreateV1(dto);
  const updateAttr = (id: number, dto: any) =>
    productAttrControllerUpdateV1(id, dto);
  const deleteAttr = (ids: number[]) =>
    productAttrControllerBatchDeleteV1({ ids });
  const getAttrItem = (id: number) => productAttrControllerGetItemV1(id);

  return {
    cateList,
    cateTotal,
    cateWithAttr,
    attrList,
    attrTotal,
    loading,
    getCateList,
    createCate,
    updateCate,
    deleteCate,
    getCateItem,
    getCateWithAttr,
    getAttrList,
    createAttr,
    updateAttr,
    deleteAttr,
    getAttrItem,
  };
});
