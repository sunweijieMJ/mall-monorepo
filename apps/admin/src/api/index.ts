import { http, HttpClient } from './interceptors/instance';
import {
  requestInterceptor,
  requestErrorInterceptor,
} from './interceptors/request';
import {
  responseSuccessInterceptor,
  responseErrorInterceptor,
} from './interceptors/response';

/**
 * ==================== API 拦截器统一配置 ====================
 *
 * 所有拦截器配置统一在此处管理，确保配置的一致性和可维护性
 *
 * 架构说明：
 * - HttpClient (instance.ts): 提供拦截器插槽，不包含具体业务逻辑
 * - interceptors/: 拦截器实现的唯一来源，包含所有业务逻辑
 * - api/index.ts (本文件): 统一配置和注册拦截器
 *
 * 拦截器职责：
 * - request.ts: Token 注入、请求配置处理
 * - response.ts: 响应数据处理、业务错误码处理、HTTP 错误处理
 */
http.setRequestInterceptor(requestInterceptor, requestErrorInterceptor);
http.setResponseInterceptor(
  responseSuccessInterceptor,
  responseErrorInterceptor,
);

/**
 * 导出 HTTP 客户端
 * API 服务请从 @/api/modules 导入
 */
export { HttpClient, http };

export default http;
