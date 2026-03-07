import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SkuStockService } from '@/modules/pms/sku-stock/sku-stock.service';
import { SkuStockEntity } from '@/modules/pms/sku-stock/infrastructure/persistence/relational/entities/sku-stock.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const skuFixture = {
  id: 1,
  productId: 10,
  skuCode: 'SKU-001',
  price: '99.00',
  stock: 100,
} as SkuStockEntity;

describe('SkuStockService', () => {
  let service: SkuStockService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        SkuStockService,
        { provide: getRepositoryToken(SkuStockEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(SkuStockService);
  });

  describe('getList', () => {
    it('无关键词 -> 按 productId 查询', async () => {
      mockRepo.find.mockResolvedValue([skuFixture]);

      const result = await service.getList(10);

      expect(result).toHaveLength(1);
      const callArgs = mockRepo.find.mock.calls[0][0];
      expect(callArgs.where.productId).toBe(10);
      expect(callArgs.where.skuCode).toBeUndefined();
    });

    it('带关键词 -> 使用 Like 查询 skuCode', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.getList(10, 'SKU');

      const callArgs = mockRepo.find.mock.calls[0][0];
      expect(callArgs.where.productId).toBe(10);
      expect(callArgs.where.skuCode).toBeDefined();
    });
  });

  describe('update', () => {
    it('批量更新 SKU 库存', async () => {
      mockRepo.save.mockResolvedValue([skuFixture]);

      const stocks = [
        { id: 1, productId: 10, stock: 200 },
        { id: 2, productId: 10, stock: 300 },
      ];
      await service.update(10, stocks);

      expect(mockRepo.save).toHaveBeenCalled();
      const savedEntities = mockRepo.save.mock.calls[0][0];
      // 所有项的 productId 应为目标商品 ID
      savedEntities.forEach((item: any) => {
        expect(item.productId).toBe(10);
      });
    });

    it('过滤掉不属于该商品的 SKU', async () => {
      mockRepo.save.mockResolvedValue([]);

      const stocks = [
        { id: 1, productId: 10, stock: 200 },
        { id: 2, productId: 99, stock: 300 }, // 不属于 productId=10
      ];
      await service.update(10, stocks);

      const savedEntities = mockRepo.save.mock.calls[0][0];
      expect(savedEntities).toHaveLength(1);
      expect(savedEntities[0].productId).toBe(10);
    });

    it('无 productId 的项默认归属当前商品', async () => {
      mockRepo.save.mockResolvedValue([]);

      const stocks = [{ id: 1, stock: 200 }]; // 没有 productId
      await service.update(10, stocks);

      const savedEntities = mockRepo.save.mock.calls[0][0];
      expect(savedEntities).toHaveLength(1);
      expect(savedEntities[0].productId).toBe(10);
    });
  });
});
