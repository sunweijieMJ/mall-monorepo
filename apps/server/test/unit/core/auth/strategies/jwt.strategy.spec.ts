import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '@/core/auth/strategies/jwt.strategy';
import { CACHE_KEYS, JWT_VALID_CACHE_TTL_MS } from '@/common/constants';

// JwtStrategy 继承 PassportStrategy(Strategy)，直接测试 validate 方法
// 构造函数需要 configService 和 cacheManager，通过继承绕过 passport 初始化
class TestableJwtStrategy extends JwtStrategy {
  constructor(cacheManager: any) {
    const mockConfigService = {
      getOrThrow: vi.fn().mockReturnValue('test-secret'),
    } as any;
    super(mockConfigService, cacheManager);
  }
}

const testPayload = { sub: 1, username: 'admin', type: 'admin' as const };
const testToken = 'valid-jwt-token';

function createRequest(token?: string) {
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : undefined,
    },
  };
}

describe('JwtStrategy.validate', () => {
  let strategy: TestableJwtStrategy;
  let mockCache: any;

  beforeEach(() => {
    mockCache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    };
    strategy = new TestableJwtStrategy(mockCache);
  });

  it('正常 token（缓存未命中、非黑名单）→ 返回 payload 并写入有效缓存', async () => {
    const result = await strategy.validate(
      createRequest(testToken),
      testPayload,
    );

    expect(result).toEqual(testPayload);
    // 应查询 jwtValid 缓存 + tokenBlacklist，共 2 次 get
    expect(mockCache.get).toHaveBeenCalledTimes(2);
    // 应写入 jwtValid 缓存
    expect(mockCache.set).toHaveBeenCalledWith(
      CACHE_KEYS.jwtValid(testToken),
      '1',
      JWT_VALID_CACHE_TTL_MS,
    );
  });

  it('jwt_valid 缓存命中 → 直接返回 payload，不查黑名单', async () => {
    mockCache.get.mockResolvedValueOnce('1'); // jwtValid 缓存命中

    const result = await strategy.validate(
      createRequest(testToken),
      testPayload,
    );

    expect(result).toEqual(testPayload);
    expect(mockCache.get).toHaveBeenCalledTimes(1); // 只查了一次
    expect(mockCache.set).not.toHaveBeenCalled(); // 不需要再写
  });

  it('黑名单 token → 抛出 UnauthorizedException', async () => {
    mockCache.get
      .mockResolvedValueOnce(null) // jwtValid 缓存未命中
      .mockResolvedValueOnce('true'); // 黑名单命中

    await expect(
      strategy.validate(createRequest(testToken), testPayload),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('无 Authorization header → 抛出 UnauthorizedException', async () => {
    await expect(
      strategy.validate({ headers: {} }, testPayload),
    ).rejects.toThrow(UnauthorizedException);
  });
});
