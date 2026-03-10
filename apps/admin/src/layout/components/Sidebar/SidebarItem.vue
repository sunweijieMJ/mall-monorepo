<!--
  侧边栏菜单项组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
  支持多级菜单、外链、图标显示
-->
<template>
  <div v-if="!item.meta?.hidden" class="menu-wrapper">
    <!-- 只有一个子菜单且不强制显示父菜单 -->
    <template v-if="showAsSingleItem">
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
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
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
import { computed } from 'vue';
import type { RouteRecordRaw } from 'vue-router';

// 扩展路由类型，支持侧边栏自定义属性
type SidebarRoute = RouteRecordRaw & {
  alwaysShow?: boolean;
  noShowingChildren?: boolean;
};

interface Props {
  item: SidebarRoute;
  basePath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '',
});

// 计算唯一可见的子菜单项，无则返回 null（表示需要展示 sub-menu）
const onlyOneChild = computed<SidebarRoute | null>(() => {
  const children = (props.item.children || []) as SidebarRoute[];
  const showingChildren = children.filter((item) => !item.meta?.hidden);

  if (showingChildren.length === 1) {
    return showingChildren[0];
  }

  // 没有可见子菜单时，将父菜单自身作为叶子节点显示
  if (showingChildren.length === 0) {
    return { ...props.item, path: '', noShowingChildren: true };
  }

  return null;
});

// 是否以单菜单项展示（不显示 sub-menu 折叠层）
const showAsSingleItem = computed(
  () =>
    onlyOneChild.value !== null &&
    (!onlyOneChild.value.children || onlyOneChild.value.noShowingChildren) &&
    !props.item.alwaysShow,
);

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
