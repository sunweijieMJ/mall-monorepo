import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ReturnApplyController,
  PortalReturnApplyController,
} from '@/modules/oms/return-apply/return-apply.controller';

describe('ReturnApplyController', () => {
  let controller: ReturnApplyController;
  const mockService = {
    list: vi.fn(),
    delete: vi.fn(),
    updateStatus: vi.fn(),
    handle: vi.fn(),
    detail: vi.fn(),
    confirmReceive: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ReturnApplyController(mockService as any);
  });

  describe('list', () => {
    it('调用 service.list 并返回分页结果', async () => {
      const query = { pageNum: 1, pageSize: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(query);

      expect(mockService.list).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.delete', async () => {
      const dto = { ids: [1, 2] };
      mockService.delete.mockResolvedValue(2);

      const result = await controller.batchDelete(dto);

      expect(mockService.delete).toHaveBeenCalledWith([1, 2]);
      expect(result).toBe(2);
    });
  });

  describe('updateStatus', () => {
    it('调用 service.updateStatus 并返回受影响行数', async () => {
      const dto = { status: 1, handleNote: '同意' } as any;
      mockService.updateStatus.mockResolvedValue(1);

      const result = await controller.updateStatus(1, dto);

      expect(mockService.updateStatus).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('update', () => {
    it('调用 service.handle 并返回受影响行数', async () => {
      const dto = { status: 2, handleNote: '处理中' } as any;
      mockService.handle.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.handle).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.detail 并返回退货申请详情', async () => {
      const expected = { id: 1, orderSn: 'SN001' };
      mockService.detail.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.detail).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });

  describe('confirmReceive', () => {
    it('调用 service.confirmReceive 并返回受影响行数', async () => {
      const dto = { receiveNote: '已收货' } as any;
      mockService.confirmReceive.mockResolvedValue(1);

      const result = await controller.confirmReceive(1, dto);

      expect(mockService.confirmReceive).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });
});

describe('PortalReturnApplyController', () => {
  let controller: PortalReturnApplyController;
  const mockService = {
    portalCreate: vi.fn(),
    portalList: vi.fn(),
    portalDetail: vi.fn(),
  };
  const mockUser = { sub: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PortalReturnApplyController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.portalCreate 并传入用户ID', async () => {
      const dto = { orderItemId: 1 } as any;
      const expected = { id: 1 };
      mockService.portalCreate.mockResolvedValue(expected);

      const result = await controller.create(mockUser as any, dto);

      expect(mockService.portalCreate).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.portalList 并传入用户ID', async () => {
      const query = { pageNum: 1, pageSize: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.portalList.mockResolvedValue(expected);

      const result = await controller.list(mockUser as any, query);

      expect(mockService.portalList).toHaveBeenCalledWith(1, query);
      expect(result).toBe(expected);
    });
  });

  describe('getItem', () => {
    it('调用 service.portalDetail 并传入用户ID', async () => {
      const expected = { id: 1, orderSn: 'SN001' };
      mockService.portalDetail.mockResolvedValue(expected);

      const result = await controller.getItem(1, mockUser as any);

      expect(mockService.portalDetail).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(expected);
    });
  });
});
