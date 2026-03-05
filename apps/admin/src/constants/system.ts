/**
 * 不同服务的代理前缀
 */
export const PROXY_URI = {
  API: '/apiService',
  LOCAL: '/localService',
} as const;

/**
 * 不同版本服务的基础 URI
 */
export const URI = {
  LOCAL_V1: `${PROXY_URI.LOCAL}/local/v1`,
};

/**
 * 默认语言
 */
export const DEFAULT_LOCALE = 'zh-CN';

/**
 * 默认主题
 */
export const DEFAULT_THEME_STYLE = 'light';

/**
 * 语言包选项
 */
export enum LOCALE_TYPE {
  ZH_CN = 'zh-CN',
  EN_US = 'en-US',
}
