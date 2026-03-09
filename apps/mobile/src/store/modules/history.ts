import { defineStore } from 'pinia';
import {
  readHistoryControllerListV1,
  readHistoryControllerCreateV1,
  readHistoryControllerClearV1,
} from '@/api';
import type {
  ReadHistoryControllerListV1Params,
  SaveReadHistoryDto,
} from '@/api';

export const useHistoryStore = defineStore('history', () => {
  /** 获取浏览历史列表 */
  async function fetchList(params?: ReadHistoryControllerListV1Params) {
    const res = await readHistoryControllerListV1(params);
    return res.data ?? null;
  }

  /** 保存浏览历史 */
  async function create(dto: SaveReadHistoryDto) {
    const res = await readHistoryControllerCreateV1(dto);
    return res.data ?? null;
  }

  /** 清空全部浏览历史 */
  async function clear() {
    const res = await readHistoryControllerClearV1();
    return res.data ?? null;
  }

  return { fetchList, create, clear };
});
