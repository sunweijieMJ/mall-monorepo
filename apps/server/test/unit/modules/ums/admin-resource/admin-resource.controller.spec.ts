import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AdminResourceController,
  AdminResourceCategoryController,
} from '@/modules/ums/admin-resource/admin-resource.controller';

describe('AdminResourceController', () => {
  let controller: AdminResourceController;
  const mockService = {
    create: vi.fn(),
    list: vi.fn(),
    listAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminResourceController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.create 并返回结果', async () => {
      const dto = { name: '商品管理', url: '/pms/**' } as any;
      const expected = { id: 1, ...dto };
      mockService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.list 并返回分页结果', async () => {
      const query = {
        categoryId: 1,
        nameKeyword: '商品',
        urlKeyword: '/pms',
        page: 1,
        limit: 10,
      } as any;
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(query);

      expect(mockService.list).toHaveBeenCalledWith(1, '商品', '/pms', query);
      expect(result).toBe(expected);
    });

    it('nameKeyword/urlKeyword 为空字符串时传 undefined', async () => {
      const query = {
        categoryId: 1,
        nameKeyword: '',
        urlKeyword: '',
        page: 1,
        limit: 10,
      } as any;
      const expected = { list: [], total: 0 };
      mockService.list.mockResolvedValue(expected);

      const result = await controller.list(query);

      expect(mockService.list).toHaveBeenCalledWith(
        1,
        undefined,
        undefined,
        query,
      );
      expect(result).toBe(expected);
    });
  });

  describe('listAll', () => {
    it('调用 service.listAll 并返回全部资源', async () => {
      const expected = [{ id: 1 }];
      mockService.listAll.mockResolvedValue(expected);

      const result = await controller.listAll();

      expect(mockService.listAll).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update 并返回受影响行数', async () => {
      const dto = { name: '订单管理' } as any;
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
    it('调用 service.getItem 并返回资源详情', async () => {
      const expected = { id: 1, name: '商品管理' };
      mockService.getItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});

describe('AdminResourceCategoryController', () => {
  let controller: AdminResourceCategoryController;
  const mockService = {
    createCategory: vi.fn(),
    listCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AdminResourceCategoryController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.createCategory 并返回结果', async () => {
      const dto = { name: '商品模块' } as any;
      const expected = { id: 1, ...dto };
      mockService.createCategory.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('listAll', () => {
    it('调用 service.listCategory 并返回全部资源分类', async () => {
      const expected = [{ id: 1, name: '商品模块' }];
      mockService.listCategory.mockResolvedValue(expected);

      const result = await controller.listAll();

      expect(mockService.listCategory).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.updateCategory 并返回受影响行数', async () => {
      const dto = { name: '订单模块' } as any;
      mockService.updateCategory.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.updateCategory).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 service.deleteCategory 并返回受影响行数', async () => {
      mockService.deleteCategory.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.deleteCategory).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });
});
