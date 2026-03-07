import { vi, describe, it, expect } from 'vitest';
import { of } from 'rxjs';
import { lastValueFrom } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';

function createMockContext(skipValue?: boolean) {
  const handler = {};
  const cls = {};
  return {
    getHandler: () => handler,
    getClass: () => cls,
    _handler: handler,
    _cls: cls,
    _skipValue: skipValue,
  };
}

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<any>;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new ResponseInterceptor(reflector);
  });

  it('普通对象 → 包装为 { code: 200, message: "success", data }', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext();
    const next = { handle: () => of({ name: 'test' }) };

    const result = await lastValueFrom(interceptor.intercept(ctx as any, next));

    expect(result).toEqual({
      code: 200,
      message: 'success',
      data: { name: 'test' },
    });
  });

  it('null 数据 → 包装为 { code: 200, message: "success", data: null }', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext();
    const next = { handle: () => of(null) };

    const result = await lastValueFrom(interceptor.intercept(ctx as any, next));

    expect(result).toEqual({ code: 200, message: 'success', data: null });
  });

  it('已有 ApiResponse 结构 → 不二次包装，直接透传', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const existing = { code: 200, message: 'ok', data: [] };
    const ctx = createMockContext();
    const next = { handle: () => of(existing) };

    const result = await lastValueFrom(interceptor.intercept(ctx as any, next));

    expect(result).toBe(existing);
  });

  it('@SkipResponseTransform → 直接透传原始值', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const raw = 'success';
    const ctx = createMockContext();
    const next = { handle: () => of(raw) };

    const result = await lastValueFrom(interceptor.intercept(ctx as any, next));

    expect(result).toBe('success');
  });

  it('数组数据 → 正常包装', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = createMockContext();
    const next = { handle: () => of([1, 2, 3]) };

    const result = await lastValueFrom(interceptor.intercept(ctx as any, next));

    expect(result).toEqual({ code: 200, message: 'success', data: [1, 2, 3] });
  });
});
