import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtRefreshStrategy } from '@/core/auth/strategies/jwt-refresh.strategy';

// 通过继承绕过 passport 初始化
class TestableJwtRefreshStrategy extends JwtRefreshStrategy {
  constructor() {
    const mockConfigService = {
      getOrThrow: vi.fn().mockReturnValue('test-refresh-secret'),
    } as any;
    super(mockConfigService);
  }
}

describe('JwtRefreshStrategy.validate', () => {
  let strategy: TestableJwtRefreshStrategy;

  beforeEach(() => {
    strategy = new TestableJwtRefreshStrategy();
  });

  it('payload 完整 → 返回 payload', () => {
    const payload = {
      sub: 1,
      username: 'admin',
      type: 'admin' as const,
      sessionId: 'sess-1',
    };
    expect(strategy.validate(payload)).toEqual(payload);
  });

  it('缺少 sessionId → 抛出 UnauthorizedException', () => {
    const payload = {
      sub: 1,
      username: 'admin',
      type: 'admin' as const,
    } as any;
    expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
  });

  it('缺少 sub → 抛出 UnauthorizedException', () => {
    const payload = {
      username: 'admin',
      type: 'admin',
      sessionId: 'sess-1',
    } as any;
    expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
  });

  it('缺少 type → 抛出 UnauthorizedException', () => {
    const payload = { sub: 1, username: 'admin', sessionId: 'sess-1' } as any;
    expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
  });
});
