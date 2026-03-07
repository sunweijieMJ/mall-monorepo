import * as crypto from 'crypto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OssService } from '@/modules/oss/oss.service';

// ── Mock OSS 配置 ──

const mockOssConfig = {
  endpoint: 'oss-cn-hangzhou.aliyuncs.com',
  bucketName: 'test-bucket',
  accessKeyId: 'test-access-key-id',
  accessKeySecret: 'test-access-key-secret',
  dir: 'mall/images/',
};

const mockConfigService = {
  get: vi.fn().mockReturnValue(mockOssConfig),
};

describe('OssService', () => {
  let service: OssService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        OssService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get(OssService);
  });

  describe('getPolicy', () => {
    it('返回正确的 OSS 直传策略结构', async () => {
      const result = await service.getPolicy();

      // 验证返回结构包含所有必要字段
      expect(result).toHaveProperty('accessKeyId');
      expect(result).toHaveProperty('policy');
      expect(result).toHaveProperty('signature');
      expect(result).toHaveProperty('dir');
      expect(result).toHaveProperty('host');
      expect(result).toHaveProperty('expire');
    });

    it('accessKeyId 与配置一致', async () => {
      const result = await service.getPolicy();

      expect(result.accessKeyId).toBe('test-access-key-id');
    });

    it('dir 与配置一致', async () => {
      const result = await service.getPolicy();

      expect(result.dir).toBe('mall/images/');
    });

    it('host 格式为 https://{bucketName}.{endpoint}', async () => {
      const result = await service.getPolicy();

      expect(result.host).toBe(
        'https://test-bucket.oss-cn-hangzhou.aliyuncs.com',
      );
    });

    it('expire 为未来 300 秒的时间戳字符串', async () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const result = await service.getPolicy();

      const expireNum = Number(result.expire);
      // 允许 2 秒误差（测试执行耗时）
      expect(expireNum).toBeGreaterThanOrEqual(nowSec + 298);
      expect(expireNum).toBeLessThanOrEqual(nowSec + 302);
    });

    it('policy 为 Base64 编码的 JSON 字符串', async () => {
      const result = await service.getPolicy();

      // 解码 Base64，应该能解析为合法 JSON
      const decoded = JSON.parse(
        Buffer.from(result.policy, 'base64').toString('utf-8'),
      );
      expect(decoded).toHaveProperty('expiration');
      expect(decoded).toHaveProperty('conditions');
      expect(Array.isArray(decoded.conditions)).toBe(true);
    });

    it('policy 中包含文件大小限制和目录前缀限制', async () => {
      const result = await service.getPolicy();

      const decoded = JSON.parse(
        Buffer.from(result.policy, 'base64').toString('utf-8'),
      );
      const conditions = decoded.conditions;

      // content-length-range 条件
      const sizeCondition = conditions.find(
        (c: any) => Array.isArray(c) && c[0] === 'content-length-range',
      );
      expect(sizeCondition).toBeDefined();
      expect(sizeCondition[1]).toBe(0);
      expect(sizeCondition[2]).toBe(52428800); // 50MB

      // starts-with $key 条件
      const keyCondition = conditions.find(
        (c: any) =>
          Array.isArray(c) && c[0] === 'starts-with' && c[1] === '$key',
      );
      expect(keyCondition).toBeDefined();
      expect(keyCondition[2]).toBe('mall/images/');
    });

    it('signature 为 HMAC-SHA1 签名', async () => {
      const result = await service.getPolicy();

      // 手动计算签名进行对比
      const expectedSignature = crypto
        .createHmac('sha1', 'test-access-key-secret')
        .update(result.policy)
        .digest('base64');

      expect(result.signature).toBe(expectedSignature);
    });

    it('从 ConfigService 读取 app.aliyun.oss 配置', async () => {
      await service.getPolicy();

      expect(mockConfigService.get).toHaveBeenCalledWith('app.aliyun.oss', {
        infer: true,
      });
    });
  });
});
