<template>
  <nav class="layout-breadcrumb">
    <el-breadcrumb separator="/">
      <transition-group name="breadcrumb">
        <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
          <span v-if="isLast(index)" class="breadcrumb-last">
            {{ item.meta?.title }}
          </span>
          <a v-else @click.prevent="handleLink(item)">{{ item.meta?.title }}</a>
        </el-breadcrumb-item>
      </transition-group>
    </el-breadcrumb>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter, type RouteLocationMatched } from 'vue-router';

const route = useRoute();
const router = useRouter();
const levelList = ref<RouteLocationMatched[]>([]);

const isLast = (index: number) => index === levelList.value.length - 1;

const isDashboard = (item: RouteLocationMatched) => {
  const name = item?.name;
  return !!name && (name as string).trim().toLowerCase() === 'home';
};

const getBreadcrumb = () => {
  let matched = route.matched.filter((item) => item.meta?.title);
  if (!isDashboard(matched[0])) {
    matched = [
      { path: '/home', meta: { title: '首页' } } as RouteLocationMatched,
      ...matched,
    ];
  }
  levelList.value = matched.filter(
    (item) => item.meta?.title && item.meta?.breadcrumb !== false,
  );
};

const handleLink = (item: RouteLocationMatched) => {
  const { redirect, path } = item;
  router.push(redirect ? (redirect as string) : path);
};

watch(() => route.path, getBreadcrumb, { immediate: true });
</script>

<style lang="scss" scoped>
.layout-breadcrumb {
  display: flex;
  align-items: center;
  height: 100%;

  .breadcrumb-last {
    color: var(--colorTextSecondary);
    cursor: text;
  }

  a {
    cursor: pointer;

    &:hover {
      color: var(--colorPrimary);
    }
  }
}
</style>
