import { createSSRApp } from 'vue';
import App from './App.vue';
import { createPersistedPinia } from './store';
import { setupRouterInterceptor } from './utils/routerInterceptor';

export function createApp() {
  const app = createSSRApp(App);

  app.use(createPersistedPinia());

  setupRouterInterceptor();

  return { app };
}
