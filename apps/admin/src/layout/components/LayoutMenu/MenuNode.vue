<!--
  单个菜单节点（递归）
  支持外链、内部路由、多级子菜单
-->
<template>
  <div v-if="!item.meta?.hidden" class="menu-node">
    <!-- 只有一个可见子项，直接作为叶子节点展示 -->
    <template v-if="showAsSingleItem">
      <!-- 外链 -->
      <a
        v-if="singleChild.meta?.link"
        :href="singleChild.meta.link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <el-menu-item :index="resolvePath(singleChild.path)">
          <el-icon v-if="singleChild.meta?.icon">
            <component :is="singleChild.meta.icon" />
          </el-icon>
          <template #title>
            <span>{{ singleChild.meta?.title }}</span>
          </template>
        </el-menu-item>
      </a>
      <!-- 内部路由 -->
      <router-link v-else :to="resolvePath(singleChild.path)">
        <el-menu-item :index="resolvePath(singleChild.path)">
          <el-icon v-if="singleChild.meta?.icon">
            <component :is="singleChild.meta.icon" />
          </el-icon>
          <template #title>
            <span>{{ singleChild.meta?.title }}</span>
          </template>
        </el-menu-item>
      </router-link>
    </template>

    <!-- 有多个可见子项，展示折叠子菜单 -->
    <el-sub-menu v-else :index="resolvePath(item.path)" teleported>
      <template #title>
        <el-icon v-if="item.meta?.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>
      <MenuNode
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

const onlyOneChild = computed<SidebarRoute | null>(() => {
  const children = (props.item.children || []) as SidebarRoute[];
  const showingChildren = children.filter((item) => !item.meta?.hidden);

  if (showingChildren.length === 1) {
    return showingChildren[0];
  }
  if (showingChildren.length === 0) {
    return { ...props.item, path: '', noShowingChildren: true };
  }
  return null;
});

const showAsSingleItem = computed(
  () =>
    onlyOneChild.value !== null &&
    (!onlyOneChild.value.children || onlyOneChild.value.noShowingChildren) &&
    !props.item.alwaysShow,
);

// showAsSingleItem 为 true 时 onlyOneChild 一定非 null，用此 computed 消除模板中的类型错误
const singleChild = computed(() => onlyOneChild.value as SidebarRoute);

const resolvePath = (routePath: string): string => {
  if (routePath.startsWith('http://') || routePath.startsWith('https://')) {
    return routePath;
  }
  if (routePath.startsWith('/')) {
    return routePath;
  }
  const base = props.basePath;
  if (!base) return '/' + routePath;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return normalizedBase + '/' + routePath;
};
</script>

<style lang="scss" scoped>
.menu-node {
  a {
    text-decoration: none;
  }
}
</style>
