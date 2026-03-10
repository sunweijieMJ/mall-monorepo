/**
 * Mall 路由守卫
 * 基于菜单驱动的权限控制系统
 * 从 mall-admin-web 迁移并转换为 TypeScript
 */

import { ElMessage } from 'element-plus';
import type { Router, RouteRecordRaw } from 'vue-router';
import { mallAsyncRoutes } from './routes';
import type { MenuItem } from '@/interface';
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
 * 根据菜单数据生成并注册动态路由
 * 在登录完成后调用可避免首次导航触发重定向"刷新"
 */
export function buildAndRegisterRoutes(
  router: Router,
  menus: MenuItem[],
): void {
  const mallPermissionStore = useMallPermissionStore();

  // 浅拷贝，防止原地修改静态路由配置（generateRoutes 会 filter/mutate children 和 meta）
  const asyncRoutesCopy = mallAsyncRoutes.map((route) => ({
    ...route,
    meta: route.meta ? { ...route.meta } : undefined,
    children: route.children?.map((child) => ({
      ...child,
      meta: child.meta ? { ...child.meta } : undefined,
    })),
  })) as RouteRecordRaw[];

  const accessRoutes = mallPermissionStore.generateRoutes(
    asyncRoutesCopy,
    menus,
  );
  accessRoutes.forEach((route) => router.addRoute(route));
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
  router.beforeEach(async (to, _from) => {
    const mallUserStore = useMallUserStore();
    const mallPermissionStore = useMallPermissionStore();

    // 白名单直接放行
    if (MALL_WHITE_LIST.includes(to.path)) {
      return true;
    }

    // 非 Mall 路由交给默认守卫处理
    if (!isMallRoute(to.path)) {
      return true;
    }

    // 检查 Mall 登录状态
    if (!mallUserStore.token) {
      return { path: '/login', query: { redirect: to.fullPath } };
    }

    // 已登录访问登录页，跳转首页
    if (to.path === '/login') {
      return '/home';
    }

    // 已生成路由，直接放行（登录时预生成后不再重复）
    if (mallPermissionStore.isRoutesGenerated) {
      // 路由已生成仍命中兜底路由，说明是真正不存在的路径
      if (to.name === 'NotFound') {
        return '/404';
      }
      return true;
    }

    // 页面刷新场景：重新获取用户信息并生成路由
    try {
      await mallUserStore.getInfoAction();

      const menus = mallUserStore.menus;
      if (!menus || menus.length === 0) {
        throw new Error('菜单数据为空，请联系管理员分配权限');
      }

      buildAndRegisterRoutes(router, menus);

      // 路由刚注册完，需重新导航让 Vue Router 重新匹配
      return { path: to.fullPath, replace: true };
    } catch (error) {
      console.error('❌ [路由守卫] 获取权限失败:', error);
      ElMessage.error(
        error instanceof Error
          ? error.message
          : 'Mall 获取权限失败，请重新登录',
      );
      await mallUserStore.logoutAction();
      mallPermissionStore.resetState();
      return '/login';
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
