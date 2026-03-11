<!--
  侧边栏组件
-->
<template>
  <aside class="layout-menu">
    <!-- 折叠/展开按钮 -->
    <div class="menu-toggle" @click="toggleSideBar">
      <el-icon>
        <Expand v-if="isCollapse" />
        <Fold v-else />
      </el-icon>
    </div>

    <!-- 菜单滚动容器 -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <MenuItem
        :routes="routes"
        :is-collapse="isCollapse"
        :active-menu="activeMenu"
      />
    </el-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue';
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import MenuItem from './MenuItem.vue';
import { useMallAppStore } from '@/store/modules/mallApp';
import { useMallPermissionStore } from '@/store/modules/mallPermission';

const route = useRoute();
const appStore = useMallAppStore();
const permissionStore = useMallPermissionStore();

const routes = computed(() => permissionStore.routes);

const activeMenu = computed(() => {
  const { meta, path } = route;
  return (meta?.activeMenu as string) || path;
});

const isCollapse = computed(() => !appStore.sidebar.opened);

const toggleSideBar = () => {
  appStore.toggleSidebar();
};
</script>

<style lang="scss" scoped>
.layout-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--colorBorderSecondary);
  background-color: var(--colorBgContainer);

  .el-scrollbar {
    flex: 1;

    :deep(.scrollbar-wrapper) {
      overflow-x: hidden !important;

      .el-scrollbar__view {
        height: 100%;
      }
    }

    :deep(.el-menu) {
      height: 100%;
      border: none;

      // 折叠状态：强制隐藏文字，防止过渡期间文字溢出；箭头移到右下角
      &.el-menu--collapse {
        width: 64px !important;

        span {
          display: none;
        }

        .el-sub-menu__icon-arrow {
          display: none;
        }
      }
    }
  }
}

.menu-toggle {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 50px;
  transition: background-color 0.2s;
  color: var(--colorIcon);
  font-size: 20px;
  cursor: pointer;

  &:hover {
    background-color: var(--controlItemBgHover);
  }
}
</style>
