import { defineStore } from 'pinia';
import {
  homeControllerGetHomeContentV1,
  portalProductControllerSearchV1,
} from '@/api';
import type {
  HomeContentVo,
  PortalProductControllerSearchV1Params,
} from '@/api';

export const useHomeStore = defineStore('home', () => {
  /** 获取首页内容（广告/品牌/新品/热品/专题/秒杀） */
  async function fetchContent(): Promise<HomeContentVo | null> {
    const res = await homeControllerGetHomeContentV1();
    return res.data ?? null;
  }

  /** 搜索推荐商品列表 */
  async function fetchProductList(
    params?: PortalProductControllerSearchV1Params,
  ) {
    const res = await portalProductControllerSearchV1(params);
    return res.data ?? null;
  }

  return { fetchContent, fetchProductList };
});
