/**
 * API配置常量
 */
export const API_CONFIG = {
  /** 接口地址 */
  BASE_URL: import.meta.env.VITE_APP_API_BASE_URL,
  /** 接口超时时间 */
  TIMEOUT: 10 * 60 * 1000,
  /** 是否启用支付宝支付 */
  USE_ALIPAY: false,
} as const;

/**
 * 日志配置常量
 */
export const LOGGER_CONFIG = {
  /** 开发环境日志配置 */
  DEVELOPMENT: {
    /** 是否启用日志 */
    ENABLED: true,
    /** 日志级别 */
    LEVEL: 'debug' as const,
    /** 是否启用日志存储 */
    STORAGE: true,
    /** 日志存储最大大小 */
    MAX_SIZE: 200,
  },
  /** 生产环境日志配置 */
  PRODUCTION: {
    /** 是否启用日志 */
    ENABLED: true,
    /** 日志级别 */
    LEVEL: 'error' as const,
    /** 是否启用日志存储 */
    STORAGE: false,
    /** 日志存储最大大小 */
    MAX_SIZE: 50,
  },
} as const;

/**
 * 时间相关配置
 */
export const TIME_CONFIG = {
  /** Token过期时间（毫秒） - 7天 */
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000,
  /** 缓存超时时间（毫秒） - 5分钟 */
  CACHE_TIMEOUT: 5 * 60 * 1000,
} as const;

/**
 * 配置工具函数
 */
export const ConfigUtils = {
  /** 获取当前环境 */
  getCurrentEnv: (): string =>
    (import.meta.env.MODE || 'development').toUpperCase(),

  /** 是否为开发环境 */
  isDev: (): boolean => ConfigUtils.getCurrentEnv() === 'DEVELOPMENT',

  /** 是否为生产环境 */
  isProd: (): boolean => ConfigUtils.getCurrentEnv() === 'PRODUCTION',

  /** 获取当前环境的日志配置 */
  getCurrentLoggerConfig: () => {
    const env = ConfigUtils.getCurrentEnv() as keyof typeof LOGGER_CONFIG;
    return LOGGER_CONFIG[env] || LOGGER_CONFIG.DEVELOPMENT;
  },

  /** 获取日志级别对应的数值 */
  getLogLevel: (): number => {
    const levels = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
    const currentLogger = ConfigUtils.getCurrentLoggerConfig();
    return levels[currentLogger.LEVEL] || 1;
  },
} as const;
