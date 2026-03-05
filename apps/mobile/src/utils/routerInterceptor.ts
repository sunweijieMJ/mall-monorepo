import { useUserStore } from '@/store';

/** 无需登录即可访问的页面白名单 */
const WHITE_LIST = [
  '/pages/index/index',
  '/pages/public/login',
  '/pages/public/register',
  '/pages/category/category',
  '/pages/product/list',
  '/pages/product/product',
  '/pages-sub/product/hotProductList',
  '/pages-sub/product/newProductList',
  '/pages/brand/list',
  '/pages/brand/brandDetail',
];

function isInWhiteList(url: string): boolean {
  const path = url.split('?')[0];
  return WHITE_LIST.some((white) => path === white || path.startsWith(white));
}

function handleRouteIntercept(args: { url: string }): boolean | typeof args {
  const userStore = useUserStore();

  if (isInWhiteList(args.url)) return args;

  if (!userStore.isLoggedIn) {
    const redirect = encodeURIComponent(args.url);
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/public/login?redirect=${redirect}` });
    }, 0);
    return false;
  }

  return args;
}

/**
 * 初始化路由拦截器
 * 在 main.ts 的 createApp 中调用
 */
export function setupRouterInterceptor(): void {
  const methods = ['navigateTo', 'redirectTo', 'reLaunch'] as const;

  methods.forEach((method) => {
    uni.addInterceptor(method, {
      invoke(args: { url: string }) {
        return handleRouteIntercept(args);
      },
      fail(err: unknown) {
        console.error(`[Router] ${method} failed:`, err);
      },
    });
  });

  // switchTab 单独处理（TabBar 页面均需登录）
  uni.addInterceptor('switchTab', {
    invoke(args: { url: string }) {
      const userStore = useUserStore();
      // index / category 允许未登录访问
      if (args.url.includes('index') || args.url.includes('category'))
        return args;
      if (!userStore.isLoggedIn) {
        setTimeout(() => {
          uni.redirectTo({ url: '/pages/public/login' });
        }, 0);
        return false;
      }
      return args;
    },
  });
}

export function removeRouterInterceptor(): void {
  const methods = [
    'navigateTo',
    'redirectTo',
    'reLaunch',
    'switchTab',
  ] as const;
  methods.forEach((method) => uni.removeInterceptor(method));
}
