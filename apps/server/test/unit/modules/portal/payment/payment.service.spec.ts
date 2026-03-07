import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentService } from '@/modules/portal/payment/payment.service';
import { AlipayService } from '@/modules/portal/payment/alipay.service';
import {
  OrderEntity,
  OrderStatus,
} from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { OrderService } from '@/modules/oms/order/order.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

const orderFixture = (overrides = {}) =>
  ({
    id: 1,
    orderSn: 'ORDER001',
    memberId: 1,
    status: OrderStatus.PENDING_PAYMENT,
    totalAmount: '99.90',
    payAmount: '99.90',
    ...overrides,
  }) as unknown as OrderEntity;

describe('PaymentService', () => {
  let service: PaymentService;
  const mockOrderRepo = createMockRepository();
  const mockAlipayService = {
    createPagePayment: vi.fn().mockReturnValue('<form>pay</form>'),
    verifyNotification: vi.fn().mockReturnValue(true),
  };
  const mockOrderService = {
    paySuccess: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: AlipayService, useValue: mockAlipayService },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();
    service = module.get(PaymentService);
  });

  // ======================== createAlipayPayment ========================

  describe('createAlipayPayment', () => {
    it('正常创建 → 返回支付表单', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());

      const result = await service.createAlipayPayment(1, 1);

      expect(result.payForm).toContain('form');
      expect(mockAlipayService.createPagePayment).toHaveBeenCalledWith(
        'ORDER001',
        99.9,
        expect.stringContaining('ORDER001'),
      );
    });

    it('订单不存在 → 404', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.createAlipayPayment(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('非本人订单 → 400', async () => {
      mockOrderRepo.findOne.mockResolvedValue(orderFixture({ memberId: 2 }));

      await expect(service.createAlipayPayment(1, 1)).rejects.toThrow(
        '无权操作此订单',
      );
    });

    it('订单状态不允许支付 → 400', async () => {
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ status: OrderStatus.COMPLETED }),
      );

      await expect(service.createAlipayPayment(1, 1)).rejects.toThrow(
        '订单状态不允许支付',
      );
    });
  });

  // ======================== handleAlipayNotify ========================

  describe('handleAlipayNotify', () => {
    const validParams = {
      trade_status: 'TRADE_SUCCESS',
      out_trade_no: 'ORDER001',
      trade_no: 'ALI001',
      total_amount: '99.90',
      sign: 'valid',
      sign_type: 'RSA2',
    };

    it('签名验证失败 → 抛出 400', async () => {
      mockAlipayService.verifyNotification.mockReturnValue(false);

      await expect(service.handleAlipayNotify(validParams)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('支付成功 → 调用 orderService.paySuccess', async () => {
      mockAlipayService.verifyNotification.mockReturnValue(true);
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());

      await service.handleAlipayNotify(validParams);

      expect(mockOrderService.paySuccess).toHaveBeenCalledWith(1, 1, 1);
    });

    it('订单不存在 → 仅记录日志不抛错', async () => {
      mockAlipayService.verifyNotification.mockReturnValue(true);
      mockOrderRepo.findOne.mockResolvedValue(null);

      // 不应抛出异常
      await expect(
        service.handleAlipayNotify(validParams),
      ).resolves.toBeUndefined();
    });

    it('金额不一致 → 安全告警，不抛错', async () => {
      mockAlipayService.verifyNotification.mockReturnValue(true);
      mockOrderRepo.findOne.mockResolvedValue(
        orderFixture({ payAmount: '200.00' }),
      );

      await expect(
        service.handleAlipayNotify(validParams),
      ).resolves.toBeUndefined();

      // paySuccess 不应被调用
      expect(mockOrderService.paySuccess).not.toHaveBeenCalled();
    });

    it('paySuccess 异常 → 捕获不抛错（防止支付宝重试）', async () => {
      mockAlipayService.verifyNotification.mockReturnValue(true);
      mockOrderRepo.findOne.mockResolvedValue(orderFixture());
      mockOrderService.paySuccess.mockRejectedValue(new Error('已支付'));

      await expect(
        service.handleAlipayNotify(validParams),
      ).resolves.toBeUndefined();
    });

    it('非成功状态 → 不处理', async () => {
      mockAlipayService.verifyNotification.mockReturnValue(true);

      await service.handleAlipayNotify({
        ...validParams,
        trade_status: 'WAIT_BUYER_PAY',
      });

      expect(mockOrderRepo.findOne).not.toHaveBeenCalled();
    });
  });
});
