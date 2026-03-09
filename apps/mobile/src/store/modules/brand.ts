import { defineStore } from 'pinia';
import {
  portalBrandControllerRecommendListV1,
  portalBrandControllerGetItemV1,
  portalBrandControllerProductListV1,
} from '@/api';
import type {
  PortalBrandControllerRecommendListV1Params,
  PortalBrandControllerProductListV1Params,
} from '@/api';

export const useBrandStore = defineStore('brand', () => {
  /** 获取推荐品牌列表（分页） */
  async function fetchRecommendList(
    params?: PortalBrandControllerRecommendListV1Params,
  ) {
    const res = await portalBrandControllerRecommendListV1(params);
    return res.data ?? null;
  }

  /** 获取品牌详情 */
  async function fetchDetail(id: number) {
    const res = await portalBrandControllerGetItemV1(id);
    return res.data ?? null;
  }

  /** 获取品牌下的商品列表（分页） */
  async function fetchProductList(
    id: number,
    params?: PortalBrandControllerProductListV1Params,
  ) {
    const res = await portalBrandControllerProductListV1(id, params);
    return res.data ?? null;
  }

  return { fetchRecommendList, fetchDetail, fetchProductList };
});
