<!--
  主布局组件
-->
<template>
  <div class="app-wrapper" :class="classObj">
    <LayoutHeader class="app-header" logo-title="Mall Admin" />
    <LayoutMenu class="app-sidebar" />
    <LayoutMain class="app-main" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LayoutHeader from './components/LayoutHeader/index.vue';
import LayoutMain from './components/LayoutMain/index.vue';
import LayoutMenu from './components/LayoutMenu/index.vue';
import { provideLayoutContext } from './useLayoutContext';
import { useMallAppStore } from '@/store/modules/mallApp';

provideLayoutContext();

const appStore = useMallAppStore();

const classObj = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  withoutAnimation: appStore.sidebar.withoutAnimation,
  mobile: appStore.device === 'mobile',
}));
</script>

<style lang="scss" scoped>
// Grid 布局：Header(50px) 占顶部，侧边栏(210px) + 主内容在下方
.app-wrapper {
  display: grid;

  // grid-template: rows / columns（同时定义 areas、行高、列宽）
  grid-template:
    'header header' 50px
    'sidebar main' 1fr
    / 210px 1fr;
  height: 100vh;
  overflow: hidden;
  transition: grid-template-columns 0.28s;

  &.hideSidebar {
    grid-template-columns: 64px 1fr;
  }

  &.withoutAnimation {
    transition: none;
  }

  // 移动端：侧边栏覆盖在内容上
  &.mobile {
    grid-template-columns: 0 1fr;

    .app-sidebar {
      position: fixed;
      z-index: 1000;
      top: 50px;
      bottom: 0;
      left: 0;
      width: 210px;
      transform: translateX(0);
      transition: transform 0.3s;
    }
  }

  &.mobile.hideSidebar .app-sidebar {
    transform: translateX(-210px);
    pointer-events: none;
  }
}

.app-header {
  z-index: 1001;
  grid-area: header;
}

.app-sidebar {
  grid-area: sidebar;
  overflow: hidden;
}

.app-main {
  grid-area: main;
}
</style>
