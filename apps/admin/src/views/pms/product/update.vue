<!--
  编辑商品页面
-->
<template>
  <div class="app-container">
    <ProductDetail :is-edit="true" />
  </div>
</template>

<script setup lang="ts">
import ProductDetail from './components/ProductDetail.vue';
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
