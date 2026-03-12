import { createSSRApp } from 'vue';
import App from './app/App.vue';
import pinia from './store';
import { i18n } from './utils/locale';
import { setupRouterInterceptor } from './utils/routerInterceptor';

/**
 * UniApp 应用入口
 */
export function createApp() {
  const app = createSSRApp(App);

  // 使用插件
  app.use(i18n);
  app.use(pinia);

  // 设置路由拦截器
  setupRouterInterceptor();

  return { app };
}
