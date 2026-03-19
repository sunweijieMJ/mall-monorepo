import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { ReadHistoryService } from '@/modules/portal/read-history/read-history.service';
import { MemberReadHistoryNewEntity } from '@/modules/portal/read-history/infrastructure/persistence/relational/entities/member-read-history.entity';
import { ProductEntity } from '@/modules/pms/product/infrastructure/persistence/relational/entities/product.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const historyFixture = {
  id: 1,
  memberId: 100,
  productId: 20,
  productName: '测试商品',
  productPic: 'pic.png',
  productPrice: '99.00',
  createdAt: new Date(),
} as MemberReadHistoryNewEntity;

/** 商品 mock 数据 */
const productFixture = {
  id: 20,
  name: '测试商品',
  pic: 'pic.png',
  price: '99.00',
} as ProductEntity;

describe('ReadHistoryService', () => {
  let service: ReadHistoryService;
  const mockRepo = createMockRepository();
  const mockProductRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ReadHistoryService,
        {
          provide: getRepositoryToken(MemberReadHistoryNewEntity),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: mockProductRepo,
        },
      ],
    }).compile();
    service = module.get(ReadHistoryService);
  });

  describe('save', () => {
    it('先删除旧记录再插入新记录', async () => {
      mockProductRepo.findOne.mockResolvedValue(productFixture);
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      mockRepo.save.mockResolvedValue(historyFixture);

      const result = await service.save(100, { productId: 20 });

      // 验证查询了商品信息
      expect(mockProductRepo.findOne).toHaveBeenCalledWith({
        where: { id: 20 },
      });
      // 验证先删除旧记录
      expect(mockRepo.delete).toHaveBeenCalledWith({
        memberId: 100,
        productId: 20,
      });
      // 验证再插入新记录
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(historyFixture);
    });

    it('无旧记录时也能正常插入', async () => {
      mockProductRepo.findOne.mockResolvedValue(productFixture);
      mockRepo.delete.mockResolvedValue({ affected: 0 });
      mockRepo.save.mockResolvedValue(historyFixture);

      const result = await service.save(100, { productId: 20 });

      expect(mockRepo.delete).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(historyFixture);
    });

    it('商品不存在 → NotFoundException', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(service.save(100, { productId: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('list', () => {
    it('分页查询浏览历史', async () => {
      mockRepo.findAndCount.mockResolvedValue([[historyFixture], 1]);

      const result = await service.list(100, { page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      const callArgs = mockRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.memberId).toBe(100);
      expect(callArgs.order.createdAt).toBe('DESC');
    });
  });

  describe('clear', () => {
    it('清空该会员所有浏览历史', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 10 });

      await service.clear(100);

      expect(mockRepo.delete).toHaveBeenCalledWith({ memberId: 100 });
    });

    it('affected undefined → 返回 0', async () => {
      mockRepo.delete.mockResolvedValue({});

      const result = await service.clear(100);

      expect(result).toBe(0);
    });

    it('affected null → 返回 0', async () => {
      mockRepo.delete.mockResolvedValue({ affected: null });

      const result = await service.clear(100);

      expect(result).toBe(0);
    });
  });

  describe('batchDelete', () => {
    it('空数组 → 返回 0，不调用 delete', async () => {
      const result = await service.batchDelete(100, []);
      expect(result).toBe(0);
      expect(mockRepo.delete).not.toHaveBeenCalled();
    });

    it('正常删除 → 返回 affected 数', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 2 });
      const result = await service.batchDelete(100, [1, 2]);
      expect(result).toBe(2);
      expect(mockRepo.delete).toHaveBeenCalledWith({
        id: In([1, 2]),
        memberId: 100,
      });
    });

    it('affected undefined → 返回 0', async () => {
      mockRepo.delete.mockResolvedValue({});

      const result = await service.batchDelete(100, [1, 2]);

      expect(result).toBe(0);
    });

    it('affected null → 返回 0', async () => {
      mockRepo.delete.mockResolvedValue({ affected: null });

      const result = await service.batchDelete(100, [1, 2]);

      expect(result).toBe(0);
    });
  });
});
