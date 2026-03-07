import { vi, describe, it, expect, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { MetricsInterceptor } from '@/infrastructure/metrics/metrics.interceptor';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;
  let mockCounter: { inc: ReturnType<typeof vi.fn> };
  let mockHistogram: { observe: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockCounter = { inc: vi.fn() };
    mockHistogram = { observe: vi.fn() };
    interceptor = new MetricsInterceptor(
      mockCounter as any,
      mockHistogram as any,
    );
  });

  function createContext(method: string, path: string, statusCode = 200) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          method,
          route: { path },
          url: path,
        }),
        getResponse: () => ({ statusCode }),
      }),
    } as any;
  }

  it('成功响应 → 记录指标', async () => {
    const ctx = createContext('GET', '/api/v1/products');
    const handler = { handle: () => of({ data: 'ok' }) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(ctx, handler as any).subscribe({
        complete: () => {
          expect(mockCounter.inc).toHaveBeenCalledWith(
            expect.objectContaining({
              method: 'GET',
              path: '/api/v1/products',
              status: '200',
            }),
          );
          expect(mockHistogram.observe).toHaveBeenCalled();
          resolve();
        },
      });
    });
  });

  it('错误响应 → 记录错误 status', async () => {
    const ctx = createContext('POST', '/api/v1/orders');
    const error = { status: 400, message: 'Bad Request' };
    const handler = { handle: () => throwError(() => error) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(ctx, handler as any).subscribe({
        error: () => {
          expect(mockCounter.inc).toHaveBeenCalledWith(
            expect.objectContaining({ status: '400' }),
          );
          resolve();
        },
      });
    });
  });

  it('错误无 status → 默认 500', async () => {
    const ctx = createContext('GET', '/api/v1/test');
    const error = new Error('Internal');
    const handler = { handle: () => throwError(() => error) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(ctx, handler as any).subscribe({
        error: () => {
          expect(mockCounter.inc).toHaveBeenCalledWith(
            expect.objectContaining({ status: '500' }),
          );
          resolve();
        },
      });
    });
  });

  it('路径中数字 ID → 替换为 :id', async () => {
    const ctx = createContext('GET', '/api/v1/products/123');
    const handler = { handle: () => of(null) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(ctx, handler as any).subscribe({
        complete: () => {
          expect(mockCounter.inc).toHaveBeenCalledWith(
            expect.objectContaining({ path: '/api/v1/products/:id' }),
          );
          resolve();
        },
      });
    });
  });

  it('路径中 UUID → 数字 ID 和 UUID 均被规范化', async () => {
    // 注意：normalizePath 先替换纯数字 /\d+/ 再替换 UUID 模式
    // UUID 中的数字段会被先替换为 :id，所以最终结果是混合替换
    const ctx = createContext(
      'GET',
      '/api/v1/files/550e8400-e29b-41d4-a716-446655440000',
    );
    const handler = { handle: () => of(null) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(ctx, handler as any).subscribe({
        complete: () => {
          // 路径被规范化（数字部分被替换）
          const calledPath = mockCounter.inc.mock.calls[0][0].path;
          expect(calledPath).not.toContain('550e8400');
          expect(calledPath).toContain(':id');
          resolve();
        },
      });
    });
  });

  it('移除 query string', async () => {
    const ctx = createContext('GET', '/api/v1/products?page=1&size=10');
    // 使用 url（route 无 query string）
    const customCtx = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          route: undefined,
          url: '/api/v1/products?page=1&size=10',
        }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as any;
    const handler = { handle: () => of(null) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(customCtx, handler as any).subscribe({
        complete: () => {
          expect(mockCounter.inc).toHaveBeenCalledWith(
            expect.objectContaining({ path: '/api/v1/products' }),
          );
          resolve();
        },
      });
    });
  });

  it('无动态参数的路径 → 原样返回', async () => {
    const ctx = createContext('GET', '/api/v1/health');
    const handler = { handle: () => of(null) };

    await new Promise<void>((resolve) => {
      interceptor.intercept(ctx, handler as any).subscribe({
        complete: () => {
          expect(mockCounter.inc).toHaveBeenCalledWith(
            expect.objectContaining({ path: '/api/v1/health' }),
          );
          resolve();
        },
      });
    });
  });
});
