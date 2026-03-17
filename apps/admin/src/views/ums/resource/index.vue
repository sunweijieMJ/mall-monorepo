<!--
  资源列表页面 — 左侧分类面板（拖拽排序） + 右侧资源表格
-->
<template>
  <div class="app-container">
    <el-row :gutter="16">
      <!-- 左侧分类面板 -->
      <el-col :span="5">
        <CategoryPanel
          :categories="categoryList"
          :selected-id="selectedCategoryId"
          :loading="categoryLoading"
          :update-sort="updateCategorySort"
          @select="handleSelectCategory"
          @add="handleAddCategory"
          @edit="handleEditCategory"
          @delete="handleDeleteCategory"
        />
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
            <template #default="{ row }">
              <el-button link type="primary" @click="handleUpdate(row)">
                编辑
              </el-button>
              <el-button link type="danger" @click="handleDelete(row.id!)">
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
import { ref, computed, onMounted } from 'vue';
import CategoryFormDialog from './components/CategoryFormDialog.vue';
import CategoryPanel from './components/CategoryPanel.vue';
import ResourceFormDialog from './components/ResourceFormDialog.vue';
import type { AdminResourceVo, AdminResourceCategoryVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useResourceStore } from '@/store/modules/resource';
import { formatDateTime } from '@/utils/format';

const resourceStore = useResourceStore();

// 分类相关
const categoryList = ref<AdminResourceCategoryVo[]>([]);
const categoryLoading = ref(false);
const selectedCategoryId = ref<number | null>(null);
const categoryDialogVisible = ref(false);
const isCategoryEdit = ref(false);
const categoryEditData = ref<Partial<AdminResourceCategoryVo> | null>(null);

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

const updateCategorySort = async (id: number, sort: number) => {
  await resourceStore.updateCategory(id, { sort });
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
  const { handleDelete } = useDeleteConfirm(
    '分类',
    (id: number) => resourceStore.deleteCategory(id),
    refreshCategories,
  );
  await handleDelete(cate.id);
};

const refreshCategories = async () => {
  await getCategoryList();
  if (
    selectedCategoryId.value !== null &&
    !categoryList.value.some((c) => c.id === selectedCategoryId.value)
  ) {
    handleSelectCategory(null);
  }
};

// 资源操作
const handleAdd = () => {
  isEdit.value = false;
  editData.value = null;
  dialogVisible.value = true;
};

const handleUpdate = (row: AdminResourceVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const { handleDelete } = useDeleteConfirm(
  '资源',
  (id: number) => resourceStore.deleteItem(id),
  getList,
);

onMounted(async () => {
  await getCategoryList();
  getList();
});
</script>

<style scoped lang="scss">
.input-width {
  width: 203px;
}
</style>
