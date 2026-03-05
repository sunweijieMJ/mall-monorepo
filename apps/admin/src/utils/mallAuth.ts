/**
 * Mall 认证相关工具函数
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import storage from '@/plugins/storage';

const TokenKey = 'mall_login_token';

/**
 * 获取 Mall 登录 Token
 */
export function getMallToken(): string {
  const cookieStorage = storage('cookie');
  return cookieStorage.get(TokenKey) || '';
}

/**
 * 设置 Mall 登录 Token
 */
export function setMallToken(token: string): void {
  const cookieStorage = storage('cookie');
  cookieStorage.set(TokenKey, token);
}

/**
 * 移除 Mall 登录 Token
 */
export function removeMallToken(): void {
  const cookieStorage = storage('cookie');
  cookieStorage.remove(TokenKey);
}
