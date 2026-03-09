import { defineStore } from 'pinia';
import {
  collectionControllerListV1,
  collectionControllerCreateV1,
  collectionControllerDeleteV1,
  collectionControllerGetItemV1,
} from '@/api';
import type { CollectionControllerListV1Params, AddCollectionDto } from '@/api';

export const useCollectionStore = defineStore('collection', () => {
  /** 获取收藏商品列表 */
  async function fetchList(params?: CollectionControllerListV1Params) {
    const res = await collectionControllerListV1(params);
    return res.data ?? null;
  }

  /** 收藏商品 */
  async function create(dto: AddCollectionDto) {
    const res = await collectionControllerCreateV1(dto);
    return res.data ?? null;
  }

  /** 取消收藏 */
  async function remove(productId: number) {
    const res = await collectionControllerDeleteV1(productId);
    return res.data ?? null;
  }

  /** 查询单条收藏详情（用于判断是否已收藏） */
  async function getItem(productId: number) {
    const res = await collectionControllerGetItemV1(productId);
    return res.data ?? null;
  }

  return { fetchList, create, remove, getItem };
});
