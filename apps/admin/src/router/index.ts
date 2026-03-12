import type { Component } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { setupMallRouterGuard } from './guards';
import { mallConstantRoutes } from './routes';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    icon?: Component;
    hidden?: boolean;
    sort?: number;
    link?: string;
    /** 固定页签，不可关闭（如首页） */
    affix?: boolean;
    /** 禁止 keep-alive 缓存 */
    noCache?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    ...mallConstantRoutes, // Mall 常规路由
    // 异步路由会在登录后动态添加
    // 兜底路由：在初始化时即注册，避免刷新时 Vue Router 找不到路由而报 warn
    // 使用 component 而非 redirect，保留 to.path 供守卫判断
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/404.vue'),
      meta: { hidden: true },
    },
  ],
});

// 设置 Mall 路由守卫
setupMallRouterGuard(router);

export default router;
