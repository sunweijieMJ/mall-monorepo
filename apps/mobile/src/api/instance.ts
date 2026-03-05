import Request from 'luch-request';
import type { HttpRequestConfig, HttpResponse } from 'luch-request';
import { storage } from '@/utils/storage';

/**
 * luch-request 是专为 uni-app 设计的HTTP请求库，完美支持小程序、H5等多端环境
 */
const http = new Request();

/**
 * 设置全局配置
 */
http.setConfig((config: HttpRequestConfig) => {
  config.baseURL = import.meta.env.VITE_APP_API_BASE_URL;
  config.timeout = 10 * 60 * 1000; // 10分钟超时
  config.header = {
    'Content-Type': 'application/json;charset=utf-8',
    ...config.header,
  };
  return config;
});

/**
 * 请求拦截器
 */
http.interceptors.request.use(
  (config: HttpRequestConfig) => {
    // 添加token到请求头
    const token = storage.getSync('token');
    if (token) {
      config.header = {
        Authorization: token,
        ...config.header,
      };
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 */
http.interceptors.response.use(
  (response: HttpResponse) => {
    const res = response.data as { code: number; message?: string; data?: any };

    // 业务错误处理
    if (res.code !== 200) {
      // 提示错误信息
      uni.showToast({
        title: res.message || '请求失败',
        icon: 'none',
        duration: 1500,
      });

      // 401未登录处理
      if (res.code === 401) {
        // 清除token和用户信息
        storage.removeSync('token');
        storage.removeSync('userInfo');

        // 提示用户重新登录
        uni.showModal({
          title: '提示',
          content: '你已被登出，可以取消继续留在该页面，或者重新登录',
          confirmText: '重新登录',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.navigateTo({
                url: '/pages/public/login',
              });
            }
          },
        });
      }

      return Promise.reject(response);
    }

    return response.data;
  },
  (error: any) => {
    uni.showToast({
      title: error.errMsg || '网络请求失败',
      icon: 'none',
      duration: 1500,
    });

    return Promise.reject(error);
  },
);

/**
 * API响应数据结构
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * 为了保持兼容，封装 get 和 post 方法
 * 注意：由于响应拦截器返回 response.data，所以这里的返回类型是 ApiResponse<T>
 */
const instance = {
  /**
   * GET 请求
   * @param url 请求地址
   * @param config 配置项（包含 params）
   */
  get<T = any>(
    url: string,
    config?: { params?: Record<string, any>; header?: Record<string, string> },
  ): Promise<ApiResponse<T>> {
    return http.request<ApiResponse<T>>({
      method: 'GET',
      url,
      params: config?.params,
      header: config?.header,
    }) as unknown as Promise<ApiResponse<T>>;
  },

  /**
   * POST 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 配置项
   */
  post<T = any>(
    url: string,
    data?: any,
    config?: { header?: Record<string, string> },
  ): Promise<ApiResponse<T>> {
    // 检查是否需要进行 form-urlencoded 编码
    const contentType =
      config?.header?.['Content-Type'] || config?.header?.['content-type'];
    let processedData: any = data;

    if (
      contentType?.includes('application/x-www-form-urlencoded') &&
      data &&
      typeof data === 'object' &&
      !Array.isArray(data)
    ) {
      // 将对象转换为 URL 编码格式
      processedData = Object.keys(data)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(String(data[key]))}`,
        )
        .join('&');
    }

    return http.request<ApiResponse<T>>({
      method: 'POST',
      url,
      data: processedData,
      header: config?.header,
    }) as unknown as Promise<ApiResponse<T>>;
  },

  /**
   * PUT 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 配置项
   */
  put<T = any>(
    url: string,
    data?: any,
    config?: { header?: Record<string, string> },
  ): Promise<ApiResponse<T>> {
    return http.request<ApiResponse<T>>({
      method: 'PUT',
      url,
      data,
      header: config?.header,
    }) as unknown as Promise<ApiResponse<T>>;
  },

  /**
   * DELETE 请求
   * @param url 请求地址
   * @param config 配置项
   */
  delete<T = any>(
    url: string,
    config?: { params?: Record<string, any>; header?: Record<string, string> },
  ): Promise<ApiResponse<T>> {
    return http.request<ApiResponse<T>>({
      method: 'DELETE',
      url,
      params: config?.params,
      header: config?.header,
    }) as unknown as Promise<ApiResponse<T>>;
  },

  /**
   * 原始 request 方法，直接暴露 luch-request 的 request
   */
  request: http.request.bind(http),
};

export default instance;
