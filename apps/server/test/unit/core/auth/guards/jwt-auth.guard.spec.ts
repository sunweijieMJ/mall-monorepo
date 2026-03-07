import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '@/core/auth/guards/jwt-auth.guard';

// 构造最小化 ExecutionContext mock
function createMockContext(): ExecutionContext {
  return {
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
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('@Public() 路由 → 直接返回 true，跳过 passport 校验', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const result = guard.canActivate(createMockContext());

    expect(result).toBe(true);
  });

  it('非 @Public() 路由 → 委托给 super.canActivate（passport 校验）', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    // super.canActivate 需要完整 passport 上下文，这里验证不会直接返回 true
    const superSpy = vi
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(createMockContext());

    expect(result).toBe(true);
    expect(superSpy).toHaveBeenCalledOnce();

    superSpy.mockRestore();
  });

  it('metadata 未设置（undefined）→ 不跳过', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const superSpy = vi
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    guard.canActivate(createMockContext());

    expect(superSpy).toHaveBeenCalledOnce();

    superSpy.mockRestore();
  });
});
