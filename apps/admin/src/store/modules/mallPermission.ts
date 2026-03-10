/**
 * Mall 权限状态管理（菜单驱动模式）
 * 从 mall-admin-web 的 Vuex 迁移到 Pinia
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';
import type { MenuItem } from '@/interface';
import { mallConstantRoutes } from '@/router/routes';

/**
 * 判断是否有权限访问该菜单
 */
function hasPermission(menus: MenuItem[], route: RouteRecordRaw): boolean {
  if (route.name) {
    const currMenu = getMenu(String(route.name), menus);
    if (currMenu != null) {
      // 设置菜单的标题、图标和可见性
      if (route.meta) {
        if (currMenu.title != null && currMenu.title !== '') {
          route.meta.title = currMenu.title;
        }
        if (currMenu.icon != null && currMenu.icon !== '') {
          route.meta.icon = currMenu.icon;
        }
        if (currMenu.hidden != null) {
          route.meta.hidden = currMenu.hidden !== 0;
        }
        if (currMenu.sort != null && currMenu.sort !== 0) {
          route.meta.sort = currMenu.sort;
        }
      }
      return true;
    }
    // 路由未在菜单中
    if (route.meta && route.meta.hidden === true) {
      // 隐藏路由允许访问
      if (route.meta) {
        route.meta.sort = -1;
      }
      return true;
    }
    // 普通路由不允许
    return false;
  }
  return true;
}

/**
 * 根据路由名称获取菜单（递归搜索）
 * 支持不区分大小写匹配（后端返回小写，前端使用驼峰）
 */
function getMenu(name: string, menus: MenuItem[]): MenuItem | null {
  const lowerName = name.toLowerCase();

  for (const menu of menus) {
    if (lowerName === menu.name.toLowerCase()) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = getMenu(name, menu.children);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 对菜单进行排序
 */
function sortRouters(accessedRouters: RouteRecordRaw[]): void {
  for (let i = 0; i < accessedRouters.length; i++) {
    const router = accessedRouters[i];
    if (router.children && router.children.length > 0) {
      router.children.sort((a, b) => {
        const sortA = a.meta?.sort || 0;
        const sortB = b.meta?.sort || 0;
        return Number(sortB) - Number(sortA);
      });
    }
  }
  accessedRouters.sort((a, b) => {
    const sortA = a.meta?.sort || 0;
    const sortB = b.meta?.sort || 0;
    return Number(sortB) - Number(sortA);
  });
}

export const useMallPermissionStore = defineStore('mallPermission', () => {
  // State
  // 初始化时包含常规路由，确保首页菜单可见
  const routes = ref<RouteRecordRaw[]>([...mallConstantRoutes]);
  const isRoutesGenerated = ref(false);

  // Actions
  /**
   * 根据菜单生成可访问的路由
   */
  const generateRoutes = (asyncRoutes: RouteRecordRaw[], menus: MenuItem[]) => {
    const accessedRoutes = asyncRoutes.filter((v) => {
      const hasAccess = hasPermission(menus, v);
      if (hasAccess && v.children && v.children.length > 0) {
        v.children = v.children.filter((child) => hasPermission(menus, child));
      }
      return hasAccess;
    });

    // 对菜单进行排序
    sortRouters(accessedRoutes);

    // 合并常规路由和可访问的异步路由
    routes.value = [...mallConstantRoutes, ...accessedRoutes];
    isRoutesGenerated.value = true;

    return accessedRoutes;
  };

  // 重置状态
  const resetState = () => {
    routes.value = [...mallConstantRoutes];
    isRoutesGenerated.value = false;
  };

  return {
    // State
    routes,
    isRoutesGenerated,
    // Actions
    generateRoutes,
    resetState,
  };
});
