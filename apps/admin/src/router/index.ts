import { createRouter, createWebHistory } from 'vue-router';
import { setupMallRouterGuard } from './mallGuards';
import { mallConstantRoutes } from './routes';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    ...mallConstantRoutes, // Mall 常规路由
    // 异步路由会在登录后动态添加
  ],
});

// 设置 Mall 路由守卫
setupMallRouterGuard(router);

export default router;
