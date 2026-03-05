import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AllConfigType } from '@/config/config.type';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService<AllConfigType>) {
    const refreshSecret = configService.get('auth.refreshSecret', {
      infer: true,
    });
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      secretOrKey:
        refreshSecret ||
        configService.getOrThrow('auth.secret', { infer: true }),
      ignoreExpiration: false,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (!payload.sessionId || !payload.sub || !payload.type) {
      throw new UnauthorizedException('无效的 Refresh Token');
    }
    return payload;
  }
}
