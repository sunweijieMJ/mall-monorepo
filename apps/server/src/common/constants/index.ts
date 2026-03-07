/**
 * 通用常量 — 替代散落的魔法数字
 */

// ============= 缓存 TTL =============

/** 默认缓存 TTL：1 小时（毫秒） */
export const CACHE_TTL_MS = 3600 * 1000;

/** JWT 有效性缓存 TTL：30 秒（毫秒） */
export const JWT_VALID_CACHE_TTL_MS = 30 * 1000;

/** 验证码 TTL：15 分钟（毫秒） */
export const AUTH_CODE_TTL_MS = 15 * 60 * 1000;

// ============= Redis Key =============

/** 统一 Redis 缓存 Key，所有模块必须从此处引用，禁止硬编码 */
export const CACHE_KEYS = {
  /** 管理员信息缓存 */
  admin: (username: string) => `mall:admin:${username}`,
  /** 管理员资源权限列表 */
  resourceList: (adminId: number) => `mall:resourceList:${adminId}`,
  /** 全局资源 Map（URL → 权限） */
  resourceListAll: () => `mall:resourceList:all`,
  /** 短信验证码 */
  authCode: (phone: string) => `mall:authCode:${phone}`,
  /** 验证码发送冷却 */
  authCodeCooldown: (phone: string) => `mall:authCode:recent:${phone}`,
  /** 已登出 Token 黑名单 */
  tokenBlacklist: (token: string) => `mall:token_blacklist:${token}`,
  /** 会员信息缓存 */
  member: (username: string) => `mall:member:${username}`,
  /** 登录失败计数 */
  loginFail: (username: string) => `mall:login:fail:${username}`,
  /** 登录锁定标记 */
  loginLock: (username: string) => `mall:login:lock:${username}`,
  /** JWT 有效性短期缓存（30 秒） */
  jwtValid: (token: string) => `mall:jwt_valid:${token}`,
  /** 订单号 Redis INCR 计数器 */
  orderId: (date: string) => `mall:orderId:${date}`,
};
