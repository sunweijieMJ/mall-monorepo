import Axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type Method,
  type AxiosError,
} from 'axios';

// 基础配置
const defaultConfig: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
};

/**
 * API响应通用接口
 *
 * Mall API 响应规范：
 * - code: 200 表示成功
 * - code: 其他值表示失败（如 401, 403, 500 等）
 * - data: 响应数据字段
 */
export interface IResponse<T = any> {
  /** 响应消息 */
  message: string;
  /** 响应码，200表示成功 */
  code: number;
  /** 响应数据 */
  data?: T;
}

// 响应数据验证函数类型
export type ResponseValidator<T = any> = (data: IResponse<T>) => boolean;

// 重试配置
export interface RetryConfig {
  retries?: number; // 重试次数
  retryDelay?: number; // 重试延迟（毫秒）
  retryCondition?: (error: AxiosError) => boolean; // 重试条件
}

// 拦截器配置类型
interface InterceptorsConfig {
  requestInterceptor?: (
    config: InternalAxiosRequestConfig,
  ) => InternalAxiosRequestConfig;
  requestErrorInterceptor?: (error: AxiosError) => Promise<any>;
  responseInterceptor?: (
    response: AxiosResponse<IResponse<any>>,
  ) => IResponse<any>;
  responseErrorInterceptor?: (error: AxiosError) => Promise<any>;
}

// 请求唯一键
type RequestKey = string | symbol;

/**
 * 增强型 HTTP 客户端，基于 Axios 封装
 * 支持拦截器配置、请求取消、多实例管理等功能
 */
export class HttpClient {
  private instance: AxiosInstance;
  private requestInterceptorId?: number;
  private responseInterceptorId?: number;
  private abortControllers: Map<RequestKey, AbortController> = new Map();

  /**
   * 创建 HTTP 客户端实例
   * @param customConfig 自定义 Axios 配置
   * @param interceptors 自定义拦截器配置
   */
  constructor(
    customConfig?: AxiosRequestConfig,
    interceptors?: InterceptorsConfig,
  ) {
    this.instance = Axios.create({ ...defaultConfig, ...customConfig });
    this.initInterceptors(interceptors);
  }

  /** 初始化拦截器 */
  private initInterceptors(interceptors?: InterceptorsConfig): void {
    this.initRequestInterceptor(
      interceptors?.requestInterceptor,
      interceptors?.requestErrorInterceptor,
    );
    this.initResponseInterceptor(
      interceptors?.responseInterceptor,
      interceptors?.responseErrorInterceptor,
    );
  }

  /** 初始化请求拦截器 */
  private initRequestInterceptor(
    customInterceptor?: InterceptorsConfig['requestInterceptor'],
    customErrorInterceptor?: InterceptorsConfig['requestErrorInterceptor'],
  ): void {
    // 只有提供了自定义拦截器才进行注册
    if (customInterceptor || customErrorInterceptor) {
      this.requestInterceptorId = this.instance.interceptors.request.use(
        customInterceptor,
        customErrorInterceptor,
      );
    }
  }

