<!--
  主内容区组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="cachedViews">
          <component :is="Component" :key="route.path" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMallAppStore } from '@/store/modules/mallApp';

const appStore = useMallAppStore();

// 缓存的视图列表
const cachedViews = computed(() => appStore.cachedViews);
</script>

<style lang="scss" scoped>
.app-main {
  position: relative;
  box-sizing: border-box;
  width: 100%;

  /* 50是navbar的高度 */
  min-height: calc(100vh - 50px);
  padding: 20px;
  overflow: hidden;
  background-color: #f0f2f5;
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
