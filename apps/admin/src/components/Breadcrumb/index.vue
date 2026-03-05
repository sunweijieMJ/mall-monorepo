<!--
  Mall 面包屑导航组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span
          v-if="
            item.redirect === 'noredirect' || index === levelList.length - 1
          "
          class="no-redirect"
        >
          {{ item.meta?.title }}
        </span>
        <router-link v-else :to="item.redirect || item.path">
          {{ item.meta?.title }}
        </router-link>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteLocationMatched } from 'vue-router';

interface BreadcrumbItem extends Partial<RouteLocationMatched> {
  path: string;
  meta?: {
    title?: string;
  };
  redirect?: string;
}

const route = useRoute();
const levelList = ref<BreadcrumbItem[]>([]);

const getBreadcrumb = () => {
  let matched = route.matched.filter((item) => item.name) as BreadcrumbItem[];
  const first = matched[0];

  // 如果第一个不是首页，添加首页到面包屑
  if (first && first.name !== 'home') {
    matched = [
      { path: '/home', meta: { title: '首页' } } as BreadcrumbItem,
    ].concat(matched);
  }

  levelList.value = matched.filter((item) => item.meta && item.meta.title);
};

// 监听路由变化
watch(
  () => route.path,
  () => {
    getBreadcrumb();
  },
);

// 组件挂载时获取面包屑
onMounted(() => {
  getBreadcrumb();
});
</script>

<style scoped lang="scss">
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  margin-left: 10px;
  font-size: 14px;
  line-height: 50px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}

/* 面包屑过渡动画 */
.breadcrumb-enter-active,
.breadcrumb-leave-active {
  transition: all 0.5s;
}

.breadcrumb-enter-from,
.breadcrumb-leave-active {
  transform: translateX(20px);
  opacity: 0;
}

.breadcrumb-leave-active {
  position: absolute;
}
</style>
