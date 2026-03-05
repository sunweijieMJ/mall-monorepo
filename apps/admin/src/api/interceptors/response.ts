/**
 * 响应拦截器配置
 */

import type { AxiosResponse } from 'axios';
import type { IResponse } from './instance';

/**
 * 响应成功拦截器
 *
 * Mall 后端 API 规范：
 * - 成功：code = 200
 * - 失败：code = 其他值（如 401, 403, 500 等）
 */
export function responseSuccessInterceptor(
  response: AxiosResponse<IResponse<any>>,
) {
  const { code, message } = response.data;

  // 成功响应（Mall API 使用 200 表示成功）
  if (code === 200) {
    return response.data;
  }

  // 业务错误处理 - 抛出错误让调用方处理
  const error = new Error(message || '请求失败');
  (error as any).code = code;
  throw error;
}

/**
 * 响应错误拦截器
 */
export function responseErrorInterceptor(error: any) {
  return Promise.reject(error);
}
