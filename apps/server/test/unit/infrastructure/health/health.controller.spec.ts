import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from '@/infrastructure/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let mockHealthCheckService: {
    check: ReturnType<typeof vi.fn>;
  };
  let mockDb: { pingCheck: ReturnType<typeof vi.fn> };
  let mockMemory: { checkHeap: ReturnType<typeof vi.fn> };
  let mockRedis: { isHealthy: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockHealthCheckService = {
      // HealthCheckService.check 接收一个函数数组，依次执行
      check: vi.fn(async (indicators: (() => Promise<any>)[]) => {
        const results: Record<string, any> = {};
        for (const indicator of indicators) {
          const result = await indicator();
          Object.assign(results, result);
        }
        return { status: 'ok', details: results };
      }),
    };
    mockDb = {
      pingCheck: vi.fn().mockResolvedValue({ database: { status: 'up' } }),
    };
    mockMemory = {
      checkHeap: vi.fn().mockResolvedValue({ memory_heap: { status: 'up' } }),
    };
    mockRedis = {
      isHealthy: vi.fn().mockResolvedValue({ redis: { status: 'up' } }),
    };

    controller = new HealthController(
      mockHealthCheckService as any,
      mockDb as any,
      mockMemory as any,
      mockRedis as any,
    );
  });

  it('check() → 返回数据库/Redis/内存健康状态', async () => {
    const result = await controller.check();

    expect(result.status).toBe('ok');
    expect(mockHealthCheckService.check).toHaveBeenCalledOnce();
    // 验证 3 个健康指标都被调用
    expect(mockDb.pingCheck).toHaveBeenCalledWith('database');
    expect(mockRedis.isHealthy).toHaveBeenCalledWith('redis');
    expect(mockMemory.checkHeap).toHaveBeenCalledWith(
      'memory_heap',
      512 * 1024 * 1024,
    );
  });

  it('check() → 包含所有 3 个检查项的结果', async () => {
    const result = await controller.check();

    expect(result.details).toHaveProperty('database');
    expect(result.details).toHaveProperty('redis');
    expect(result.details).toHaveProperty('memory_heap');
  });

  it('DB pingCheck 抛异常 → status 为 error，database 为 down', async () => {
    mockDb.pingCheck.mockRejectedValue(new Error('Connection refused'));
    mockHealthCheckService.check.mockImplementation(
      async (indicators: (() => Promise<any>)[]) => {
        const details: Record<string, any> = {};
        for (const indicator of indicators) {
          try {
            const result = await indicator();
            Object.assign(details, result);
          } catch (e) {
            details.database = {
              status: 'down',
              message: (e as Error).message,
            };
          }
        }
        const hasError = Object.values(details).some(
          (d: any) => d.status === 'down',
        );
        return { status: hasError ? 'error' : 'ok', details };
      },
    );

    const result = await controller.check();

    expect(result.status).toBe('error');
    expect(result.details.database.status).toBe('down');
  });

  it('Redis isHealthy 抛异常 → 结果包含 redis error', async () => {
    mockRedis.isHealthy.mockRejectedValue(new Error('Redis timeout'));
    mockHealthCheckService.check.mockImplementation(
      async (indicators: (() => Promise<any>)[]) => {
        const details: Record<string, any> = {};
        for (const indicator of indicators) {
          try {
            const result = await indicator();
            Object.assign(details, result);
          } catch (e) {
            details.redis = { status: 'down', message: (e as Error).message };
          }
        }
        const hasError = Object.values(details).some(
          (d: any) => d.status === 'down',
        );
        return { status: hasError ? 'error' : 'ok', details };
      },
    );

    const result = await controller.check();

    expect(result.status).toBe('error');
    expect(result.details.redis.status).toBe('down');
    expect(result.details.redis.message).toContain('Redis timeout');
  });

  it('多个 indicator 同时失败 → 结果中包含所有失败项', async () => {
    mockDb.pingCheck.mockRejectedValue(new Error('DB down'));
    mockRedis.isHealthy.mockRejectedValue(new Error('Redis down'));
    mockHealthCheckService.check.mockImplementation(
      async (indicators: (() => Promise<any>)[]) => {
        const details: Record<string, any> = {};
        for (const indicator of indicators) {
          try {
            const result = await indicator();
            Object.assign(details, result);
          } catch (e) {
            // 根据错误消息推断哪个 indicator 失败
            const msg = (e as Error).message;
            if (msg.includes('DB'))
              details.database = { status: 'down', message: msg };
            if (msg.includes('Redis'))
              details.redis = { status: 'down', message: msg };
          }
        }
        const hasError = Object.values(details).some(
          (d: any) => d.status === 'down',
        );
        return { status: hasError ? 'error' : 'ok', details };
      },
    );

    const result = await controller.check();

    expect(result.status).toBe('error');
    expect(result.details.database.status).toBe('down');
    expect(result.details.redis.status).toBe('down');
    expect(result.details.memory_heap.status).toBe('up');
  });
});