  /** 初始化响应拦截器 */
  private initResponseInterceptor(
    customInterceptor?: InterceptorsConfig['responseInterceptor'],
    customErrorInterceptor?: InterceptorsConfig['responseErrorInterceptor'],
  ): void {
    // 默认响应拦截器：提取 response.data
    const defaultResponseInterceptor = (
      response: AxiosResponse<IResponse<any>>,
    ): IResponse<any> => {
      return response.data;
    };

    // 清理 AbortController 的辅助函数
    const cleanupAbortController = (config: AxiosRequestConfig) => {
      const requestKey = this.getRequestKey(config);
      if (requestKey) this.abortControllers.delete(requestKey);
    };

    const cleanupErrorInterceptor = (error: AxiosError): Promise<any> => {
      if (error.config) {
        cleanupAbortController(error.config);
      }
      return Promise.reject(error);
    };

    // 使用自定义拦截器或默认拦截器
    // 注意：Axios 的类型定义限制，需要使用 any 类型来支持返回非 AxiosResponse 的值
    const finalResponseInterceptor = (
      response: AxiosResponse<IResponse<any>>,
    ): any => {
      // 清理 AbortController
      cleanupAbortController(response.config);
      // 使用自定义拦截器或默认拦截器
      return customInterceptor
        ? customInterceptor(response)
        : defaultResponseInterceptor(response);
    };

    // 如果提供了自定义拦截器，使用组合拦截器
    if (customInterceptor || customErrorInterceptor) {
      this.responseInterceptorId = this.instance.interceptors.response.use(
        finalResponseInterceptor,
        customErrorInterceptor
          ? async (error: AxiosError) => {
              await cleanupErrorInterceptor(error);
              return customErrorInterceptor(error);
            }
          : cleanupErrorInterceptor,
      );
    } else {
      // 没有自定义拦截器，使用默认拦截器
      this.responseInterceptorId = this.instance.interceptors.response.use(
        finalResponseInterceptor,
        cleanupErrorInterceptor,
      );
    }
  }

  /** 生成请求唯一标识 */
  private getRequestKey(config: AxiosRequestConfig): RequestKey | undefined {
    if (!config.url) return undefined;
    return `${config.method?.toUpperCase()}-${config.url}`;
  }

  /** 设置取消控制器 - 用于取消重复请求或主动取消请求 */
  private setupCancelController(
    config: AxiosRequestConfig,
    requestKey?: RequestKey,
  ): AxiosRequestConfig {
    const key = requestKey || this.getRequestKey(config);
    if (!key) return config;

    // 如果已有相同key的请求，先取消它
    this.cancelRequest(key);

    const controller = new AbortController();
    this.abortControllers.set(key, controller);

    return {
      ...config,
      signal: controller.signal,
    };
  }

  /** 移除请求拦截器 */
  public removeRequestInterceptor(): void {
    if (this.requestInterceptorId !== undefined) {
      this.instance.interceptors.request.eject(this.requestInterceptorId);
      this.requestInterceptorId = undefined; // 重置ID，避免重复移除
    }
  }

  /** 移除响应拦截器 */
  public removeResponseInterceptor(): void {
    if (this.responseInterceptorId !== undefined) {
      this.instance.interceptors.response.eject(this.responseInterceptorId);
      this.responseInterceptorId = undefined; // 重置ID，避免重复移除
    }
  }

  /** 动态设置请求拦截器 */
  public setRequestInterceptor(
    customInterceptor?: InterceptorsConfig['requestInterceptor'],
    customErrorInterceptor?: InterceptorsConfig['requestErrorInterceptor'],
  ): void {
    this.removeRequestInterceptor();
    this.initRequestInterceptor(customInterceptor, customErrorInterceptor);
  }

  /** 动态设置响应拦截器 */
  public setResponseInterceptor(
    customInterceptor?: InterceptorsConfig['responseInterceptor'],
    customErrorInterceptor?: InterceptorsConfig['responseErrorInterceptor'],
  ): void {
    this.removeResponseInterceptor();
    this.initResponseInterceptor(customInterceptor, customErrorInterceptor);
  }

  /** 获取 Axios 实例 */
  public getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * 取消某个请求
   * @param key 请求唯一标识
   * @param message 取消原因
   * @returns 是否成功取消
   */
  public cancelRequest(key: RequestKey, message?: string): boolean {
    const controller = this.abortControllers.get(key);
    if (controller) {
      controller.abort(message || `取消请求: ${String(key)}`);
      this.abortControllers.delete(key);
      return true;
    }
    return false;
  }

  /**
   * 取消所有请求
   * @param message 取消原因
   */
  public cancelAllRequests(message?: string): void {
    this.abortControllers.forEach((controller, key) => {
      controller.abort(message || `取消所有请求: ${String(key)}`);
    });
    this.abortControllers.clear();
  }

