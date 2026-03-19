import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomeController } from '@/modules/portal/home/home.controller';

describe('HomeController', () => {
  let controller: HomeController;
  const mockService = {
    getHomeContent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HomeController(mockService as any);
  });

  describe('getHomeContent', () => {
    it('调用 homeService.getHomeContent 并返回首页数据', async () => {
      const expected = { advertiseList: [], brandList: [] };
      mockService.getHomeContent.mockResolvedValue(expected);

      const result = await controller.getHomeContent();

      expect(mockService.getHomeContent).toHaveBeenCalled();
      expect(result).toBe(expected);
    });
  });
});
