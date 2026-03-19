import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubjectController } from '@/modules/cms/subject/subject.controller';

describe('SubjectController', () => {
  let controller: SubjectController;
  const mockService = {
    create: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    getProductList: vi.fn(),
    update: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SubjectController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { title: '新专题' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.delete（返回 void）', async () => {
      const dto = { ids: [1, 2] };
      mockService.delete.mockResolvedValue(undefined);

      const result = await controller.batchDelete(dto);

      expect(mockService.delete).toHaveBeenCalledWith([1, 2]);
      expect(result).toBeUndefined();
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

  describe('getProductList', () => {
    it('调用 service.getProductList 并返回分页结果', async () => {
      const query = { pageNum: 1, pageSize: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.getProductList.mockResolvedValue(expected);

      const result = await controller.getProductList(1, query);

      expect(mockService.getProductList).toHaveBeenCalledWith(1, query);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update（返回 void）', async () => {
      const dto = { title: '更新专题' } as any;
      mockService.update.mockResolvedValue(undefined);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBeUndefined();
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回详情', async () => {
      const expected = { id: 1, title: '专题详情' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
