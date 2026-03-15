<!--
  资源列表页面 — 左侧分类面板（拖拽排序） + 右侧资源表格
-->
<template>
  <div class="app-container">
    <el-row :gutter="16">
      <!-- 左侧分类面板 -->
      <el-col :span="5">
        <el-card shadow="never" class="category-panel">
          <template #header>
            <div class="category-header">
              <span>资源分类</span>
              <el-button type="primary" link @click="handleAddCategory">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>

          <div v-loading="categoryLoading" class="category-list">
            <div
              class="category-item"
              :class="{ active: selectedCategoryId === null }"
              @click="handleSelectCategory(null)"
            >
              <span>全部</span>
            </div>
            <div ref="sortableRef" class="sortable-wrapper">
              <div
                v-for="cate in categoryList"
                :key="cate.id"
                class="category-item"
                :class="{ active: selectedCategoryId === cate.id }"
                :data-id="cate.id"
                @click="handleSelectCategory(cate.id)"
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
                    @click="handleEditCategory(cate)"
                  >
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="handleDeleteCategory(cate)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧资源表格 -->
      <el-col :span="19">
        <!-- 筛选搜索 -->
        <FilterContainer @search="handleSearch" @reset="handleReset">
          <el-form :inline="true" :model="listQuery" label-width="100px">
            <el-form-item label="资源名称：">
              <el-input
                v-model="listQuery.nameKeyword"
                class="input-width"
                placeholder="资源名称"
                clearable
              />
            </el-form-item>
            <el-form-item label="资源路径：">
              <el-input
                v-model="listQuery.urlKeyword"
                class="input-width"
                placeholder="资源路径"
                clearable
              />
            </el-form-item>
          </el-form>
        </FilterContainer>

        <!-- 操作按钮 -->
        <OperateContainer>
          <el-button type="primary" @click="handleAdd">添加</el-button>
        </OperateContainer>

        <!-- 数据列表 -->
        <AppTable
          v-model:current-page="listQuery.pageNum"
          v-model:page-size="listQuery.pageSize"
          :data="list"
          :loading="loading"
          :total="total"
          @size-change="handleSizeChange"
          @page-change="handlePageChange"
        >
          <el-table-column label="编号" width="100" align="center">
            <template #default="{ row }">{{ row.id }}</template>
          </el-table-column>
          <el-table-column label="资源名称" align="center">
            <template #default="{ row }">{{ row.name }}</template>
          </el-table-column>
          <el-table-column label="资源路径" align="center">
            <template #default="{ row }">{{ row.url }}</template>
          </el-table-column>
          <el-table-column label="描述" align="center">
            <template #default="{ row }">{{ row.description }}</template>
          </el-table-column>
          <el-table-column label="添加时间" width="160" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="160"
            align="center"
            fixed="right"
          >
            <template #default="{ row, $index }">
              <el-button link type="primary" @click="handleUpdate($index, row)">
                编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete($index, row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </AppTable>
      </el-col>
    </el-row>

    <!-- 资源添加/编辑对话框 -->
    <ResourceFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      :category-options="categoryOptions"
      :default-category-id="defaultCategoryId"
      @success="getList"
    />

    <!-- 分类添加/编辑对话框 -->
    <CategoryFormDialog
      v-model="categoryDialogVisible"
      :is-edit="isCategoryEdit"
      :edit-data="categoryEditData"
      @success="refreshCategories"
    />
  </div>
</template>

<script setup lang="ts">
import { Delete, Edit, Plus, Rank } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Sortable from 'sortablejs';
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import CategoryFormDialog from './components/CategoryFormDialog.vue';
import ResourceFormDialog from './components/ResourceFormDialog.vue';
import type { AdminResourceVo, AdminResourceCategoryVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useResourceStore } from '@/store/modules/resource';

const resourceStore = useResourceStore();

// 分类相关
const categoryList = ref<AdminResourceCategoryVo[]>([]);
const categoryLoading = ref(false);
const selectedCategoryId = ref<number | null>(null);
const categoryDialogVisible = ref(false);
const isCategoryEdit = ref(false);
const categoryEditData = ref<Partial<AdminResourceCategoryVo> | null>(null);
const sortableRef = ref<HTMLElement>();

// 资源列表
const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  nameKeyword: null as string | null,
  urlKeyword: null as string | null,
  categoryId: null as number | null,
};

