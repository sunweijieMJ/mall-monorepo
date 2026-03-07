import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HealthCheckError } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@/infrastructure/health/indicators/redis.health';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let mockRedisClient: { ping: ReturnType<typeof vi.fn> };
  let mockConfigService: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockRedisClient = { ping: vi.fn() };
    mockConfigService = { get: vi.fn().mockReturnValue(true) };
    indicator = new RedisHealthIndicator(
      mockConfigService as any,
      mockRedisClient as any,
    );
  });

  it('ping 成功 → 健康', async () => {
    mockRedisClient.ping.mockResolvedValue('PONG');
    const result = await indicator.isHealthy('redis');
    expect(result).toEqual({ redis: { status: 'up' } });
  });

  it('ping 异常 → 抛出 HealthCheckError', async () => {
    mockRedisClient.ping.mockRejectedValue(new Error('Connection refused'));
    await expect(indicator.isHealthy('redis')).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('Redis 未启用 → 返回健康并标注已禁用', async () => {
    mockConfigService.get.mockReturnValue(false);
    const result = await indicator.isHealthy('redis');
    expect(result).toEqual({
      redis: { status: 'up', message: 'Redis 已禁用' },
    });
    expect(mockRedisClient.ping).not.toHaveBeenCalled();
  });
});
