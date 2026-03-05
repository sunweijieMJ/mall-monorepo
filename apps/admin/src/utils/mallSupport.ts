/**
 * Mall 支持相关工具函数（Cookie操作）
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import storage from '@/plugins/storage';

const SupportKey = 'mall_support_key';

/**
 * 获取支持标记
 */
export function getSupport(): string | undefined {
  const cookieStorage = storage('cookie');
  return cookieStorage.get(SupportKey);
}

/**
 * 设置支持标记（3天有效期）
 */
export function setSupport(isSupport: boolean): void {
  const cookieStorage = storage('cookie');
  // Cookie 存储会自动处理过期时间
  cookieStorage.set(SupportKey, String(isSupport));
}

/**
 * 设置 Cookie（通用方法）
 */
export function setMallCookie(key: string, value: string): void {
  const cookieStorage = storage('cookie');
  cookieStorage.set(key, value);
}

/**
 * 获取 Cookie（通用方法）
 */
export function getMallCookie(key: string): string | undefined {
  const cookieStorage = storage('cookie');
  return cookieStorage.get(key);
}

/**
 * 移除 Cookie（通用方法）
 */
export function removeMallCookie(key: string): void {
  const cookieStorage = storage('cookie');
  cookieStorage.remove(key);
}
