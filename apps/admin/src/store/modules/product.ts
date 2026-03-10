/**
 * 商品 Store
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProductVo } from '@/api';
import {
  productControllerListV1,
  productControllerCreateV1,
  productControllerUpdateV1,
  productControllerBatchDeleteV1,
  productControllerUpdatePublishStatusV1,
  productControllerUpdateNewStatusV1,
  productControllerUpdateRecommendStatusV1,
  productControllerGetDetailV1,
  productControllerListSimpleV1,
  skuStockControllerListV1,
  skuStockControllerUpdateV1,
} from '@/api';

export const useProductStore = defineStore('product', () => {
  const list = ref<ProductVo[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const simpleList = ref<ProductVo[]>([]);

  const getList = async (params?: any) => {
    loading.value = true;
    try {
      const data = await productControllerListV1(params);
      list.value = data?.list || [];
      total.value = data?.total || 0;
    } finally {
      loading.value = false;
    }
  };

  const create = (dto: any) => productControllerCreateV1(dto);
  const update = (id: number, dto: any) => productControllerUpdateV1(id, dto);
  const batchDelete = (ids: number[]) =>
    productControllerBatchDeleteV1({ ids });
  const updatePublishStatus = (ids: number[], v: number) =>
    productControllerUpdatePublishStatusV1({ ids, status: v });
  const updateNewStatus = (ids: number[], v: number) =>
    productControllerUpdateNewStatusV1({ ids, status: v });
  const updateRecommendStatus = (ids: number[], v: number) =>
    productControllerUpdateRecommendStatusV1({ ids, status: v });
  const getDetail = (id: number) => productControllerGetDetailV1(id);
  const getSimpleList = async (params?: any) => {
    const data = await productControllerListSimpleV1(params);
    simpleList.value = (data as any)?.list || (Array.isArray(data) ? data : []);
    return data;
  };
  const getSkuList = (id: number, params?: any) =>
    skuStockControllerListV1(id, params);
  const updateSku = (id: number, dto: any) =>
    skuStockControllerUpdateV1(id, dto);

  return {
    list,
    total,
    loading,
    simpleList,
    getList,
    create,
    update,
    batchDelete,
    updatePublishStatus,
    updateNewStatus,
    updateRecommendStatus,
    getDetail,
    getSimpleList,
    getSkuList,
    updateSku,
  };
});
