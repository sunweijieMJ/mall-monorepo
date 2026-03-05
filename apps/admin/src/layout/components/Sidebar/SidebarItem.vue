<!--
  侧边栏菜单项组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
  支持多级菜单、外链、图标显示
-->
<template>
  <div v-if="!item.meta?.hidden" class="menu-wrapper">
    <!-- 只有一个子菜单且不强制显示父菜单 -->
    <template
      v-if="
        hasOneShowingChild(item.children, item) &&
        (!onlyOneChild?.children || onlyOneChild.noShowingChildren) &&
        !item.alwaysShow
      "
    >
      <!-- 外链 -->
      <a
        v-if="onlyOneChild?.meta?.link"
        :href="onlyOneChild.meta.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <el-icon v-if="onlyOneChild.meta?.icon">
            <component :is="onlyOneChild.meta.icon" />
          </el-icon>
          <template #title>
            <span>{{ onlyOneChild.meta?.title }}</span>
          </template>
        </el-menu-item>
      </a>
      <!-- 内部路由 -->
      <router-link v-else :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <el-icon v-if="onlyOneChild.meta?.icon">
            <component :is="onlyOneChild.meta.icon" />
          </el-icon>
          <template #title>
            <span>{{ onlyOneChild.meta?.title }}</span>
          </template>
        </el-menu-item>
      </router-link>
    </template>

    <!-- 有多个子菜单 -->
    <el-sub-menu
      v-else
      ref="subMenu"
      :index="resolvePath(item.path)"
      teleported
    >
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <SidebarItem
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

interface Props {
  item: RouteRecordRaw;
  basePath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '',
});

const onlyOneChild = ref<RouteRecordRaw | null>(null);

// 判断是否只有一个显示的子菜单
const hasOneShowingChild = (
  children: RouteRecordRaw[] = [],
  parent: RouteRecordRaw,
) => {
  const showingChildren = children.filter((item) => {
    if (item.meta?.hidden) {
      return false;
    }
    // 临时设置（如果只有一个显示的子项，则将使用）
    onlyOneChild.value = item;
    return true;
  });

  // 当只有一个子路由器时，默认显示子路由器
  if (showingChildren.length === 1) {
    return true;
  }

  // 如果没有要显示的子路由器，则显示父路由器
  if (showingChildren.length === 0) {
    onlyOneChild.value = {
      ...parent,
      path: '',
      noShowingChildren: true,
    } as any;
    return true;
  }

  return false;
};

/**
 * 解析路径
 * 拼接 basePath 和 routePath，生成完整路径
 */
const resolvePath = (routePath: string): string => {
  // 外链直接返回
  if (routePath.startsWith('http://') || routePath.startsWith('https://')) {
    return routePath;
  }

  // 绝对路径直接返回
  if (routePath.startsWith('/')) {
    return routePath;
  }

  // 相对路径拼接
  const base = props.basePath || '';

  // 如果 basePath 为空，直接返回 routePath
  if (!base) {
    return '/' + routePath;
  }

  // 拼接路径，确保只有一个斜杠
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedRoute = routePath.startsWith('/')
    ? routePath
    : '/' + routePath;

  return normalizedBase + normalizedRoute;
};
</script>

<style lang="scss" scoped>
.menu-wrapper {
  a {
    text-decoration: none;
  }

  .el-menu-item,
  .el-sub-menu__title {
    &:hover {
      background-color: rgb(0 0 0 / 0.06) !important;
    }
  }
}
</style>
