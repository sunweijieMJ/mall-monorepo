/**
 * 多页签状态管理
 * 管理 visitedViews（页签列表）和 cachedViews（keep-alive 缓存列表）
 */

import { defineStore } from 'pinia';
import { nextTick, ref } from 'vue';
import type {
  RouteLocationNormalizedLoaded,
  RouteRecordNormalized,
} from 'vue-router';

export interface TabView {
  /** route.path，作为唯一 key */
  path: string;
  /** route.name，用于 keep-alive include */
  name?: string;
  /** meta.title */
  title: string;
  /** 固定页签（首页），不可关闭 */
  affix?: boolean;
  /** 不缓存 */
  noCache?: boolean;
}

/** 从路由构建 TabView */
function buildTabView(route: RouteLocationNormalizedLoaded): TabView {
  return {
    path: route.path,
    name: route.name as string | undefined,
    title: route.meta?.title as string,
    affix: route.meta?.affix as boolean | undefined,
    noCache: route.meta?.noCache as boolean | undefined,
  };
}

/** keep-alive 最大缓存组件数 */
export const TAB_MAX_CACHED = 15;

export const useTabViewStore = defineStore(
  'tabView',
  () => {
    /** 已访问页签列表 */
    const visitedViews = ref<TabView[]>([]);
    /** keep-alive include 列表（route.name） */
    const cachedViews = ref<string[]>([]);
    /** 刷新中状态：LayoutMain 监听此值，临时 v-if 卸载 router-view 强制重建 */
    const isRefreshing = ref(false);

    /** 初始化固定页签（含 affix: true 的路由，如首页） */
    const initAffixTabs = (affixViews: TabView[]) => {
      for (const view of affixViews) {
        if (!visitedViews.value.find((v) => v.path === view.path)) {
          visitedViews.value.push(view);
        }
      }
    };

    /**
     * 从路由表自动扫描 meta.affix === true 的路由并初始化固定页签
     * 以路由配置为唯一数据来源，避免手动维护 TabView 对象
     */
    const initAffixTabsFromRoutes = (routes: RouteRecordNormalized[]) => {
      const affixViews: TabView[] = routes
        .filter((r) => r.meta?.affix && r.meta?.title && r.name)
        .map((r) => ({
          path: r.path,
          name: r.name as string,
          title: r.meta.title as string,
          affix: true,
        }));
      initAffixTabs(affixViews);
    };

    /** 添加 keep-alive 缓存（内部使用） */
    const _addCached = (route: RouteLocationNormalizedLoaded) => {
      const name = route.name as string | undefined;
      if (!name) return;
      if (route.meta?.noCache) return;
      if (!cachedViews.value.includes(name)) {
        cachedViews.value.push(name);
      }
    };

    /** 移除 keep-alive 缓存（内部使用） */
    const _removeCached = (name: string) => {
      const index = cachedViews.value.indexOf(name);
      if (index > -1) cachedViews.value.splice(index, 1);
    };

    /** 根据当前 visitedViews 重建 cachedViews（保留 noCache 过滤） */
    const _rebuildCached = () => {
      cachedViews.value = visitedViews.value
        .filter((v) => v.name && !v.noCache)
        .map((v) => v.name as string);
    };

    /**
     * 进入路由时添加页签
     * - hidden 路由（添加页/编辑页）不加 tab
     * - 无 title 的路由 skip
     */
    const addView = (route: RouteLocationNormalizedLoaded) => {
      if (route.meta?.hidden) return;
      if (!route.meta?.title) return;
      // 跳过带 redirect 的结构性父路由（如 /ums → /ums/admin），避免重复添加页签
      const lastMatched = route.matched[route.matched.length - 1];
      if (lastMatched?.redirect) return;

      const exists = visitedViews.value.find((v) => v.path === route.path);
      if (!exists) {
        visitedViews.value.push(buildTabView(route));
      }
      _addCached(route);
    };

    /**
     * 关闭页签，返回关闭后应跳转的 path
     * 优先右侧 tab，无则左侧
     */
    const removeView = (path: string): string => {
      const index = visitedViews.value.findIndex((v) => v.path === path);
      if (index === -1) return path;

      const removed = visitedViews.value.splice(index, 1)[0];
      if (removed.name) _removeCached(removed.name);

      // 计算跳转目标：优先右侧，无则左侧
      const nextView =
        visitedViews.value[index] ?? visitedViews.value[index - 1];
      return nextView?.path ?? '/';
    };

    /** 关闭其他页签（保留 affix） */
    const removeOthers = (path: string) => {
      visitedViews.value = visitedViews.value.filter(
        (v) => v.affix || v.path === path,
      );
      _rebuildCached();
    };

    /** 关闭左侧页签（保留 affix + 当前及右侧） */
    const removeLeft = (path: string) => {
      const currentIndex = visitedViews.value.findIndex((v) => v.path === path);
      if (currentIndex === -1) return;
      visitedViews.value = visitedViews.value.filter(
        (v, i) => v.affix || i >= currentIndex,
      );
      _rebuildCached();
    };

    /** 关闭右侧页签（保留 affix + 当前及左侧） */
    const removeRight = (path: string) => {
      const currentIndex = visitedViews.value.findIndex((v) => v.path === path);
      if (currentIndex === -1) return;
      visitedViews.value = visitedViews.value.filter(
        (v, i) => v.affix || i <= currentIndex,
      );
      _rebuildCached();
    };

    /** 关闭全部（保留 affix），返回首页 path */
    const removeAll = (): string => {
      visitedViews.value = visitedViews.value.filter((v) => v.affix);
      _rebuildCached();
      return visitedViews.value[0]?.path ?? '/';
    };

    /**
     * 刷新当前视图：通过 isRefreshing 通知 LayoutMain 临时卸载 router-view
     * keep-alive 实例随之销毁，重建后再加回 cachedViews
     */
    const refreshView = async (route: RouteLocationNormalizedLoaded) => {
      const name = route.name as string | undefined;
      // 先移出缓存，再触发卸载
      if (name) _removeCached(name);
      isRefreshing.value = true;
      await nextTick();
      isRefreshing.value = false;
      // 重建后重新加入缓存
      if (name) _addCached(route);
    };

    return {
      visitedViews,
      cachedViews,
      isRefreshing,
      initAffixTabs,
      initAffixTabsFromRoutes,
      addView,
      removeView,
      removeOthers,
      removeLeft,
      removeRight,
      removeAll,
      refreshView,
    };
  },
  {
    // 只持久化页签列表，cachedViews/isRefreshing 为运行时状态不需要持久化
    persist: {
      pick: ['visitedViews'],
    },
  },
);
