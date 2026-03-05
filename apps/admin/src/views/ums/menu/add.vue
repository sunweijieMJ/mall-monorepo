<!--
  添加菜单页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <menu-detail :is-edit="false" />
</template>

<script setup lang="ts">
import MenuDetail from './components/MenuDetail.vue';
</script>
