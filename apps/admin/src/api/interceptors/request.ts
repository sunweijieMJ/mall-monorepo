/**
 * 请求拦截器配置
 */

import type { InternalAxiosRequestConfig } from 'axios';
import { getMallToken } from '@/utils/mallAuth';

/**
 * 请求拦截器
 *
 * 功能：
 * - 从 Cookie 中获取 Mall Token
 * - 注入到请求头 Authorization
 */
export function requestInterceptor(
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
  // 获取 Mall Token（从 Cookie 中）
  const token = getMallToken();
  if (token) {
    // Mall API 需要完整的 token（已包含 "Bearer " 前缀）
    config.headers.Authorization = token;
  }

  return config;
}

/**
 * 请求错误拦截器
 */
export function requestErrorInterceptor(error: any): Promise<any> {
  console.error('请求配置错误:', error);
  return Promise.reject(error);
}
