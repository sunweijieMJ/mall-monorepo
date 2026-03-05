<!--
  添加首页广告页面
-->
<template>
  <div class="app-container">
    <div class="form-title">添加广告</div>
    <home-advertise-detail :is-edit="false" />
  </div>
</template>

<script setup lang="ts">
import HomeAdvertiseDetail from './components/HomeAdvertiseDetail.vue';
</script>

<style scoped lang="scss">
.form-title {
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
}
</style>
