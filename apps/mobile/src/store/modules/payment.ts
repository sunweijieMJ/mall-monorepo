import { defineStore } from 'pinia';
import { paymentControllerCreateAlipayPaymentV1 } from '@/api';
import type { CreatePaymentDto } from '@/api';

export const usePaymentStore = defineStore('payment', () => {
  /** 创建支付宝支付，返回支付所需参数 */
  async function createAlipayPayment(dto: CreatePaymentDto) {
    const res = await paymentControllerCreateAlipayPaymentV1(dto);
    return res.data ?? null;
  }

  return { createAlipayPayment };
});
