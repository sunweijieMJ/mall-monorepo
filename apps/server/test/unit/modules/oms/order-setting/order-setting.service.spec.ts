import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderSettingService } from '@/modules/oms/order-setting/order-setting.service';
import { OrderSettingEntity } from '@/modules/oms/order-setting/infrastructure/persistence/relational/entities/order-setting.entity';
import { createMockRepository } from '../../../../helpers/mock.factory';

const settingFixture = {
  id: 1,
  flashOrderOvertime: 60,
  normalOrderOvertime: 120,
  confirmOvertime: 15,
  finishOvertime: 7,
  commentOvertime: 7,
} as OrderSettingEntity;

describe('OrderSettingService', () => {
  let service: OrderSettingService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OrderSettingService,
        { provide: getRepositoryToken(OrderSettingEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(OrderSettingService);
  });

  describe('getItem', () => {
    it('存在 -> 返回订单设置', async () => {
      mockRepo.findOneBy.mockResolvedValue(settingFixture);

      const result = await service.getItem(1);

      expect(result).toEqual(settingFixture);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('不存在 -> 返回 null', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.getItem(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('更新订单设置', async () => {
      mockRepo.update.mockResolvedValue({ affected: 1 });

      await service.update(1, { normalOrderOvertime: 180 });

      expect(mockRepo.update).toHaveBeenCalledWith(1, {
        normalOrderOvertime: 180,
      });
    });
  });
});
