import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ReturnApplyService } from '@/modules/oms/return-apply/return-apply.service';
import { ReturnApplyEntity } from '@/modules/oms/return-apply/infrastructure/persistence/relational/entities/return-apply.entity';
import {
  OrderEntity,
  OrderStatus,
} from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

describe('ReturnApplyService', () => {
  let service: ReturnApplyService;
  const mockRepo = createMockRepository();
  const mockOrderRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ReturnApplyService,
        { provide: getRepositoryToken(ReturnApplyEntity), useValue: mockRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
      ],
    }).compile();

    service = module.get(ReturnApplyService);
  });

  describe('list', () => {
    it('无过滤条件 → 返回分页列表', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[{ id: 1 }], 1]);
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const query = { page: 1, limit: 10 } as any;
      const result = await service.list(query);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('带 status 过滤', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const query = { page: 1, limit: 10, status: 0 } as any;
      await service.list(query);

      expect(qb.andWhere).toHaveBeenCalledWith('ra.status = :status', {
        status: 0,
      });
    });

    it('带时间范围过滤', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      const query = {
        page: 1,
        limit: 10,
        startTime: '2025-01-01',
        endTime: '2025-12-31',
      } as any;
      await service.list(query);

      expect(qb.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('detail', () => {
    it('返回退货申请详情', async () => {
      const apply = { id: 1, status: 0 };
      (mockRepo as any).findOneByOrFail = vi.fn().mockResolvedValue(apply);

      const result = await service.detail(1);

      expect(result).toBe(apply);
    });
  });

  describe('updateStatus', () => {
    it('更新状态 → 记录 handleTime', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateStatus(1, { status: 1, handleMan: '管理员' });

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 1,
          handleMan: '管理员',
          handleTime: expect.any(Date),
        }),
      );
    });

    it('status=2 + receiveMan → 记录 receiveTime', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateStatus(1, { status: 2, receiveMan: '收货员' });

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 2,
          receiveMan: '收货员',
          receiveTime: expect.any(Date),
          handleTime: expect.any(Date),
        }),
      );
    });

    it('status=3（拒绝）→ 不记录 receiveTime', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateStatus(1, { status: 3, handleNote: '拒绝理由' });

      const setCall = qb.set.mock.calls[0][0];
      expect(setCall.receiveTime).toBeUndefined();
      expect(setCall.handleNote).toBe('拒绝理由');
    });

    it('refundAmount → 转为 string 存入 returnAmount', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateStatus(1, {
        status: 2,
        receiveMan: '收货员',
        refundAmount: 99.5,
      });

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({ returnAmount: '99.5' }),
      );
    });
  });

  describe('delete', () => {
    it('批量删除', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 2 });

      await service.delete([1, 2]);

      expect(mockRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('portalCreate', () => {
    const baseDto = {
      orderId: 100,
      orderSn: 'OC202501010001',
      productId: 200,
      returnReason: '质量问题',
    };

    it('订单不存在 → 抛出 BadRequestException', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);

      await expect(service.portalCreate(1, baseDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('订单状态不允许退货（待付款）→ 抛出 BadRequestException', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 100,
        memberId: 1,
        status: OrderStatus.PENDING_PAYMENT,
      });

      await expect(service.portalCreate(1, baseDto)).rejects.toThrow(
        '当前订单状态不允许申请退货',
      );
    });

    it('订单状态不允许退货（已取消）→ 抛出 BadRequestException', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 100,
        memberId: 1,
        status: OrderStatus.CANCELLED,
      });

      await expect(service.portalCreate(1, baseDto)).rejects.toThrow(
        '当前订单状态不允许申请退货',
      );
    });

    it('已发货订单 → 创建成功，status=0', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 100,
        memberId: 1,
        status: OrderStatus.SHIPPING,
      });
      mockRepo.save.mockImplementation((entity) =>
        Promise.resolve({ id: 1, ...entity }),
      );

      const result = await service.portalCreate(1, baseDto);

      expect(result.status).toBe(0);
      expect(result.memberId).toBe(1);
      expect(result.orderId).toBe(100);
      expect(result.reason).toBe('质量问题');
    });

    it('已完成订单 → 创建成功', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 100,
        memberId: 1,
        status: OrderStatus.COMPLETED,
      });
      mockRepo.save.mockImplementation((entity) =>
        Promise.resolve({ id: 2, ...entity }),
      );

      const result = await service.portalCreate(1, baseDto);

      expect(result.status).toBe(0);
    });
  });

  describe('portalList', () => {
    it('按 memberId 分页查询', async () => {
      mockRepo.findAndCount.mockResolvedValue([[{ id: 1, memberId: 10 }], 1]);

      const query = { page: 1, limit: 10 } as any;
      const result = await service.portalList(10, query);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { memberId: 10 },
          order: { createdAt: 'DESC' },
        }),
      );
    });
  });

  describe('handle / confirmReceive', () => {
    it('handle → 委托给 updateStatus', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.handle(1, { status: 1, handleMan: '管理员' });

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({ status: 1 }),
      );
    });

    it('confirmReceive → status=2 委托给 updateStatus', async () => {
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.confirmReceive(1, { receiveMan: '收货员' });

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({ status: 2, receiveMan: '收货员' }),
      );
    });
  });
});
