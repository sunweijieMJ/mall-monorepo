<!--
  通用表格组件
  统一 v-loading/width 默认配置，columns 通过 slot 传入。
  额外的 el-table 属性（如 row-key、@sort-change 等）通过 v-bind="$attrs" 透传。
  传入 total 时，在表格下方内嵌分页，与表格共用同一白色容器。
-->
<template>
  <el-card class="table-panel" shadow="never" :body-style="{ padding: '0' }">
    <el-table
      v-loading="loading"
      :data="data"
      style="width: 100%"
      v-bind="$attrs"
    >
      <slot />
    </el-table>
    <div v-if="total !== undefined" class="table-pagination">
      <el-pagination
        v-model:current-page="currentPageModel"
        v-model:page-size="pageSizeModel"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="pageSizes"
        :total="total"
        @size-change="emit('sizeChange', $event)"
        @current-change="emit('pageChange', $event)"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    data: any[];
    loading?: boolean;
    total?: number;
    currentPage?: number;
    pageSize?: number;
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
  get: () => props.currentPage ?? 1,
  set: (val) => emit('update:currentPage', val),
});

const pageSizeModel = computed({
  get: () => props.pageSize ?? 10,
  set: (val) => emit('update:pageSize', val),
});
</script>

<style scoped lang="scss">
.table-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
