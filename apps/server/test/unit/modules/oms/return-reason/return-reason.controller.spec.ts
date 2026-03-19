import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReturnReasonController } from '@/modules/oms/return-reason/return-reason.controller';

describe('ReturnReasonController', () => {
  let controller: ReturnReasonController;
  const mockService = {
    create: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    updateStatus: vi.fn(),
    update: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ReturnReasonController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '质量问题' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.delete', async () => {
      const dto = { ids: [1, 2, 3] };
      mockService.delete.mockResolvedValue(3);

      const result = await controller.batchDelete(dto);

      expect(mockService.delete).toHaveBeenCalledWith([1, 2, 3]);
      expect(result).toBe(3);
    });
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

  describe('updateStatus', () => {
    it('调用 service.updateStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 } as any;
      mockService.updateStatus.mockResolvedValue(2);

      const result = await controller.updateStatus(dto);

      expect(mockService.updateStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { name: '更新原因' } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回退货原因详情', async () => {
      const expected = { id: 1, name: '质量问题' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
