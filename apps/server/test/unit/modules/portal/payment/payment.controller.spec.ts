import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentController } from '@/modules/portal/payment/payment.controller';

describe('PaymentController', () => {
  let controller: PaymentController;
  const mockService = {
    createAlipayPayment: vi.fn(),
    handleAlipayNotify: vi.fn(),
  };
  const user = { sub: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PaymentController(mockService as any);
  });

  describe('createAlipayPayment', () => {
    it('调用 paymentService.createAlipayPayment 并返回支付信息', async () => {
      const dto = { orderId: 100 };
      const expected = {
        payForm: '<form action="https://alipay.com/pay">...</form>',
      };
      mockService.createAlipayPayment.mockResolvedValue(expected);

      const result = await controller.createAlipayPayment(
        dto as any,
        user as any,
      );

      expect(mockService.createAlipayPayment).toHaveBeenCalledWith(100, 1);
      expect(result).toBe(expected);
    });
  });

  describe('alipayNotify', () => {
    it('回调成功时返回 success', async () => {
      const params = { trade_no: '123', trade_status: 'TRADE_SUCCESS' };
      const req = { body: params } as any;
      const res = { send: vi.fn() } as any;
      mockService.handleAlipayNotify.mockResolvedValue(undefined);

      await controller.alipayNotify(req, res);

      expect(mockService.handleAlipayNotify).toHaveBeenCalledWith(params);
      expect(res.send).toHaveBeenCalledWith('success');
    });

    it('回调处理失败时返回 failure', async () => {
      const params = { trade_no: '123' };
      const req = { body: params } as any;
      const res = { send: vi.fn() } as any;
      mockService.handleAlipayNotify.mockRejectedValue(
        new Error('verify failed'),
      );

      await controller.alipayNotify(req, res);

      expect(res.send).toHaveBeenCalledWith('failure');
    });
  });
});
