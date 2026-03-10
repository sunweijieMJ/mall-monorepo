/**
 * Mall 认证相关工具函数
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import storage from '@/plugins/storage';

const TokenKey = 'token';

/**
 * 获取 Mall 登录 Token
 */
export function getMallToken(): string {
  return storage('localStorage').get(TokenKey) || '';
}

/**
 * 设置 Mall 登录 Token
 */
export function setMallToken(token: string): void {
  storage('localStorage').set(TokenKey, token);
}

/**
 * 移除 Mall 登录 Token
 */
export function removeMallToken(): void {
  storage('localStorage').remove(TokenKey);
}
