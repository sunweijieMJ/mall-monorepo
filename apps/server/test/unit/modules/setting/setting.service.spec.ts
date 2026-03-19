import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SettingService } from '@/modules/setting/setting.service';
import { SettingEntity } from '@/modules/setting/infrastructure/persistence/relational/entities/setting.entity';
import { createMockRepository } from '../../../helpers/mock.factory';

describe('SettingService', () => {
  let service: SettingService;
  const mockRepo = createMockRepository();

  beforeEach(async () => {
    vi.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        SettingService,
        { provide: getRepositoryToken(SettingEntity), useValue: mockRepo },
      ],
    }).compile();

    service = module.get(SettingService);
  });

  describe('findByPath', () => {
    it('存在记录 → 返回实体', async () => {
      const entity = { id: 1, path: 'theme', value: { color: 'red' } };
      mockRepo.findOneBy.mockResolvedValue(entity);

      const result = await service.findByPath('theme');

      expect(result).toBe(entity);
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ path: 'theme' });
    });

    it('记录不存在 → 返回 null', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);

      const result = await service.findByPath('non-existent');

      expect(result).toBeNull();
      expect(mockRepo.findOneBy).toHaveBeenCalledWith({ path: 'non-existent' });
    });
  });

  describe('upsert', () => {
    it('已有记录 → 更新 value 并保存', async () => {
      const existing = { id: 1, path: 'theme', value: { color: 'red' } };
      mockRepo.findOneBy.mockResolvedValue(existing);
      mockRepo.save.mockResolvedValue({
        ...existing,
        value: { color: 'blue' },
      });

      const result = await service.upsert('theme', { color: 'blue' });

      expect(existing.value).toEqual({ color: 'blue' });
      expect(mockRepo.save).toHaveBeenCalledWith(existing);
      expect(result.value).toEqual({ color: 'blue' });
    });

    it('记录不存在 → 创建新记录并保存', async () => {
      mockRepo.findOneBy.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue({
        id: 2,
        path: 'frontend',
        value: { logo: 'a.png' },
      });

      const result = await service.upsert('frontend', { logo: 'a.png' });

      expect(mockRepo.create).toHaveBeenCalledWith({
        path: 'frontend',
        value: { logo: 'a.png' },
      });
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.path).toBe('frontend');
    });
  });
});
