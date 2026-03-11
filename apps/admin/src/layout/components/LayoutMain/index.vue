<template>
  <main class="layout-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMallAppStore } from '@/store/modules/mallApp';

const appStore = useMallAppStore();

const cachedViews = computed(() => appStore.cachedViews);
</script>

<style scoped lang="scss">
.layout-main {
  box-sizing: border-box;
  overflow: auto;
  background-color: var(--colorBgLayout);
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
