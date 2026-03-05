<!--
  添加商品页面
-->
<template>
  <div class="app-container">
    <ProductDetail :is-edit="false" />
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
