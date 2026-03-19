import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OssController } from '@/modules/oss/oss.controller';

describe('OssController', () => {
  let controller: OssController;
  const mockService = {
    getPolicy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new OssController(mockService as any);
  });

  describe('getPolicy', () => {
    it('调用 ossService.getPolicy 并返回策略', async () => {
      const policy = {
        accessKeyId: 'testKey',
        policy: 'base64policy',
        signature: 'sig',
        dir: 'upload/',
        host: 'https://bucket.oss.aliyuncs.com',
        expire: '1700000000',
      };
      mockService.getPolicy.mockResolvedValue(policy);

      const result = await controller.getPolicy();

      expect(result).toBe(policy);
      expect(mockService.getPolicy).toHaveBeenCalled();
    });
  });
});
