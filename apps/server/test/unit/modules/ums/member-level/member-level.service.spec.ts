import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MemberLevelService } from '@/modules/ums/member-level/member-level.service';
import { MemberLevelEntity } from '@/modules/ums/member-level/infrastructure/persistence/relational/entities/member-level.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const levelFixture = {
  id: 1,
  name: '银牌会员',
  growthPoint: 1000,
  defaultStatus: 0,
  freeFreightPoint: '199.00',
  commentGrowthPoint: 5,
  privilegeFreeFreight: 1,
} as MemberLevelEntity;

describe('MemberLevelService', () => {
  let service: MemberLevelService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        MemberLevelService,
        { provide: getRepositoryToken(MemberLevelEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(MemberLevelService);
  });

  describe('list', () => {
    it('不传 defaultStatus -> 查全部', async () => {
      mockRepo.find.mockResolvedValue([levelFixture]);

      const result = await service.list();

      expect(result).toHaveLength(1);
      // 不带 where 条件调用
      expect(mockRepo.find).toHaveBeenCalledWith();
    });

    it('传 defaultStatus=1 -> 按条件查询', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.list(1);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { defaultStatus: 1 },
      });
    });
  });

  describe('getItem', () => {
    it('存在 -> 返回会员等级', async () => {
      mockRepo.findOne.mockResolvedValue(levelFixture);

      const result = await service.getItem(1);

      expect(result.name).toBe('银牌会员');
    });

    it('不存在 -> 抛出 NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.getItem(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('创建会员等级', async () => {
      mockRepo.save.mockResolvedValue(levelFixture);

      const result = await service.create({
        name: '银牌会员',
        growthPoint: 1000,
      });

      expect(result).toEqual(levelFixture);
      expect(mockRepo.create).toHaveBeenCalled();
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('带 freeFreightPoint → 转为字符串写入', async () => {
      mockRepo.save.mockResolvedValue(levelFixture);

      await service.create({
        name: '金牌会员',
        growthPoint: 2000,
        freeFreightPoint: 99,
      } as any);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ freeFreightPoint: '99' }),
      );
    });

    it('不传 freeFreightPoint → 不包含该字段', async () => {
      mockRepo.save.mockResolvedValue(levelFixture);

      await service.create({
        name: '普通会员',
        growthPoint: 500,
      });

      const createArg = mockRepo.create.mock.calls[0][0];
      expect(createArg).not.toHaveProperty('freeFreightPoint');
    });

    it('freeFreightPoint 为 null → 不包含该字段', async () => {
      mockRepo.save.mockResolvedValue(levelFixture);

      await service.create({
        name: '普通会员',
        growthPoint: 500,
        freeFreightPoint: null,
      } as any);

      const createArg = mockRepo.create.mock.calls[0][0];
      expect(createArg).not.toHaveProperty('freeFreightPoint');
    });
  });

  describe('update', () => {
    it('存在 -> 更新并返回', async () => {
      // getItem 会调用 findOne 两次（update 前检查 + update 后获取）
      mockRepo.findOne
        .mockResolvedValueOnce(levelFixture) // 第一次：确认存在
        .mockResolvedValueOnce({ ...levelFixture, name: '金牌会员' }); // 第二次：返回更新后
      mockRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, { name: '金牌会员' });

      expect(result.name).toBe('金牌会员');
      expect(mockRepo.update).toHaveBeenCalledWith(1, { name: '金牌会员' });
    });

    it('不存在 -> 抛出 NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('带 freeFreightPoint → 转为字符串写入', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce(levelFixture)
        .mockResolvedValueOnce({ ...levelFixture, freeFreightPoint: '199.00' });
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { freeFreightPoint: 199 } as any);

      expect(mockRepo.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ freeFreightPoint: '199' }),
      );
    });

    it('freeFreightPoint 为 null → 不包含该字段', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce(levelFixture)
        .mockResolvedValueOnce(levelFixture);
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { freeFreightPoint: null } as any);

      const updateArg = mockRepo.update.mock.calls[0][1];
      expect(updateArg).not.toHaveProperty('freeFreightPoint');
    });
  });

  describe('delete', () => {
    it('批量删除会员等级', async () => {
      mockRepo.softDelete.mockResolvedValue({ affected: 2 });

      await service.delete([1, 2]);

      expect(mockRepo.softDelete).toHaveBeenCalled();
    });

    it('affected undefined → 返回 0', async () => {
      mockRepo.softDelete.mockResolvedValue({});

      const result = await service.delete([1, 2]);

      expect(result).toBe(0);
    });

    it('affected null → 返回 0', async () => {
      mockRepo.softDelete.mockResolvedValue({ affected: null });

      const result = await service.delete([1, 2]);

      expect(result).toBe(0);
    });
  });
});
