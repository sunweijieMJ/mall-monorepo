import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReadHistoryService } from '@/modules/portal/read-history/read-history.service';
import { MemberReadHistoryNewEntity } from '@/modules/portal/read-history/infrastructure/persistence/relational/entities/member-read-history.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const historyFixture = {
  id: 1,
  memberId: 100,
  productId: 20,
  productName: '测试商品',
  productPic: 'pic.png',
  productPrice: '99.00',
  createTime: new Date(),
} as MemberReadHistoryNewEntity;

describe('ReadHistoryService', () => {
  let service: ReadHistoryService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ReadHistoryService,
        {
          provide: getRepositoryToken(MemberReadHistoryNewEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();
    service = module.get(ReadHistoryService);
  });

  describe('save', () => {
    it('先删除旧记录再插入新记录', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });
      mockRepo.save.mockResolvedValue(historyFixture);

      const result = await service.save(100, {
        productId: 20,
        productName: '测试商品',
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
      mockRepo.delete.mockResolvedValue({ affected: 0 });
      mockRepo.save.mockResolvedValue(historyFixture);

      const result = await service.save(100, { productId: 20 });

      expect(mockRepo.delete).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result).toEqual(historyFixture);
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
      expect(callArgs.order.createTime).toBe('DESC');
    });
  });

  describe('clear', () => {
    it('清空该会员所有浏览历史', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 10 });

      await service.clear(100);

      expect(mockRepo.delete).toHaveBeenCalledWith({ memberId: 100 });
    });
  });
});
