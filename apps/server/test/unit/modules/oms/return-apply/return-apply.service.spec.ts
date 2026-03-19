import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReturnApplyService } from '@/modules/oms/return-apply/return-apply.service';
import { ReturnApplyEntity } from '@/modules/oms/return-apply/infrastructure/persistence/relational/entities/return-apply.entity';
import {
  OrderEntity,
  OrderStatus,
} from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { OrderItemEntity } from '@/modules/oms/order/infrastructure/persistence/relational/entities/order-item.entity';
import { MemberEntity } from '@/modules/portal/member/infrastructure/persistence/relational/entities/member.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

describe('ReturnApplyService', () => {
  let service: ReturnApplyService;
  const mockRepo = createMockRepository();
  const mockOrderRepo = createMockRepository();
  const mockOrderItemRepo = createMockRepository();
  const mockMemberRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        ReturnApplyService,
        { provide: getRepositoryToken(ReturnApplyEntity), useValue: mockRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        {
          provide: getRepositoryToken(OrderItemEntity),
          useValue: mockOrderItemRepo,
        },
        {
          provide: getRepositoryToken(MemberEntity),
          useValue: mockMemberRepo,
        },
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
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 0 });
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
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 1 });
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
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 0 });
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

    it('退货中(1)→已拒绝(3) → 不记录 receiveTime', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 1 });
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateStatus(1, { status: 3, handleNote: '退货中拒绝' });

      const setCall = qb.set.mock.calls[0][0];
      expect(setCall.status).toBe(3);
      expect(setCall.receiveTime).toBeUndefined();
      expect(setCall.handleNote).toBe('退货中拒绝');
    });

    it('refundAmount → 转为 string 存入 returnAmount', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 1 });
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

    it('带 receiveNote → 更新中包含 receiveNote', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 1 });
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: 1 });
      mockRepo.createQueryBuilder.mockReturnValue(qb);

      await service.updateStatus(1, {
        status: 2,
        receiveMan: '收货员',
        receiveNote: '包裹完好',
      });

      expect(qb.set).toHaveBeenCalledWith(
        expect.objectContaining({ receiveNote: '包裹完好' }),
      );
    });

    it('非法状态流转 → 抛出 BadRequestException', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 2 });

      await expect(service.updateStatus(1, { status: 1 })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('记录不存在 → 抛出 NotFoundException', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      await expect(service.updateStatus(1, { status: 1 })).rejects.toThrow(
        '退货申请 1 不存在',
      );
    });

    it('affected null → 返回 0', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 0 });
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({ affected: null });
      mockRepo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.updateStatus(1, { status: 1 });
      expect(result).toBe(0);
    });

    it('affected undefined → 返回 0', async () => {
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 0 });
      const qb = mockRepo.createQueryBuilder();
      qb.update = vi.fn().mockReturnValue(qb);
      qb.set = vi.fn().mockReturnValue(qb);
      qb.execute.mockResolvedValue({});
      mockRepo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.updateStatus(1, { status: 1 });
      expect(result).toBe(0);
    });
  });

  describe('delete', () => {
    it('批量删除', async () => {
      mockRepo.softDelete.mockResolvedValue({ affected: 2 });

      await service.delete([1, 2]);

      expect(mockRepo.softDelete).toHaveBeenCalledWith([1, 2]);
    });

    it('affected null → 返回 0', async () => {
      mockRepo.softDelete.mockResolvedValue({ affected: null });
      const result = await service.delete([1]);
      expect(result).toBe(0);
    });

    it('affected undefined → 返回 0', async () => {
      mockRepo.softDelete.mockResolvedValue({});
      const result = await service.delete([1]);
      expect(result).toBe(0);
    });
  });

  describe('portalCreate', () => {
    const baseDto = {
      orderId: 100,
      orderSn: 'OC202501010001',
      productId: 200,
      reason: '质量问题',
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
      mockOrderItemRepo.findOne.mockResolvedValue({
        id: 1,
        orderId: 100,
        productId: 200,
        productName: '测试商品',
        productPic: 'test.jpg',
        productAttr: '',
        productQuantity: 1,
        productPrice: '99.00',
        realAmount: '89.00',
      });
      mockMemberRepo.findOne.mockResolvedValue({
        id: 1,
        username: 'testuser',
      });
      mockRepo.save.mockImplementation((entity: any) =>
        Promise.resolve({ id: 1, ...entity }),
      );

      const result = await service.portalCreate(1, baseDto);

      expect(result.status).toBe(0);
      expect(result.memberId).toBe(1);
      expect(result.orderId).toBe(100);
      expect(result.reason).toBe('质量问题');
      expect(result.productCount).toBe(1);
      expect(result.productRealPrice).toBe('89.00');
    });

    it('member 为 null → memberUsername 使用空字符串', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 100,
        memberId: 1,
        status: OrderStatus.SHIPPING,
        orderSn: 'OC202501010001',
      });
      mockOrderItemRepo.findOne.mockResolvedValue({
        id: 1,
        orderId: 100,
        productId: 200,
        productName: '测试商品',
        productPic: 'test.jpg',
        productAttr: '',
        productQuantity: 1,
        productPrice: '99.00',
        realAmount: '89.00',
      });
      mockMemberRepo.findOne.mockResolvedValue(null); // member 不存在
      mockRepo.save.mockImplementation((entity: any) =>
        Promise.resolve({ id: 1, ...entity }),
      );

      const result = await service.portalCreate(1, baseDto);

      expect(result.memberUsername).toBe('');
    });

    it('可选字段为 null → 使用默认空字符串', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 100,
        memberId: 1,
        status: OrderStatus.SHIPPING,
        orderSn: 'OC202501010001',
      });
      mockOrderItemRepo.findOne.mockResolvedValue({
        id: 1,
        orderId: 100,
        productId: 200,
        productName: null,
        productPic: 'test.jpg',
        productAttr: '',
        productQuantity: null,
        productPrice: '99.00',
        realAmount: '89.00',
      });
      mockMemberRepo.findOne.mockResolvedValue({ id: 1, username: 'testuser' });
      mockRepo.save.mockImplementation((entity: any) =>
        Promise.resolve({ id: 1, ...entity }),
      );

      const dtoWithNulls = {
        orderId: 100,
        productId: 200,
        returnName: null,
        returnPhone: null,
        reason: null,
        returnAmount: null,
      } as any;
      const result = await service.portalCreate(1, dtoWithNulls);

      expect(result.returnName).toBe('');
      expect(result.returnPhone).toBe('');
      expect(result.reason).toBe('');
      expect(result.productName).toBe('');
      expect(result.productCount).toBe(1);
      expect(result.returnAmount).toBe('0');
    });

    it('已完成订单 → 创建成功', async () => {
      mockOrderRepo.findOne.mockResolvedValue({
        id: 100,
        memberId: 1,
        status: OrderStatus.COMPLETED,
      });
      mockOrderItemRepo.findOne.mockResolvedValue({
        id: 2,
        orderId: 100,
        productId: 200,
        productName: '测试商品',
        productPic: 'test.jpg',
        productAttr: '',
        productQuantity: 1,
        productPrice: '99.00',
        realAmount: '89.00',
      });
      mockMemberRepo.findOne.mockResolvedValue({
        id: 1,
        username: 'testuser',
      });
      mockRepo.save.mockImplementation((entity: any) =>
        Promise.resolve({ id: 2, ...entity }),
      );

      const result = await service.portalCreate(1, baseDto);

      expect(result.status).toBe(0);
    });
  });

  describe('portalDetail', () => {
    it('申请不存在或无权查看 → 抛出 NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.portalDetail(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('存在且归属当前会员 → 返回详情', async () => {
      const apply = { id: 1, memberId: 1, status: 0 };
      mockRepo.findOne.mockResolvedValue(apply);

      const result = await service.portalDetail(1, 1);

      expect(result).toBe(apply);
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
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 0 });
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
      mockRepo.findOneBy.mockResolvedValue({ id: 1, status: 1 });
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
