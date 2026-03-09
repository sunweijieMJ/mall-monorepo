import { defineStore } from 'pinia';
import {
  portalProductControllerSearchV1,
  portalProductControllerCategoryTreeListV1,
  portalProductControllerGetItemV1,
} from '@/api';
import type { PortalProductControllerSearchV1Params } from '@/api';

export const useProductStore = defineStore('product', () => {
  /** 搜索商品列表（分页） */
  async function search(params?: PortalProductControllerSearchV1Params) {
    const res = await portalProductControllerSearchV1(params);
    return res.data ?? null;
  }

  /** 获取商品分类树 */
  async function fetchCategoryTree() {
    const res = await portalProductControllerCategoryTreeListV1();
    return res.data ?? null;
  }

  /** 获取商品详情（含 SKU/属性/优惠信息） */
  async function fetchDetail(id: number) {
    const res = await portalProductControllerGetItemV1(id);
    return res.data ?? null;
  }

  return { search, fetchCategoryTree, fetchDetail };
});
