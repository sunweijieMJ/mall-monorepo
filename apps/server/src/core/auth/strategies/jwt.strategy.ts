import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AllConfigType } from '@/config/config.type';
import { JwtPayload } from '../types/jwt-payload.type';
import { CACHE_KEYS, JWT_VALID_CACHE_TTL_MS } from '@/common/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('auth.secret', { infer: true }),
      passReqToCallback: true,
    });
  }

  async validate(request: any, payload: JwtPayload): Promise<JwtPayload> {
    const authHeader = request.headers['authorization'] as string;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    // 1. 先检查有效缓存，命中则跳过黑名单查询（减少 Redis 负载）
    const validCacheKey = CACHE_KEYS.jwtValid(token);
    const isValidCached = await this.cacheManager.get<string>(validCacheKey);
    if (isValidCached) {
      return payload;
    }

    // 2. 缓存未命中，查黑名单（确保登出后立即失效）
    const blacklisted = await this.cacheManager.get(
      CACHE_KEYS.tokenBlacklist(token),
    );
    if (blacklisted) {
      throw new UnauthorizedException('token 已失效');
    }

    // 3. 验证通过，缓存结果（后续请求在 TTL 窗口内只需 1 次 Redis GET）
    await this.cacheManager.set(validCacheKey, '1', JWT_VALID_CACHE_TTL_MS);

    return payload;
  }
}
