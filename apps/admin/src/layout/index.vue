<!--
  主布局组件
-->
<template>
  <el-watermark
    v-if="watermark.enabled"
    :content="watermark.content"
    :font="watermarkFont"
    :rotate="watermark.rotate"
    :gap="[watermark.gapX, watermark.gapY]"
  >
    <div class="app-wrapper" :class="classObj">
      <LayoutHeader class="app-header" logo-title="Mall Admin" />
      <LayoutMenu class="app-sidebar" />
      <LayoutMain class="app-main" />
    </div>
  </el-watermark>
  <div v-else class="app-wrapper" :class="classObj">
    <LayoutHeader class="app-header" logo-title="Mall Admin" />
    <LayoutMenu class="app-sidebar" />
    <LayoutMain class="app-main" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import LayoutHeader from './components/LayoutHeader/index.vue';
import LayoutMain from './components/LayoutMain/index.vue';
import LayoutMenu from './components/LayoutMenu/index.vue';
import { provideLayoutContext } from './useLayoutContext';
import { useMallAppStore } from '@/store/modules/mallApp';
import { useSiteConfigStore } from '@/store/modules/siteConfig';

// 直接使用返回值，而非通过 inject 重新查找
// inject 从父组件向上查找，在 Layout 自身里用 inject 拿不到自己 provide 的 context
const { layoutVisible, setLayoutVisible } = provideLayoutContext();

const route = useRoute();
const appStore = useMallAppStore();
const siteConfigStore = useSiteConfigStore();

const watermark = computed(() => siteConfigStore.savedConfig.watermark);

const watermarkFont = computed(() => ({
  color: watermark.value.color,
  fontSize: watermark.value.fontSize,
  fontWeight: watermark.value.fontWeight as any,
}));

// 根据路由路径自动切换侧边栏可见性
// 在 layout 层监听（而非在子页面 onMounted/onUnmounted），避免子组件反复挂载/卸载导致的闪烁
watch(
  () => route.path,
  (path) => {
    setLayoutVisible({ nav: !path.startsWith('/setting') });
  },
  { immediate: true },
);

const classObj = computed(() => ({
  hideSidebar: !appStore.sidebar.opened,
  withoutAnimation: appStore.sidebar.withoutAnimation,
  mobile: appStore.device === 'mobile',
  noSidebar: !layoutVisible.nav,
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

  // 隐藏侧边栏（setting 页等特殊页面使用）
  &.noSidebar {
    grid-template-columns: 0 1fr;
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
