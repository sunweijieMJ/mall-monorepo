import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductCategoryController } from '@/modules/pms/product-category/product-category.controller';

describe('ProductCategoryController', () => {
  let controller: ProductCategoryController;
  const mockService = {
    create: vi.fn(),
    getList: vi.fn(),
    listWithChildren: vi.fn(),
    updateNavStatus: vi.fn(),
    updateShowStatus: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ProductCategoryController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '手机数码' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.getList 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.getList.mockResolvedValue(expected);

      const result = await controller.list(1, query);

      expect(mockService.getList).toHaveBeenCalledWith(1, query);
      expect(result).toBe(expected);
    });

    it('parentId 未传时默认传 0', async () => {
      const query = { page: 1, limit: 10 } as any;
      mockService.getList.mockResolvedValue({ list: [], total: 0 });

      await controller.list(undefined, query);

      expect(mockService.getList).toHaveBeenCalledWith(0, query);
    });
  });

  describe('listWithChildren', () => {
    it('调用 service.listWithChildren 并返回树形结构', async () => {
      const expected = [{ id: 1, children: [] }];
      mockService.listWithChildren.mockResolvedValue(expected);

      const result = await controller.listWithChildren();

      expect(mockService.listWithChildren).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('updateNavStatus', () => {
    it('调用 service.updateNavStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updateNavStatus.mockResolvedValue(2);

      const result = await controller.updateNavStatus(dto);

      expect(mockService.updateNavStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('updateShowStatus', () => {
    it('调用 service.updateShowStatus 并返回受影响行数', async () => {
      const dto = { ids: [1, 2], status: 1 };
      mockService.updateShowStatus.mockResolvedValue(2);

      const result = await controller.updateShowStatus(dto);

      expect(mockService.updateShowStatus).toHaveBeenCalledWith([1, 2], 1);
      expect(result).toBe(2);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { name: '家用电器' } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 service.delete 并返回受影响行数', async () => {
      mockService.delete.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getItem 并返回分类详情', async () => {
      const expected = { id: 1, name: '手机数码' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
