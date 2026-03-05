/**
 * Mall 应用状态管理
 * 管理侧边栏、设备类型、缓存视图等应用级状态
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useMallAppStore = defineStore(
  'mallApp',
  () => {
    // 侧边栏状态
    const sidebar = ref({
      opened: true,
      withoutAnimation: false,
    });

    // 设备类型
    const device = ref<'desktop' | 'mobile'>('desktop');

    // 缓存的视图列表
    const cachedViews = ref<string[]>([]);

    // 切换侧边栏
    const toggleSidebar = () => {
      sidebar.value.opened = !sidebar.value.opened;
      sidebar.value.withoutAnimation = false;
    };

    // 关闭侧边栏
    const closeSidebar = (withoutAnimation: boolean) => {
      sidebar.value.opened = false;
      sidebar.value.withoutAnimation = withoutAnimation;
    };

    // 切换设备类型
    const toggleDevice = (deviceType: 'desktop' | 'mobile') => {
      device.value = deviceType;
    };

    // 添加缓存视图
    const addCachedView = (view: string) => {
      if (cachedViews.value.includes(view)) return;
      cachedViews.value.push(view);
    };

    // 删除缓存视图
    const delCachedView = (view: string) => {
      const index = cachedViews.value.indexOf(view);
      if (index > -1) {
        cachedViews.value.splice(index, 1);
      }
    };

    // 清空缓存视图
    const delAllCachedViews = () => {
      cachedViews.value = [];
    };

    return {
      sidebar,
      device,
      cachedViews,
      toggleSidebar,
      closeSidebar,
      toggleDevice,
      addCachedView,
      delCachedView,
      delAllCachedViews,
    };
  },
  {
    persist: {
      key: 'mall-app',
      storage: localStorage,
      paths: ['sidebar.opened'],
    },
  },
);
