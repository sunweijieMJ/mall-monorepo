export interface JwtPayload {
  sub: number; // userId (adminId 或 memberId)
  username: string; // 用户名
  type: 'admin' | 'member'; // 用户类型
  iat?: number; // 签发时间
  exp?: number; // 过期时间
}
