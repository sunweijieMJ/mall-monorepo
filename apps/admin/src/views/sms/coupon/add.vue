<!--
  添加优惠券页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <coupon-detail :is-edit="false" />
</template>

<script setup lang="ts">
import CouponDetail from './components/CouponDetail.vue';
</script>
