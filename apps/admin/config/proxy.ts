import { hostDict, protocol } from './host';

/**
 * 开发环境代理
 */
export const proxy = {
  '/apiService': {
    target: `${protocol}//${hostDict.API_SERVICE}`,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/apiService\//, ''),
  },
};
