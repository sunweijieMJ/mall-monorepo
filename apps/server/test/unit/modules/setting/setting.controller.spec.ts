import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingController } from '@/modules/setting/setting.controller';

describe('SettingController', () => {
  let controller: SettingController;
  const mockService = {
    findByPath: vi.fn(),
    upsert: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new SettingController(mockService as any);
  });

  describe('findByPath', () => {
    it('调用 service.findByPath 并返回结果', async () => {
      const entity = { id: 1, path: 'theme', value: { color: 'red' } };
      mockService.findByPath.mockResolvedValue(entity);

      const result = await controller.findByPath('theme');

      expect(result).toBe(entity);
      expect(mockService.findByPath).toHaveBeenCalledWith('theme');
    });
  });

  describe('upsert', () => {
    it('调用 service.upsert 并返回结果', async () => {
      const entity = { id: 1, path: 'theme', value: { color: 'blue' } };
      mockService.upsert.mockResolvedValue(entity);

      const dto = { value: { color: 'blue' } };
      const result = await controller.upsert('theme', dto as any);

      expect(result).toBe(entity);
      expect(mockService.upsert).toHaveBeenCalledWith('theme', {
        color: 'blue',
      });
    });
  });
});
