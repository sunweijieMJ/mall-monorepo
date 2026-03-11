// 手动引入组件，会和按需引入样式冲突，所以导入全量样式
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';
import { createApp } from 'vue';
import App from './app/App.vue';
import { setupDirectives } from './directives';
import { i18n } from './plugins/locale';
import router from './router';
import storePromise, { preloadPersistedData } from './store';
import { setupGlobalErrorHandler } from './utils/errorHandler';

/**
 * 初始化 Web Vitals 性能监控
 * 根据环境变量 VITE_ENABLE_WEB_VITALS 配置启用
 */
async function setupWebVitals(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_WEB_VITALS !== 'true') return;

  const { reportWebVitals } = await import('@/plugins/webVitals');
  reportWebVitals(console.log);
}

/**
 * 初始化 Sentry 错误监控
 * 由 VITE_ENABLE_SENTRY 环境变量作为总开关，
 * 再读取 siteConfig store 中的运行时配置（需在 app.use(store) 之后调用）
 */
async function setupSentry(
  app: ReturnType<typeof createApp>,
  router: typeof import('./router').default,
): Promise<void> {
  if (import.meta.env.VITE_ENABLE_SENTRY !== 'true') return;

  // 读取站点配置中的 Sentry 运行时参数（store 已在 app.use(store) 后可用）
  const { useSiteConfigStore } = await import('@/store/modules/siteConfig');
  const siteConfigStore = useSiteConfigStore();
  const sentryCfg = siteConfigStore.savedConfig.sentry;

  // 运行时配置显式禁用时跳过
  if (sentryCfg.enabled === false) return;

  const { initSentry } = await import('@/plugins/sentry');
  // 将站点配置作为覆盖参数传入（非空 dsn 才覆盖默认 DSN）
  await initSentry(app, router, {
    ...(sentryCfg.dsn ? { dsn: sentryCfg.dsn } : {}),
    enablePerformance: sentryCfg.enablePerformance,
    enableReplay: sentryCfg.enableReplay,
    enableRouterTracking: sentryCfg.enableRouterTracking,
    enableFeedback: sentryCfg.enableFeedback,
    tracesSampleRate: sentryCfg.tracesSampleRate,
    replaysSessionSampleRate: sentryCfg.replaysSessionSampleRate,
    replaysOnErrorSampleRate: sentryCfg.replaysOnErrorSampleRate,
  });
}

/**
 * 初始化应用
 */
const initApp = async () => {
  // 设置全局错误处理器
  setupGlobalErrorHandler();

  // 预加载持久化数据
  await preloadPersistedData();

  // 等待 store 创建完成
  const store = await storePromise;

  const app = createApp(App);

  // 使用插件
  app.use(i18n);
  app.use(store);
  app.use(router);

  // 注册全局指令
  setupDirectives(app);

  // 并行初始化插件：Web Vitals + Sentry
  await Promise.all([setupWebVitals(), setupSentry(app, router)]);

  app.mount('#main-app');
};

// 启动应用
initApp();