  /**
   * 判断是否为取消错误
   * @param error 错误对象
   * @returns 是否为取消错误
   */
  public static isCancel(error: unknown): boolean {
    return Axios.isCancel(error);
  }

  /**
   * 睡眠函数
   * @param ms 毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 通用请求方法
   * @param method 请求方法
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public async request<T = any>(
    method: Method,
    url: string,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    },
  ): Promise<IResponse<T>> {
    const { requestKey, retry, ...restConfig } = config || {};

    // 设置合理的默认重试条件
    const defaultRetryCondition = (error: AxiosError) => {
      // 默认只重试网络错误或5xx服务器错误
      return (
        !error.response ||
        (error.response.status >= 500 && error.response.status < 600)
      );
    };

    const retryConfig = {
      retries: 0,
      retryDelay: 1000,
      retryCondition: defaultRetryCondition,
      ...retry,
    };

    let lastError: any;
    const key =
      requestKey || this.getRequestKey({ ...restConfig, method, url });

    for (let attempt = 0; attempt <= retryConfig.retries; attempt++) {
      try {
        // 重试前清除旧的AbortController（避免重试请求被误取消）
        if (attempt > 0 && key) {
          this.abortControllers.delete(key);
        }

        const requestConfig = this.setupCancelController(
          { ...restConfig, method, url },
          requestKey,
        );

        /* 在这里写通用请求前的业务逻辑 */
        // 示例: 记录请求日志
        // console.log(`[${method.toUpperCase()}] ${url}:`, restConfig);

        const response =
          await this.instance.request<IResponse<T>>(requestConfig);

        /* 在这里写通用请求后的业务逻辑 */
        // 示例: 记录响应日志
        // console.log(`[${method.toUpperCase()}] ${url} 响应:`, response);

        // 类型说明：
        // - Axios 返回类型：AxiosResponse<IResponse<T>>
        // - 响应拦截器返回：IResponse<T> (见 InterceptorsConfig.responseInterceptor 定义)
        // - 由于 Axios 类型系统无法追踪拦截器的类型转换，需要手动断言
        return response as unknown as IResponse<T>;
      } catch (error) {
        lastError = error;

        // 如果是最后一次尝试或不满足重试条件或请求被取消，直接抛出错误
        if (
          attempt === retryConfig.retries ||
          !retryConfig.retryCondition(error as AxiosError) ||
          HttpClient.isCancel(error)
        ) {
          break;
        }

        // 延迟后重试
        if (retryConfig.retryDelay > 0) {
          await this.sleep(retryConfig.retryDelay);
        }
      }
    }

    /* 在这里写请求异常的通用处理逻辑 */
    // 统一错误提示
    if (lastError instanceof Error) {
      console.error('请求失败:', lastError.message);
      // 可以在这里添加全局错误提示，例如使用 Element Plus 的 Message 组件
      // import { ElMessage } from 'element-plus';
      // ElMessage.error(lastError.message);
    }

    return Promise.reject(lastError);
  }

  /**
   * GET 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    },
  ): Promise<IResponse<T>> {
    return this.request<T>('get', url, config);
  }

  /**
   * POST 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    },
  ): Promise<IResponse<T>> {
    return this.request<T>('post', url, { ...config, data });
  }

  /**
   * PUT 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    },
  ): Promise<IResponse<T>> {
    return this.request<T>('put', url, { ...config, data });
  }

  /**
   * DELETE 请求
   * @param url 请求地址
   * @param config 请求配置
   * @returns 响应数据
   */
  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    },
  ): Promise<IResponse<T>> {
    return this.request<T>('delete', url, config);
  }

  /**
   * PATCH 请求
   * @param url 请求地址
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  public patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & {
      requestKey?: RequestKey;
      retry?: RetryConfig;
    },
  ): Promise<IResponse<T>> {
    return this.request<T>('patch', url, { ...config, data });
  }
}

// 默认导出实例
export const http = new HttpClient();

export default http;
