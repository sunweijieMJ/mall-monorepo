export interface JwtPayload {
  sub: number; // userId (adminId 或 memberId)
  username: string; // 用户名
  type: 'admin' | 'member'; // 用户类型
  sessionId?: number; // Session ID（仅 Refresh Token 包含）
  jti?: string; // JWT ID（仅 Refresh Token 包含，用于 hash 验证）
  iat?: number; // 签发时间
  exp?: number; // 过期时间
}
