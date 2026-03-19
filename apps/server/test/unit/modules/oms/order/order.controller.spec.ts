import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AdminOrderController,
  PortalOrderController,
} from '@/modules/oms/order/order.controller';

describe('AdminOrderController', () => {
  let controller: AdminOrderController;
  const mockService = {
    adminList: vi.fn(),
    adminDelete: vi.fn(),
    detail: vi.fn(),
    delivery: vi.fn(),
    close: vi.fn(),
    updateReceiverInfo: vi.fn(),
    updateMoneyInfo: vi.fn(),
    updateNote: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminOrderController(mockService as any);
  });

  describe('list', () => {
    it('调用 service.adminList 并返回分页结果', async () => {
      const query = { pageNum: 1, pageSize: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.adminList.mockResolvedValue(expected);

      const result = await controller.list(query);

      expect(mockService.adminList).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.adminDelete', async () => {
      const dto = { ids: [1, 2] };
      mockService.adminDelete.mockResolvedValue(2);

      const result = await controller.batchDelete(dto);

      expect(mockService.adminDelete).toHaveBeenCalledWith([1, 2]);
      expect(result).toBe(2);
    });
  });

  describe('getItem', () => {
    it('调用 service.detail 并返回订单详情', async () => {
      const expected = { id: 1, orderSn: 'SN001' };
      mockService.detail.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.detail).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('delivery', () => {
    it('调用 service.delivery 并返回受影响行数', async () => {
      const deliveryList = [{ orderId: 1, deliverySn: 'D001' }] as any;
      mockService.delivery.mockResolvedValue(1);

      const result = await controller.delivery(deliveryList);

      expect(mockService.delivery).toHaveBeenCalledWith(deliveryList);
      expect(result).toBe(1);
    });
  });

  describe('close', () => {
    it('调用 service.close 并返回受影响行数', async () => {
      const body = { ids: [1, 2], note: '关闭原因' } as any;
      mockService.close.mockResolvedValue(2);

      const result = await controller.close(body);

      expect(mockService.close).toHaveBeenCalledWith([1, 2], '关闭原因');
      expect(result).toBe(2);
    });
  });

  describe('updateReceiverInfo', () => {
    it('调用 service.updateReceiverInfo 并传入合并后的参数', async () => {
      const dto = { receiverName: '张三' } as any;
      mockService.updateReceiverInfo.mockResolvedValue(1);

      const result = await controller.updateReceiverInfo(1, dto);

      expect(mockService.updateReceiverInfo).toHaveBeenCalledWith({
        receiverName: '张三',
        orderId: 1,
      });
      expect(result).toBe(1);
    });
  });

  describe('updateMoneyInfo', () => {
    it('调用 service.updateMoneyInfo 并传入合并后的参数', async () => {
      const dto = { freightAmount: 10 } as any;
      mockService.updateMoneyInfo.mockResolvedValue(1);

      const result = await controller.updateMoneyInfo(1, dto);

      expect(mockService.updateMoneyInfo).toHaveBeenCalledWith({
        freightAmount: 10,
        orderId: 1,
      });
      expect(result).toBe(1);
    });
  });

  describe('updateNote', () => {
    it('调用 service.updateNote 并返回受影响行数', async () => {
      const body = { note: '备注内容', status: 1 } as any;
      mockService.updateNote.mockResolvedValue(1);

      const result = await controller.updateNote(1, body);

      expect(mockService.updateNote).toHaveBeenCalledWith(1, '备注内容', 1);
      expect(result).toBe(1);
    });
  });
});

describe('PortalOrderController', () => {
  let controller: PortalOrderController;
  const mockService = {
    generateConfirmOrder: vi.fn(),
    generateOrder: vi.fn(),
    memberList: vi.fn(),
    detail: vi.fn(),
    paySuccess: vi.fn(),
    cancelOrder: vi.fn(),
    confirmReceive: vi.fn(),
    deleteOrder: vi.fn(),
  };
  const mockUser = { sub: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PortalOrderController(mockService as any);
  });

  describe('confirm', () => {
    it('调用 service.generateConfirmOrder 并返回确认订单结果', async () => {
      const dto = { cartIds: [1, 2] } as any;
      const expected = { cartPromotionItemList: [] };
      mockService.generateConfirmOrder.mockResolvedValue(expected);

      const result = await controller.confirm(mockUser as any, dto);

      expect(mockService.generateConfirmOrder).toHaveBeenCalledWith(1, [1, 2]);
      expect(result).toBe(expected);
    });

    it('当 cartIds 为空时传入空数组', async () => {
      const dto = {} as any;
      mockService.generateConfirmOrder.mockResolvedValue({});

      await controller.confirm(mockUser as any, dto);

      expect(mockService.generateConfirmOrder).toHaveBeenCalledWith(1, []);
    });
  });

  describe('generate', () => {
    it('调用 service.generateOrder 并返回结果', async () => {
      const dto = { addressId: 1 } as any;
      const expected = { orderId: 1 };
      mockService.generateOrder.mockResolvedValue(expected);

      const result = await controller.generate(mockUser as any, dto);

      expect(mockService.generateOrder).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.memberList 并返回分页结果', async () => {
      const query = { pageNum: 1, pageSize: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.memberList.mockResolvedValue(expected);

      const result = await controller.list(mockUser as any, 0, query);

      expect(mockService.memberList).toHaveBeenCalledWith(1, 0, query);
      expect(result).toBe(expected);
    });

    it('status 未传时默认传 -1', async () => {
      const query = { pageNum: 1, pageSize: 10 } as any;
      mockService.memberList.mockResolvedValue({ list: [], total: 0 });

      await controller.list(mockUser as any, undefined as any, query);

      expect(mockService.memberList).toHaveBeenCalledWith(1, -1, query);
    });
  });

  describe('getItem', () => {
    it('调用 service.detail 并传入用户ID', async () => {
      const expected = { id: 1, orderSn: 'SN001' };
      mockService.detail.mockResolvedValue(expected);

      const result = await controller.getItem(mockUser as any, 1);

      expect(mockService.detail).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(expected);
    });
  });

  describe('paySuccess', () => {
    it('调用 service.paySuccess 并返回受影响行数', async () => {
      const dto = { payType: 1 } as any;
      mockService.paySuccess.mockResolvedValue(1);

      const result = await controller.paySuccess(mockUser as any, 1, dto);

      expect(mockService.paySuccess).toHaveBeenCalledWith(1, 1, 1);
      expect(result).toBe(1);
    });

    it('当 payType 为空时使用默认值 0', async () => {
      const dto = {} as any;
      mockService.paySuccess.mockResolvedValue(1);

      await controller.paySuccess(mockUser as any, 1, dto);

      expect(mockService.paySuccess).toHaveBeenCalledWith(1, 0, 1);
    });
  });

  describe('cancel', () => {
    it('调用 service.cancelOrder 并返回受影响行数', async () => {
      mockService.cancelOrder.mockResolvedValue(1);

      const result = await controller.cancel(mockUser as any, 1);

      expect(mockService.cancelOrder).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });

  describe('confirmReceive', () => {
    it('调用 service.confirmReceive 并返回受影响行数', async () => {
      mockService.confirmReceive.mockResolvedValue(1);

      const result = await controller.confirmReceive(mockUser as any, 1);

      expect(mockService.confirmReceive).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 service.deleteOrder 并返回受影响行数', async () => {
      mockService.deleteOrder.mockResolvedValue(1);

      const result = await controller.delete(mockUser as any, 1);

      expect(mockService.deleteOrder).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(1);
    });
  });
});