const {
  listQuery,
  loading,
  list,
  total,
  getList,
  handleSearch,
  handleReset,
  handleSizeChange,
  handlePageChange,
} = useListPage(
  defaultListQuery,
  (q) => resourceStore.getList(q),
  computed(() => resourceStore.list),
  computed(() => resourceStore.total),
);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<AdminResourceVo> | null>(null);

const categoryOptions = computed(() =>
  categoryList.value.map((cate) => ({
    label: cate.name,
    value: cate.id,
  })),
);

const defaultCategoryId = computed(() =>
  categoryList.value.length > 0 ? categoryList.value[0].id : null,
);

const formatDateTime = (time?: string | number) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// 初始化拖拽排序
let sortableInstance: Sortable | null = null;

const initSortable = () => {
  if (!sortableRef.value) return;
  // 销毁旧实例，避免重复绑定事件
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
  sortableInstance = Sortable.create(sortableRef.value, {
    handle: '.drag-handle',
    animation: 200,
    onEnd: async (evt) => {
      if (evt.oldIndex === evt.newIndex) return;

      const oldIndex = evt.oldIndex!;
      const newIndex = evt.newIndex!;

      // 更新本地列表顺序
      const movedItem = categoryList.value.splice(oldIndex, 1)[0];
      categoryList.value.splice(newIndex, 0, movedItem);

      // 只更新受影响区间内的 sort 值
      const start = Math.min(oldIndex, newIndex);
      const end = Math.max(oldIndex, newIndex);
      try {
        const promises = categoryList.value
          .slice(start, end + 1)
          .map((cate, i) =>
            resourceStore.updateCategory(cate.id, { sort: start + i }),
          );
        await Promise.all(promises);
        ElMessage.success('排序已更新');
      } catch (error) {
        console.error('排序更新失败:', error);
        ElMessage.error('排序更新失败');
        await getCategoryList();
      }
    },
  });
};

// 分类操作
const getCategoryList = async () => {
  categoryLoading.value = true;
  try {
    await resourceStore.getAllCategories();
    categoryList.value = resourceStore.allCategories;
  } catch (error) {
    console.error('获取分类列表失败:', error);
  } finally {
    categoryLoading.value = false;
  }
};

const handleSelectCategory = (id: number | null) => {
  selectedCategoryId.value = id;
  listQuery.categoryId = id;
  listQuery.pageNum = 1;
  getList();
};

const handleAddCategory = () => {
  isCategoryEdit.value = false;
  categoryEditData.value = null;
  categoryDialogVisible.value = true;
};

const handleEditCategory = (cate: AdminResourceCategoryVo) => {
  isCategoryEdit.value = true;
  categoryEditData.value = cate;
  categoryDialogVisible.value = true;
};

const handleDeleteCategory = async (cate: AdminResourceCategoryVo) => {
  try {
    await ElMessageBox.confirm('是否要删除该分类?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await resourceStore.deleteCategory(cate.id);
    ElMessage.success('删除成功');
    await refreshCategories();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const refreshCategories = async () => {
  await getCategoryList();
  if (
    selectedCategoryId.value !== null &&
    !categoryList.value.some((c) => c.id === selectedCategoryId.value)
  ) {
    handleSelectCategory(null);
  }
  await nextTick();
  initSortable();
};

// 资源操作
const handleAdd = () => {
  isEdit.value = false;
  editData.value = null;
  dialogVisible.value = true;
};

const handleUpdate = (_index: number, row: AdminResourceVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const handleDelete = async (_index: number, row: AdminResourceVo) => {
  try {
    await ElMessageBox.confirm('是否要删除该资源?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await resourceStore.deleteItem(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

onMounted(async () => {
  await getCategoryList();
  getList();
  await nextTick();
  initSortable();
});

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy();
    sortableInstance = null;
  }
});
</script>

<style scoped lang="scss">
.input-width {
  width: 203px;
}

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
