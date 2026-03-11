<!--
  菜单树组件
-->
<template>
  <el-menu
    :default-active="activeMenu"
    :collapse="isCollapse"
    :unique-opened="false"
    :collapse-transition="false"
    mode="vertical"
  >
    <MenuNode
      v-for="item in routes"
      :key="item.path"
      :item="item"
      :base-path="item.path"
    />
  </el-menu>
</template>

<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router';
import MenuNode from './MenuNode.vue';

interface Props {
  routes: RouteRecordRaw[];
  isCollapse: boolean;
  activeMenu: string;
}

defineProps<Props>();
</script>
