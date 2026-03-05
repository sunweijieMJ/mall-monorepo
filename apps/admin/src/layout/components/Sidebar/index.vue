<!--
  侧边栏组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :unique-opened="false"
      :collapse-transition="false"
      mode="vertical"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <SidebarItem
        v-for="routeItem in routes"
        :key="routeItem.path"
        :item="routeItem"
        :base-path="routeItem.path"
      />
    </el-menu>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SidebarItem from './SidebarItem.vue';
import { useMallAppStore } from '@/store/modules/mallApp';
import { useMallPermissionStore } from '@/store/modules/mallPermission';

const route = useRoute();
const appStore = useMallAppStore();
const permissionStore = useMallPermissionStore();

// 路由列表
const routes = computed(() => permissionStore.routes);

// 当前激活菜单
const activeMenu = computed(() => {
  const { meta, path } = route;
  // 如果设置了activeMenu，则使用activeMenu作为激活菜单
  if (meta?.activeMenu) {
    return meta.activeMenu as string;
  }
  return path;
});

// 是否折叠
const isCollapse = computed(() => !appStore.sidebar.opened);
</script>

<style lang="scss" scoped>
.el-scrollbar {
  height: 100%;

  :deep(.scrollbar-wrapper) {
    overflow-x: hidden !important;

    .el-scrollbar__view {
      height: 100%;
    }
  }

  :deep(.el-menu) {
    width: 100% !important;
    height: 100%;
    border: none;
  }
}
</style>
