import { defineStore } from 'pinia';
import {
  attentionControllerListV1,
  attentionControllerCreateV1,
  attentionControllerDeleteV1,
} from '@/api';
import type { AttentionControllerListV1Params, AddAttentionDto } from '@/api';

export const useAttentionStore = defineStore('attention', () => {
  /** 获取已关注品牌列表 */
  async function fetchList(params?: AttentionControllerListV1Params) {
    const res = await attentionControllerListV1(params);
    return res.data ?? null;
  }

  /** 关注品牌 */
  async function create(dto: AddAttentionDto) {
    const res = await attentionControllerCreateV1(dto);
    return res.data ?? null;
  }

  /** 取消关注品牌 */
  async function remove(brandId: number) {
    const res = await attentionControllerDeleteV1(brandId);
    return res.data ?? null;
  }

  return { fetchList, create, remove };
});
