import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollectionService } from '@/modules/portal/collection/collection.service';
import { MemberProductCollectionNewEntity } from '@/modules/portal/collection/infrastructure/persistence/relational/entities/member-product-collection.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const collectionFixture = {
  id: 1,
  memberId: 100,
  productId: 20,
  productName: '测试商品',
  productPic: 'pic.png',
  productPrice: '99.00',
  createTime: new Date(),
} as MemberProductCollectionNewEntity;

describe('CollectionService', () => {
  let service: CollectionService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: getRepositoryToken(MemberProductCollectionNewEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();
    service = module.get(CollectionService);
  });

  describe('add', () => {
    it('正常收藏 -> 返回收藏记录', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(collectionFixture);

      const result = await service.add(100, {
        productId: 20,
        productName: '测试商品',
      });

      expect(result).toEqual(collectionFixture);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('已收藏 -> 抛出 BadRequestException', async () => {
      mockRepo.findOne.mockResolvedValue(collectionFixture);

      await expect(service.add(100, { productId: 20 })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('取消收藏 -> 调用 delete', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await service.delete(100, 20);

      expect(mockRepo.delete).toHaveBeenCalledWith({
        memberId: 100,
        productId: 20,
      });
    });
  });

  describe('list', () => {
    it('分页查询收藏列表', async () => {
      mockRepo.findAndCount.mockResolvedValue([[collectionFixture], 1]);

      const result = await service.list(100, { page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      const callArgs = mockRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.memberId).toBe(100);
    });
  });

  describe('clear', () => {
    it('清空该会员所有收藏记录', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 3 });

      await service.clear(100);

      expect(mockRepo.delete).toHaveBeenCalledWith({ memberId: 100 });
    });
  });

  describe('getDetail', () => {
    it('存在 -> 返回收藏详情', async () => {
      mockRepo.findOne.mockResolvedValue(collectionFixture);

      const result = await service.getDetail(100, 20);

      expect(result).toEqual(collectionFixture);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { memberId: 100, productId: 20 },
      });
    });

    it('不存在 -> 返回 null', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.getDetail(100, 999);

      expect(result).toBeNull();
    });
  });
});
