import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/theme-chalk/dark/css-vars.css';
import 'element-plus/dist/index.css';
import { createApp, markRaw } from 'vue';
import App from './app/App.vue';
import { setupDirectives } from './directives';
import { i18n } from './plugins/locale';
import router from './router';
import storePromise, { preloadPersistedData } from './store';

const isDev = process.env.NODE_ENV === 'development';

/**
 * 初始化应用
 */
const initApp = async () => {
  if (!isDev) {
    import('@/utils/reportWebVitals').then((module) => {
      module.reportWebVitals(console.log);
    });
  }

  // 预加载持久化数据
  await preloadPersistedData();

  // 等待 store 创建完成
  const store = await storePromise;

  const app = createApp(App);

  // 注册Element Plus图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, markRaw(component));
  }

  // 使用插件
  app.use(i18n);
  app.use(store);
  app.use(router);

  // 注册全局指令
  setupDirectives(app);

  // 初始化使用动态导入
  try {
    const { initSentry } = await import('@/plugins/sentry');
    await initSentry(app, router);
  } catch (error) {
    console.warn('Sentry initialization failed:', error);
  }

  app.mount('#main-app');
};

// 启动应用
initApp();
