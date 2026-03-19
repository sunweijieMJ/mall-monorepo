import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AttentionController } from '@/modules/portal/attention/attention.controller';

describe('AttentionController', () => {
  let controller: AttentionController;
  const mockService = {
    add: vi.fn(),
    clear: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
  };
  const user = { sub: 1 };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AttentionController(mockService as any);
  });

  describe('create', () => {
    it('调用 attentionService.add 并返回结果', async () => {
      const dto = { brandId: 10 };
      const expected = { id: 1 };
      mockService.add.mockResolvedValue(expected);

      const result = await controller.create(user as any, dto as any);

      expect(mockService.add).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(expected);
    });
  });

  describe('clear', () => {
    it('调用 attentionService.clear 并返回受影响行数', async () => {
      mockService.clear.mockResolvedValue(5);

      const result = await controller.clear(user as any);

      expect(mockService.clear).toHaveBeenCalledWith(1);
      expect(result).toBe(5);
    });
  });

  describe('delete', () => {
    it('调用 attentionService.delete 并返回受影响行数', async () => {
      mockService.delete.mockResolvedValue(1);

      const result = await controller.delete(user as any, 10);

      expect(mockService.delete).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(1);
    });
  });

  describe('list', () => {
    it('调用 attentionService.list 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(user as any, query as any);

      expect(mockService.list).toHaveBeenCalledWith(1, query);
      expect(result).toBe(expected);
    });
  });
});
