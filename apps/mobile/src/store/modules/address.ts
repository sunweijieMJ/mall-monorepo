import { defineStore } from 'pinia';
import {
  memberAddressControllerListV1,
  memberAddressControllerGetItemV1,
  memberAddressControllerCreateV1,
  memberAddressControllerUpdateV1,
  memberAddressControllerDeleteV1,
} from '@/api';
import type { CreateMemberAddressDto, UpdateMemberAddressDto } from '@/api';

export const useAddressStore = defineStore('address', () => {
  /** 获取收货地址列表 */
  async function fetchList() {
    const res = await memberAddressControllerListV1();
    return res.data ?? null;
  }

  /** 获取收货地址详情 */
  async function fetchDetail(id: number) {
    const res = await memberAddressControllerGetItemV1(id);
    return res.data ?? null;
  }

  /** 新增收货地址 */
  async function create(dto: CreateMemberAddressDto) {
    const res = await memberAddressControllerCreateV1(dto);
    return res.data ?? null;
  }

  /** 更新收货地址 */
  async function update(id: number, dto: UpdateMemberAddressDto) {
    const res = await memberAddressControllerUpdateV1(id, dto);
    return res.data ?? null;
  }

  /** 删除收货地址 */
  async function remove(id: number) {
    const res = await memberAddressControllerDeleteV1(id);
    return res.data ?? null;
  }

  return { fetchList, fetchDetail, create, update, remove };
});
