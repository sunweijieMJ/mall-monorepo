<script setup lang="ts">
defineProps<{ status: number }>();

const statusMap = {
  0: { label: '待处理', type: 'warning' },
  1: { label: '退货中', type: 'primary' },
  2: { label: '已完成', type: 'success' },
  3: { label: '已拒绝', type: 'danger' },
} as const;
</script>

<template>
  <el-tag :type="statusMap[status]?.type">
    {{ statusMap[status]?.label }}
  </el-tag>
</template>
