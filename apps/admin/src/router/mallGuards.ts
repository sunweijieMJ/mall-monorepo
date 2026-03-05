/**
 * Mall 路由守卫
 * 基于菜单驱动的权限控制系统
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import { ElMessage } from 'element-plus';
import type { Router } from 'vue-router';
import { mallAsyncRoutes } from './routes';
import { useMallPermissionStore } from '@/store/modules/mallPermission';
import { useMallUserStore } from '@/store/modules/mallUser';

/**
 * Mall 路由白名单（无需登录即可访问）
 */
const MALL_WHITE_LIST = ['/login', '/404', '/403'];

/**
 * 判断是否是 Mall 相关路由
 */
function isMallRoute(path: string): boolean {
  return (
    path === '/' ||
    path === '/home' ||
    path.startsWith('/pms') ||
    path.startsWith('/oms') ||
    path.startsWith('/sms') ||
    path.startsWith('/ums')
  );
}

/**
 * 设置 Mall 路由守卫
 *
 * Mall 的权限控制特点：
 * 1. 基于后端返回的菜单数据动态生成路由
 * 2. 菜单数据包含 name, title, icon, hidden 等字段
 * 3. 通过 name 字段匹配前端路由
 * 4. 支持多级菜单嵌套
 */
export function setupMallRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    const mallUserStore = useMallUserStore();
    const mallPermissionStore = useMallPermissionStore();

    // 白名单直接放行
    if (MALL_WHITE_LIST.includes(to.path)) {
      next();
      return;
    }

    // 非 Mall 路由交给默认守卫处理
    if (!isMallRoute(to.path)) {
      next();
      return;
    }

    // 检查 Mall 登录状态
    if (!mallUserStore.token) {
      next({ path: '/login', query: { redirect: to.fullPath } });
      return;
    }

    // 已登录访问登录页，跳转首页
    if (to.path === '/login') {
      next('/home');
      return;
    }

    // 已生成路由，直接放行
    if (mallPermissionStore.isRoutesGenerated) {
      next();
      return;
    }

    // 获取用户信息和菜单数据，生成可访问路由
    try {
      // 获取用户信息（包含菜单数据）
      await mallUserStore.getInfoAction();

      const menus = mallUserStore.menus;
      const username = mallUserStore.name;

      console.log('🔍 [路由守卫] 获取到的菜单数据:', menus);
      console.log('🔍 [路由守卫] 菜单数量:', menus?.length);

      if (!menus || menus.length === 0) {
        throw new Error('菜单数据为空，请联系管理员分配权限');
      }

      // 根据后端菜单数据生成可访问的路由
      const accessRoutes = mallPermissionStore.generateRoutes(
        mallAsyncRoutes,
        menus,
        username,
      );

      console.log('✅ [路由守卫] 生成的可访问路由:', accessRoutes);
      console.log('✅ [路由守卫] 路由数量:', accessRoutes.length);

      // 动态添加路由
      accessRoutes.forEach((route) => router.addRoute(route));

      // 添加 404 路由（必须在最后）
      router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/404',
      });

      console.log('✅ [路由守卫] 路由已动态添加');

      // 重新导航
      next({ ...to, replace: true });
    } catch (error) {
      console.error('❌ [路由守卫] 获取权限失败:', error);
      ElMessage.error(
        error instanceof Error
          ? error.message
          : 'Mall 获取权限失败，请重新登录',
      );
      await mallUserStore.logoutAction();
      mallPermissionStore.resetState();
      next('/login');
    }
  });
}

/**
 * 重置 Mall 路由
 * 用于登出时清理动态添加的路由
 */
export function resetMallRouter(router: Router) {
  const mallPermissionStore = useMallPermissionStore();
  const routes = mallPermissionStore.routes;

  // 移除动态添加的路由
  routes.forEach((route) => {
    if (route.name) {
      router.removeRoute(route.name);
    }
  });

  mallPermissionStore.resetState();
}
