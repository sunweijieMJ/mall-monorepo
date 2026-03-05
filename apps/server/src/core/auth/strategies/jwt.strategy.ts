import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AllConfigType } from '@/config/config.type';
import { JwtPayload } from '../types/jwt-payload.type';

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
    // 从 Authorization header 提取原始 token
    const authHeader = request.headers['authorization'] as string;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) return payload;

    // 1. 先检查 30 秒"token 有效"缓存，命中则跳过黑名单查询（减少 Redis 负载）
    const validCacheKey = `mall:jwt_valid:${token}`;
    const isValidCached = await this.cacheManager.get<string>(validCacheKey);
    if (isValidCached) {
      return payload;
    }

    // 2. 检查 token 是否在黑名单中
    const blacklisted = await this.cacheManager.get(
      `mall:token_blacklist:${token}`,
    );
    if (blacklisted) {
      throw new UnauthorizedException('token 已失效');
    }

    // 3. 验证通过，缓存结果 30 秒，下次同 token 请求直接命中缓存
    // 注意：logout 时需同时删除此 key（在 auth.service.logout 中处理）
    await this.cacheManager.set(validCacheKey, '1', 30_000);

    return payload;
  }
}
