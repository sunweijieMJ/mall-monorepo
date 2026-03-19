import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PortalProductController } from '@/modules/portal/product/portal-product.controller';

describe('PortalProductController', () => {
  let controller: PortalProductController;
  const mockService = {
    search: vi.fn(),
    categoryTreeList: vi.fn(),
    detail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PortalProductController(mockService as any);
  });

  describe('search', () => {
    it('调用 portalProductService.search 并返回分页结果', async () => {
      const query = {
        page: 1,
        limit: 10,
        keyword: '手机',
        brandId: 1,
        productCategoryId: 2,
        sort: 1,
      };
      const expected = { list: [], total: 0 };
      mockService.search.mockResolvedValue(expected);

      const result = await controller.search(query as any);

      expect(mockService.search).toHaveBeenCalledWith(query, '手机', 1, 2, 1);
      expect(result).toBe(expected);
    });
  });

  describe('categoryTreeList', () => {
    it('调用 portalProductService.categoryTreeList 并返回分类树', async () => {
      const expected = [{ id: 1, children: [] }];
      mockService.categoryTreeList.mockResolvedValue(expected);

      const result = await controller.categoryTreeList();

      expect(mockService.categoryTreeList).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });

  describe('getItem', () => {
    it('调用 portalProductService.detail 并返回商品详情', async () => {
      const expected = { id: 1, name: '商品A' };
      mockService.detail.mockResolvedValue(expected);

      const result = await controller.getItem(1);

      expect(mockService.detail).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
  });
});
