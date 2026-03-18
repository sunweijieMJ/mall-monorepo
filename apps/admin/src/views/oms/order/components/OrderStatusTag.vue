<script setup lang="ts">
defineProps<{ status: number }>();

const statusMap = {
  0: { label: '待付款', type: 'info' },
  1: { label: '待发货', type: 'warning' },
  2: { label: '已发货', type: 'primary' },
  3: { label: '已完成', type: 'success' },
  4: { label: '已关闭', type: 'danger' },
} as const;
</script>

<template>
  <el-tag :type="statusMap[status]?.type">
    {{ statusMap[status]?.label }}
  </el-tag>
</template>
