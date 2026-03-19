import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ProductAttrCategoryController,
  ProductAttrController,
} from '@/modules/pms/product-attr/product-attr.controller';

describe('ProductAttrCategoryController', () => {
  let controller: ProductAttrCategoryController;
  const mockService = {
    createAttrCategory: vi.fn(),
    listAttrCategory: vi.fn(),
    listAttrCategoryWithAttr: vi.fn(),
    updateAttrCategory: vi.fn(),
    deleteAttrCategory: vi.fn(),
    getAttrCategoryItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ProductAttrCategoryController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.createAttrCategory 并返回结果', async () => {
      const dto = { name: '颜色分类' } as any;
      const expected = { id: 1, ...dto };
      mockService.createAttrCategory.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.createAttrCategory).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('list', () => {
    it('调用 service.listAttrCategory 并返回分页结果', async () => {
      const query = { page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.listAttrCategory.mockResolvedValue(expected);

      const result = await controller.list(query);

      expect(mockService.listAttrCategory).toHaveBeenCalledWith(query);
      expect(result).toBe(expected);
    });
  });

  describe('listWithAttr', () => {
    it('调用 service.listAttrCategoryWithAttr 并返回结果', async () => {
      const expected = [{ id: 1, attrs: [] }];
      mockService.listAttrCategoryWithAttr.mockResolvedValue(expected);

      const result = await controller.listWithAttr();

      expect(mockService.listAttrCategoryWithAttr).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.updateAttrCategory 并返回受影响行数', async () => {
      const dto = { name: '尺寸分类' } as any;
      mockService.updateAttrCategory.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.updateAttrCategory).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('delete', () => {
    it('调用 service.deleteAttrCategory 并返回受影响行数', async () => {
      mockService.deleteAttrCategory.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(mockService.deleteAttrCategory).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getAttrCategoryItem 并返回详情', async () => {
      const expected = { id: 1, name: '颜色分类' };
      mockService.getAttrCategoryItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getAttrCategoryItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});

describe('ProductAttrController', () => {
  let controller: ProductAttrController;
  const mockService = {
    createAttr: vi.fn(),
    deleteAttr: vi.fn(),
    listAttr: vi.fn(),
    updateAttr: vi.fn(),
    getAttrItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new ProductAttrController(mockService as any);
  });

  describe('create', () => {
    it('调用 service.createAttr 并返回结果', async () => {
      const dto = { name: '红色' } as any;
      const expected = { id: 1, ...dto };
      mockService.createAttr.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(mockService.createAttr).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('batchDelete', () => {
    it('提取 dto.ids 调用 service.deleteAttr', async () => {
      const dto = { ids: [1, 2, 3] };
      mockService.deleteAttr.mockResolvedValue(3);

      const result = await controller.batchDelete(dto);

      expect(mockService.deleteAttr).toHaveBeenCalledWith([1, 2, 3]);
      expect(result).toBe(3);
    });
  });

  describe('list', () => {
    it('调用 service.listAttr 并返回分页结果', async () => {
      const query = { categoryId: 1, type: 0, page: 1, limit: 10 } as any;
      const expected = { list: [], total: 0 };
      mockService.listAttr.mockResolvedValue(expected);

      const result = await controller.list(query);

      expect(mockService.listAttr).toHaveBeenCalledWith(1, 0, query);
      expect(result).toBe(expected);
    });

    it('type 未传时默认传 0', async () => {
      const query = { categoryId: 1, page: 1, limit: 10 } as any;
      mockService.listAttr.mockResolvedValue({ list: [], total: 0 });

      await controller.list(query);

      expect(mockService.listAttr).toHaveBeenCalledWith(1, 0, query);
    });
  });

  describe('update', () => {
    it('调用 service.updateAttr 并返回受影响行数', async () => {
      const dto = { name: '蓝色' } as any;
      mockService.updateAttr.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.updateAttr).toHaveBeenCalledWith(1, dto);
      expect(result).toBe(1);
    });
  });

  describe('getItem', () => {
    it('调用 service.getAttrItem 并返回属性详情', async () => {
      const expected = { id: 1, name: '红色' };
      mockService.getAttrItem.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.getAttrItem).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
