<!--
  添加商品属性页面
-->
<template>
  <div class="app-container">
    <ProductAttrDetail :is-edit="false" />
  </div>
</template>

<script setup lang="ts">
import ProductAttrDetail from './components/ProductAttrDetail.vue';
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}
</style>
