<!--
  主布局组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
  布局结构：左侧边栏 + 右侧（顶部导航栏 + 主内容区）
-->
<template>
  <div class="app-wrapper" :class="classObj">
    <!-- 左侧边栏 -->
    <Sidebar class="sidebar-container" />

    <!-- 右侧主容器 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <Navbar />

      <!-- 主内容区 -->
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppMain from './components/AppMain.vue';
import Navbar from './components/Navbar.vue';
import Sidebar from './components/Sidebar/index.vue';
import { useMallAppStore } from '@/store/modules/mallApp';

const appStore = useMallAppStore();

// 侧边栏状态
const sidebar = computed(() => appStore.sidebar);

// 设备类型
const device = computed(() => appStore.device);

// 动态类名
const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile',
}));
</script>

<style lang="scss" scoped>
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100%;

  &.mobile.hideSidebar {
    overflow: hidden;
  }
}

.main-container {
  position: relative;
  min-height: 100%;
  margin-left: 210px;
  transition: margin-left 0.28s;
}

.sidebar-container {
  position: fixed;
  z-index: 1001;
  top: 0;
  bottom: 0;
  left: 0;
  width: 210px !important;
  height: 100%;
  overflow: hidden;
  transition: width 0.28s;
  background-color: #304156;
  font-size: 0;

  // 重置element-plus的菜单样式
  :deep(.el-scrollbar__view) {
    height: 100%;
  }

  :deep(.is-horizontal) {
    display: none;
  }

  :deep(.el-menu) {
    width: 100% !important;
    height: 100%;
    border: none;
  }
}

.hideSidebar .sidebar-container {
  width: 64px !important;
}

.hideSidebar .main-container {
  margin-left: 64px;
}

// 移动端样式
.mobile .main-container {
  margin-left: 0;
}

.mobile .sidebar-container {
  width: 210px !important;
  transition: transform 0.28s;
}

.mobile.hideSidebar .sidebar-container {
  transform: translate3d(-210px, 0, 0);
  transition-duration: 0.3s;
  pointer-events: none;
}

.withoutAnimation {
  .sidebar-container,
  .main-container {
    transition: none !important;
  }
}
</style>
