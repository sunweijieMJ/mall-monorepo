import { Module, Injectable } from '@nestjs/common';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { TEST_JWT_SECRET } from './jwt.helper';

/**
 * 测试用 JWT 策略。
 * 仅用于让 @UseGuards(AuthGuard('jwt')) 正常工作，
 * 实际鉴权逻辑由 createTestApp 中的 MockJwtAuthGuard 处理。
 */
@Injectable()
class TestJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: TEST_JWT_SECRET,
    });
  }

  validate(payload: any) {
    return payload;
  }
}

/**
 * 测试用 Passport 模块。
 * 在 E2E 测试中导入此模块，使 @UseGuards(AuthGuard('jwt')) 能正常工作。
 */
@Module({
  imports: [PassportModule],
  providers: [TestJwtStrategy],
  exports: [PassportModule],
})
export class TestPassportModule {}
