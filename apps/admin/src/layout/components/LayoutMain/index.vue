<template>
  <main class="layout-main">
    <!-- /setting 页面不显示 TabBar -->
    <LayoutTabBar v-if="showTabBar" />
    <div class="main-content">
      <!-- v-if="!isRefreshing" 配合 refreshView：临时卸载触发组件重建 -->
      <!-- viewRoute 重命名避免遮蔽外层 useRoute() 的 route -->
      <router-view
        v-if="!isRefreshing"
        v-slot="{ Component, route: viewRoute }"
      >
        <transition name="fade-transform" mode="out-in">
          <keep-alive :include="cachedViews" :max="TAB_MAX_CACHED">
            <component :is="Component" :key="viewRoute.path" />
          </keep-alive>
        </transition>
      </router-view>
    </div>
  </main>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import LayoutTabBar from '../LayoutTabBar/index.vue';
import { useTabViewStore } from '@/store';
import { TAB_MAX_CACHED } from '@/store/modules/tabView';

const route = useRoute();
const router = useRouter();
const tabViewStore = useTabViewStore();

const { cachedViews, isRefreshing } = storeToRefs(tabViewStore);

const showTabBar = computed(() => !route.path.startsWith('/setting'));

// 自动从路由配置中扫描 meta.affix === true 的路由初始化固定页签
tabViewStore.initAffixTabsFromRoutes(router.getRoutes());

// 路由切换时添加页签：监听 fullPath 避免 deep watch 整个 route 对象
watch(
  () => route.fullPath,
  () => {
    tabViewStore.addView(route);
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.layout-main {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--colorBgLayout);
}

.main-content {
  flex: 1;
  overflow: auto;
}

// 页面切换动画
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.25s;
}

.fade-transform-enter-from {
  transform: translateX(-30px);
  opacity: 0;
}

.fade-transform-leave-to {
  transform: translateX(30px);
  opacity: 0;
}
</style>
