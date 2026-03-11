<!--
  统一分页组件
  固定 layout 和 pageSizes 风格
-->
<template>
  <div class="pagination-container">
    <el-pagination
      v-model:current-page="currentPageModel"
      v-model:page-size="pageSizeModel"
      background
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="pageSizes"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    total: number;
    currentPage: number;
    pageSize: number;
    pageSizes?: number[];
  }>(),
  { pageSizes: () => [10, 15, 20] },
);

const emit = defineEmits<{
  'update:currentPage': [val: number];
  'update:pageSize': [val: number];
  sizeChange: [val: number];
  pageChange: [val: number];
}>();

const currentPageModel = computed({
  get: () => props.currentPage,
  set: (val) => emit('update:currentPage', val),
});

const pageSizeModel = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val),
});

const handleSizeChange = (val: number) => {
  emit('sizeChange', val);
};

const handleCurrentChange = (val: number) => {
  emit('pageChange', val);
};
</script>
