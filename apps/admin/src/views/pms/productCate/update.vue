<!--
  编辑商品分类页面
-->
<template>
  <div class="app-container">
    <ProductCateDetail :is-edit="true" />
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
