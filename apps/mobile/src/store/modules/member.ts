import { defineStore } from 'pinia';
import {
  memberInfoControllerGetInfoV1,
  memberInfoControllerUpdateInfoV1,
} from '@/api';
import type { UpdateMemberInfoDto } from '@/api';

export const useMemberStore = defineStore('member', () => {
  /** 获取当前会员信息 */
  async function fetchInfo() {
    const res = await memberInfoControllerGetInfoV1();
    return res.data ?? null;
  }

  /** 更新会员信息 */
  async function updateInfo(dto: UpdateMemberInfoDto) {
    const res = await memberInfoControllerUpdateInfoV1(dto);
    return res.data ?? null;
  }

  return { fetchInfo, updateInfo };
});
