import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AttentionService } from '@/modules/portal/attention/attention.service';
import { MemberBrandAttentionNewEntity } from '@/modules/portal/attention/infrastructure/persistence/relational/entities/member-brand-attention.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const attentionFixture = {
  id: 1,
  memberId: 100,
  brandId: 10,
  brandName: 'Nike',
  brandLogo: 'logo.png',
  createTime: new Date(),
} as MemberBrandAttentionNewEntity;

describe('AttentionService', () => {
  let service: AttentionService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AttentionService,
        {
          provide: getRepositoryToken(MemberBrandAttentionNewEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();
    service = module.get(AttentionService);
  });

  describe('add', () => {
    it('正常关注 -> 返回关注记录', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(attentionFixture);

      const result = await service.add(100, { brandId: 10, brandName: 'Nike' });

      expect(result).toEqual(attentionFixture);
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('已关注 -> 抛出 BadRequestException', async () => {
      mockRepo.findOne.mockResolvedValue(attentionFixture);

      await expect(service.add(100, { brandId: 10 })).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('取消关注 -> 调用 delete', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 1 });

      await service.delete(100, 10);

      expect(mockRepo.delete).toHaveBeenCalledWith({
        memberId: 100,
        brandId: 10,
      });
    });
  });

  describe('list', () => {
    it('分页查询关注列表', async () => {
      mockRepo.findAndCount.mockResolvedValue([[attentionFixture], 1]);

      const result = await service.list(100, { page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
      const callArgs = mockRepo.findAndCount.mock.calls[0][0];
      expect(callArgs.where.memberId).toBe(100);
    });
  });

  describe('clear', () => {
    it('清空该会员所有关注记录', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 5 });

      await service.clear(100);

      expect(mockRepo.delete).toHaveBeenCalledWith({ memberId: 100 });
    });
  });
});
