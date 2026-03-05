import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '@/core/auth/types/jwt-payload.type';

/** 测试专用 JWT Secret（不用于生产环境） */
export const TEST_JWT_SECRET = 'test-jwt-secret-do-not-use-in-production';

// 直接实例化 JwtService，无需 NestJS DI 容器
const jwtService = new JwtService({
  secret: TEST_JWT_SECRET,
  signOptions: { expiresIn: '1h' },
});

/**
 * 生成管理员测试 Token
 * @param adminId 管理员 ID，默认 1
 * @param username 管理员用户名，默认 'test-admin'
 */
export function generateAdminToken(
  adminId = 1,
  username = 'test-admin',
): string {
  const payload: JwtPayload = { sub: adminId, username, type: 'admin' };
  return jwtService.sign(payload);
}

/**
 * 生成会员测试 Token
 * @param memberId 会员 ID，默认 1
 * @param username 会员用户名，默认 'test-member'
 */
export function generateMemberToken(
  memberId = 1,
  username = 'test-member',
): string {
  const payload: JwtPayload = { sub: memberId, username, type: 'member' };
  return jwtService.sign(payload);
}

/** 生成带有 Bearer 前缀的认证请求头值 */
export function bearerHeader(token: string): string {
  return `Bearer ${token}`;
}
