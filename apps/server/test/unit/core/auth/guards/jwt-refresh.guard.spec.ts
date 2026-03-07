import { vi, describe, it, expect } from 'vitest';
import { ExecutionContext } from '@nestjs/common';
import { JwtRefreshGuard } from '@/core/auth/guards/jwt-refresh.guard';

describe('JwtRefreshGuard', () => {
  it('继承自 AuthGuard("jwt-refresh")', () => {
    const guard = new JwtRefreshGuard();
    expect(guard).toBeDefined();
  });

  it('canActivate 委托给 passport jwt-refresh 策略', () => {
    const guard = new JwtRefreshGuard();

    const mockContext = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({}),
        getResponse: () => ({}),
      }),
      getType: () => 'http',
      getArgs: () => [],
      getArgByIndex: () => ({}),
      switchToRpc: () => ({}) as any,
      switchToWs: () => ({}) as any,
    } as unknown as ExecutionContext;

    // super.canActivate 需要完整 passport 上下文
    const superSpy = vi
      .spyOn(Object.getPrototypeOf(JwtRefreshGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(superSpy).toHaveBeenCalledOnce();

    superSpy.mockRestore();
  });
});
