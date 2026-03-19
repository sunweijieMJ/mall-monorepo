import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SkuStockController } from '@/modules/pms/sku-stock/sku-stock.controller';

describe('SkuStockController', () => {
  let controller: SkuStockController;
  const mockService = {
    getList: vi.fn(),
    update: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SkuStockController(mockService as any);
  });

  describe('list', () => {
    it('调用 service.getList 并返回 SKU 列表', async () => {
      const expected = [{ id: 1, skuCode: 'SKU001' }];
      mockService.getList.mockResolvedValue(expected);

      const result = await controller.list(1, 'SKU');

      expect(mockService.getList).toHaveBeenCalledWith(1, 'SKU');
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('调用 service.update 并转换 decimal 字段', async () => {
      const dto = {
        stocks: [
          { id: 1, price: 99.9, promotionPrice: 79.9, stock: 100 },
          { id: 2, price: null, promotionPrice: null, stock: 50 },
        ],
      } as any;
      mockService.update.mockResolvedValue(2);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, [
        { id: 1, price: '99.9', promotionPrice: '79.9', stock: 100 },
        { id: 2, stock: 50 },
      ]);
      expect(result).toBe(2);
    });

    it('price=0 时应转为字符串 "0" 而非被省略', async () => {
      const dto = {
        stocks: [{ id: 1, price: 0, promotionPrice: 0, stock: 10 }],
      } as any;
      mockService.update.mockResolvedValue(1);

      const result = await controller.update(1, dto);

      expect(mockService.update).toHaveBeenCalledWith(1, [
        { id: 1, price: '0', promotionPrice: '0', stock: 10 },
      ]);
      expect(result).toBe(1);
    });
  });
});
