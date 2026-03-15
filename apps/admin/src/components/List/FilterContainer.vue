<!--
  搜索筛选容器
  表单字段（左）与查询/重置按钮（右）同行布局，按钮顶部对齐
-->
<template>
  <el-card class="filter-container" shadow="never">
    <div class="filter-inner">
      <div class="filter-form">
        <slot />
      </div>
      <div class="filter-actions">
        <el-button @click="emit('reset')">重置</el-button>
        <el-button type="primary" @click="emit('search')">搜索</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  search: [];
  reset: [];
}>();
</script>

<style scoped lang="scss">
.filter-inner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.filter-form {
  flex: 1;
}

.filter-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  // el-form-item 默认高度约 32px，微调对齐
  padding-top: 1px;
}
</style>
