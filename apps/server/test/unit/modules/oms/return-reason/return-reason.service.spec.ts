import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReturnReasonService } from '@/modules/oms/return-reason/return-reason.service';
import { ReturnReasonEntity } from '@/modules/oms/return-reason/infrastructure/persistence/relational/entities/return-reason.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const reasonFixture = {
  id: 1,
  name: '质量问题',
  sort: 100,
  status: 1,
  createTime: new Date(),
} as ReturnReasonEntity;

describe('ReturnReasonService', () => {
  let service: ReturnReasonService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ReturnReasonService,
        { provide: getRepositoryToken(ReturnReasonEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(ReturnReasonService);
  });

  describe('list', () => {
    it('分页查询退货原因列表', async () => {
      mockRepo.findAndCount.mockResolvedValue([[reasonFixture], 1]);

      const result = await service.list({ page: 1, limit: 10 } as any);

      expect(result.list).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('create', () => {
    it('创建退货原因，默认 status=1', async () => {
      mockRepo.save.mockResolvedValue(reasonFixture);

      const result = await service.create({ name: '质量问题', sort: 100 });

      expect(result).toEqual(reasonFixture);
      // 验证 create 传入了 status: 1
      const createArgs = mockRepo.create.mock.calls[0][0];
      expect(createArgs.status).toBe(1);
    });
  });

  describe('update', () => {
    it('更新退货原因', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { name: '尺码不合适' });

      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: '尺码不合适' });
    });
  });

  describe('delete', () => {
    it('批量删除退货原因', async () => {
      mockRepo.delete.mockResolvedValue({ affected: 2 });

      await service.delete([1, 2]);

      expect(mockRepo.delete).toHaveBeenCalledWith([1, 2]);
    });
  });

  describe('getItem', () => {
    it('存在 -> 返回退货原因', async () => {
      mockRepo.findOneBy.mockResolvedValue(reasonFixture);

      const result = await service.getItem(1);

      expect(result).toEqual(reasonFixture);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('不存在 -> 返回 null', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.getItem(999);

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('批量更新状态', async () => {
      mockRepo.update.mockResolvedValue({ affected: 2 });

      await service.updateStatus([1, 2], 0);

      expect(mockRepo.update).toHaveBeenCalled();
      const callArgs = mockRepo.update.mock.calls[0];
      // 第一个参数是 where 条件
      expect(callArgs[1]).toEqual({ status: 0 });
    });
  });
});
