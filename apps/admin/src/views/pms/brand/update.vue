<!--
  编辑品牌页面
-->
<template>
  <div class="app-container">
    <BrandDetail :is-edit="true" />
  </div>
</template>

<script setup lang="ts">
import BrandDetail from './components/BrandDetail.vue';
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
