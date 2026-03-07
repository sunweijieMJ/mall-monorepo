import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CleanupOverdueOrdersTask } from '@/modules/oms/order/tasks/cleanup-overdue-orders.task';
import { OrderEntity } from '@/modules/oms/order/infrastructure/persistence/relational/entities/order.entity';
import { OrderService } from '@/modules/oms/order/order.service';
import { createMockRepository } from '../../../../../helpers/mock.factory';

describe('CleanupOverdueOrdersTask', () => {
  let task: CleanupOverdueOrdersTask;
  const mockOrderRepo = createMockRepository();
  const mockOrderService = {
    cancelOrder: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CleanupOverdueOrdersTask,
        { provide: getRepositoryToken(OrderEntity), useValue: mockOrderRepo },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();
    task = module.get(CleanupOverdueOrdersTask);
  });

  it('无超时订单 → 不调用 cancelOrder', async () => {
    mockOrderRepo.find.mockResolvedValue([]);

    await task.handleCron();

    expect(mockOrderService.cancelOrder).not.toHaveBeenCalled();
  });

  it('有超时订单 → 逐个取消', async () => {
    const orders = [
      { id: 1, memberId: 10, orderSn: 'SN001' },
      { id: 2, memberId: 20, orderSn: 'SN002' },
    ];
    mockOrderRepo.find.mockResolvedValue(orders);

    await task.handleCron();

    expect(mockOrderService.cancelOrder).toHaveBeenCalledTimes(2);
    // memberId=0 表示系统调用
    expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(0, 1);
    expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(0, 2);
  });

  it('取消异常 → 继续处理其他订单', async () => {
    const orders = [
      { id: 1, memberId: 10, orderSn: 'SN001' },
      { id: 2, memberId: 20, orderSn: 'SN002' },
    ];
    mockOrderRepo.find.mockResolvedValue(orders);
    // 第一个取消失败
    mockOrderService.cancelOrder
      .mockRejectedValueOnce(new Error('订单已取消'))
      .mockResolvedValueOnce(undefined);

    await task.handleCron();

    // 第二个仍然被调用
    expect(mockOrderService.cancelOrder).toHaveBeenCalledTimes(2);
  });

  it('查询条件使用 120 分钟阈值', async () => {
    mockOrderRepo.find.mockResolvedValue([]);

    await task.handleCron();

    expect(mockOrderRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        select: ['id', 'memberId', 'orderSn'],
        take: 100,
      }),
    );
  });
});
