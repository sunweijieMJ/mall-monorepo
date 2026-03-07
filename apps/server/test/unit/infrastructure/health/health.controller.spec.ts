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
});
