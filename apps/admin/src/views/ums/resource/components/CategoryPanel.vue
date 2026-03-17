<!--
  资源分类面板（拖拽排序）
-->
<template>
  <el-card shadow="never" class="category-panel">
    <template #header>
      <div class="category-header">
        <span>资源分类</span>
        <el-button type="primary" link @click="emit('add')">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </template>

    <div v-loading="loading" class="category-list">
      <div
        class="category-item"
        :class="{ active: selectedId === null }"
        @click="emit('select', null)"
      >
        <span>全部</span>
      </div>
      <div ref="sortableRef" class="sortable-wrapper">
        <div
          v-for="cate in categories"
          :key="cate.id"
          class="category-item"
          :class="{ active: selectedId === cate.id }"
          :data-id="cate.id"
          @click="emit('select', cate.id)"
        >
          <div class="category-left">
            <el-icon class="drag-handle"><Rank /></el-icon>
            <span class="category-name">{{ cate.name }}</span>
          </div>
          <span class="category-actions" @click.stop>
            <el-button
              link
              type="primary"
              size="small"
              @click="emit('edit', cate)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="emit('delete', cate)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Delete, Edit, Plus, Rank } from '@element-plus/icons-vue';
import { ref, watch, nextTick } from 'vue';
import type { AdminResourceCategoryVo } from '@/api';
import { useSortableList } from '@/composables/useSortableList';

const props = defineProps<{
  categories: AdminResourceCategoryVo[];
  selectedId: number | null;
  loading?: boolean;
  updateSort: (id: number, sort: number) => Promise<void>;
}>();

const emit = defineEmits<{
  select: [id: number | null];
  add: [];
  edit: [cate: AdminResourceCategoryVo];
  delete: [cate: AdminResourceCategoryVo];
}>();

const sortableRef = ref<HTMLElement>();
const categoriesRef = ref(props.categories);

const { initSortable } = useSortableList(categoriesRef, props.updateSort);

watch(
  () => props.categories,
  (val) => {
    categoriesRef.value = val;
    nextTick(() => {
      if (sortableRef.value) {
        initSortable(sortableRef.value);
      }
    });
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.category-panel {
  min-height: 400px;

  :deep(.el-card__header) {
    padding: 12px 16px;
  }
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.category-list {
  margin: -4px 0;
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  transition: background-color 0.2s;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: var(--el-fill-color-light);
  }

  &.active {
    background-color: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  .category-left {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow: hidden;
  }

  .drag-handle {
    flex-shrink: 0;
    color: var(--el-text-color-placeholder);
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  .category-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .category-actions {
    display: none;
    flex-shrink: 0;
  }

  &:hover .category-actions {
    display: flex;
  }
}
</style>
