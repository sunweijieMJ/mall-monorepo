import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PrefrenceAreaService } from '@/modules/cms/prefrence-area/prefrence-area.service';
import { PrefrenceAreaEntity } from '@/modules/cms/prefrence-area/infrastructure/persistence/relational/entities/prefrence-area.entity';
import { PrefrenceAreaProductRelationEntity } from '@/modules/cms/prefrence-area/infrastructure/persistence/relational/entities/prefrence-area-product-relation.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { TransactionService } from '@/infrastructure/database/transaction/transaction.service';
import { createMockRepository } from '../../../../helpers/mock.factory';

// ── 测试夹具 ──

const areaFixture = {
  id: 1,
  name: '精品推荐',
  subTitle: '精选好物',
  sort: 0,
  showStatus: 1,
  pic: 'https://example.com/pic.jpg',
} as PrefrenceAreaEntity;

const relationFixture = {
  id: 1,
  prefrenceAreaId: 1,
  productId: 200,
} as PrefrenceAreaProductRelationEntity;

const productFixture = {
  id: 200,
  name: '推荐商品A',
  publishStatus: 1,
  deleteStatus: 0,
} as ProductEntity;

// ── Mock TransactionService ──
const mockManager = {
  delete: vi.fn().mockResolvedValue({ affected: 1 }),
};
const mockTransactionService = {
  run: vi.fn((cb: (manager: any) => Promise<any>) => cb(mockManager)),
};

describe('PrefrenceAreaService', () => {
  let service: PrefrenceAreaService;
  const mockAreaRepo = createMockRepository();
  const mockRelationRepo = createMockRepository();
  const mockProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PrefrenceAreaService,
        {
          provide: getRepositoryToken(PrefrenceAreaEntity),
          useValue: mockAreaRepo,
        },
        {
          provide: getRepositoryToken(PrefrenceAreaProductRelationEntity),
          useValue: mockRelationRepo,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
        { provide: TransactionService, useValue: mockTransactionService },
      ],
    }).compile();
    service = module.get(PrefrenceAreaService);
  });

  // ── list ──

  describe('list', () => {
    it('返回全部优选专区列表（按 sort ASC, id DESC）', async () => {
      mockAreaRepo.find.mockResolvedValue([areaFixture]);

      const result = await service.list();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('精品推荐');
      const callArgs = mockAreaRepo.find.mock.calls[0][0];
      expect(callArgs.order.sort).toBe('ASC');
      expect(callArgs.order.id).toBe('DESC');
    });
  });

  // ── create ──

  describe('create', () => {
    it('正常创建 → 返回保存后的实体', async () => {
      mockAreaRepo.save.mockResolvedValue(areaFixture);

      const dto = { name: '精品推荐', subTitle: '精选好物', sort: 0 } as any;
      const result = await service.create(dto);

      expect(result.id).toBe(1);
      expect(mockAreaRepo.create).toHaveBeenCalled();
      expect(mockAreaRepo.save).toHaveBeenCalled();
    });
  });

  // ── update ──

  describe('update', () => {
    it('正常更新 → 调用 repo.update', async () => {
      mockAreaRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { name: '更新后的专区名' } as any);

      expect(mockAreaRepo.update).toHaveBeenCalledWith(1, {
        name: '更新后的专区名',
      });
    });
  });

  // ── delete ──

  describe('delete', () => {
    it('批量删除 → 事务中先删关联关系再删专区', async () => {
      await service.delete([1, 2]);

      // 验证 transactionService.run 被调用
      expect(mockTransactionService.run).toHaveBeenCalledTimes(1);
      // 验证 manager.delete 被调用两次
      expect(mockManager.delete).toHaveBeenCalledTimes(2);
      // 第一次删除关联关系
      expect(mockManager.delete.mock.calls[0][0]).toBe(
        PrefrenceAreaProductRelationEntity,
      );
      // 第二次删除专区本体
      expect(mockManager.delete.mock.calls[1][0]).toBe(PrefrenceAreaEntity);
    });
  });

  // ── getProductList ──

  describe('getProductList', () => {
    it('有关联商品 → 返回商品分页列表', async () => {
      mockRelationRepo.findAndCount.mockResolvedValue([[relationFixture], 1]);
      mockProductRepo.find.mockResolvedValue([productFixture]);

      const result = await service.getProductList(1, {
        page: 1,
        limit: 10,
      } as any);

      expect(result.list).toHaveLength(1);
      expect(result.list[0].id).toBe(200);
      expect(result.total).toBe(1);
    });

    it('无关联商品 → 返回空列表且不查 productRepo', async () => {
      mockRelationRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getProductList(1, {
        page: 1,
        limit: 10,
      } as any);

      expect(result.list).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(mockProductRepo.find).not.toHaveBeenCalled();
    });

    it('分页参数正确透传到关联表查询', async () => {
      mockRelationRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.getProductList(1, { page: 2, limit: 8 } as any);

      const callArgs = mockRelationRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.prefrenceAreaId).toBe(1);
      expect(callArgs.skip).toBe(8); // (2-1)*8
      expect(callArgs.take).toBe(8);
    });

    it('多个关联商品 → 按 productId 查询商品', async () => {
      const relations = [
        { id: 1, prefrenceAreaId: 1, productId: 200 },
        { id: 2, prefrenceAreaId: 1, productId: 201 },
      ] as PrefrenceAreaProductRelationEntity[];
      const products = [
        { id: 200, name: '商品A' },
        { id: 201, name: '商品B' },
      ] as ProductEntity[];

      mockRelationRepo.findAndCount.mockResolvedValue([relations, 2]);
      mockProductRepo.find.mockResolvedValue(products);

      const result = await service.getProductList(1, {
        page: 1,
        limit: 10,
      } as any);

      expect(result.list).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
