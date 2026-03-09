import { defineStore } from 'pinia';
import {
  portalOrderControllerConfirmV1,
  portalOrderControllerGenerateV1,
  portalOrderControllerListV1,
  portalOrderControllerGetItemV1,
  portalOrderControllerDeleteV1,
  portalOrderControllerCancelV1,
  portalOrderControllerConfirmReceiveV1,
  portalOrderControllerPaySuccessV1,
} from '@/api';
import type {
  PortalConfirmOrderDto,
  PortalGenerateOrderDto,
  PortalOrderControllerListV1Params,
  PaySuccessDto,
} from '@/api';

export const useOrderStore = defineStore('order', () => {
  /** 生成确认订单 */
  async function generateConfirmOrder(dto: PortalConfirmOrderDto) {
    const res = await portalOrderControllerConfirmV1(dto);
    return res.data ?? null;
  }

  /** 提交订单 */
  async function generateOrder(dto: PortalGenerateOrderDto) {
    const res = await portalOrderControllerGenerateV1(dto);
    return res.data ?? null;
  }

  /** 获取我的订单列表 */
  async function fetchList(params?: PortalOrderControllerListV1Params) {
    const res = await portalOrderControllerListV1(params);
    return res.data ?? null;
  }

  /** 获取订单详情 */
  async function fetchDetail(id: number) {
    const res = await portalOrderControllerGetItemV1(id);
    return res.data ?? null;
  }

  /** 删除订单 */
  async function deleteOrder(id: number) {
    const res = await portalOrderControllerDeleteV1(id);
    return res.data ?? null;
  }

  /** 取消订单 */
  async function cancelOrder(id: number) {
    const res = await portalOrderControllerCancelV1(id);
    return res.data ?? null;
  }

  /** 确认收货 */
  async function confirmReceive(id: number) {
    const res = await portalOrderControllerConfirmReceiveV1(id);
    return res.data ?? null;
  }

  /** 支付成功回调 */
  async function paySuccess(id: number, dto: PaySuccessDto) {
    const res = await portalOrderControllerPaySuccessV1(id, dto);
    return res.data ?? null;
  }

  return {
    generateConfirmOrder,
    generateOrder,
    fetchList,
    fetchDetail,
    deleteOrder,
    cancelOrder,
    confirmReceive,
    paySuccess,
  };
});
