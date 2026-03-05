<!--
  添加商品分类页面
-->
<template>
  <div class="app-container">
    <ProductCateDetail :is-edit="false" />
  </div>
</template>

<script setup lang="ts">
import ProductCateDetail from './components/ProductCateDetail.vue';
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
