import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReadHistoryController } from '@/modules/portal/read-history/read-history.controller';

describe('ReadHistoryController', () => {
  let controller: ReadHistoryController;
  const mockService = {
    save: vi.fn(),
    list: vi.fn(),
    batchDelete: vi.fn(),
    clear: vi.fn(),
  };
  const user = { sub: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ReadHistoryController(mockService as any);
  });

  describe('create', () => {
    it('调用 readHistoryService.save 并返回结果', async () => {
      const dto = { productId: 10 };
      const expected = { id: 1 };
      mockService.save.mockResolvedValue(expected);

      const result = await controller.create(user as any, dto as any);

      expect(mockService.save).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 readHistoryService.list 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(user as any, query as any);

      expect(mockService.list).toHaveBeenCalledWith(1, query);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('调用 readHistoryService.batchDelete 并传入 dto.ids', async () => {
      const dto = { ids: [1, 2, 3] };
      mockService.batchDelete.mockResolvedValue(3);

      const result = await controller.batchDelete(user as any, dto as any);

      expect(mockService.batchDelete).toHaveBeenCalledWith(1, [1, 2, 3]);
      expect(result).toBe(3);
    });
  });

  describe('clear', () => {
    it('调用 readHistoryService.clear 并返回受影响行数', async () => {
      mockService.clear.mockResolvedValue(10);

      const result = await controller.clear(user as any);

      expect(mockService.clear).toHaveBeenCalledWith(1);
      expect(result).toBe(10);
    });
  });
});
