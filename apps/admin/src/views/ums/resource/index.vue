<!--
  资源列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
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
        <el-form-item label="资源分类：">
          <el-select
            v-model="listQuery.categoryId"
            placeholder="全部"
            clearable
            class="input-width"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 操作按钮 -->
    <OperateContainer>
      <el-button @click="handleShowCategory">资源分类</el-button>
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
      <el-table-column label="操作" width="140" align="center">
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

    <!-- 添加/编辑对话框 -->
    <AppDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑资源' : '添加资源'"
      :confirm-loading="submitLoading"
      @confirm="handleDialogConfirm"
    >
      <el-form ref="resourceFormRef" :model="resource" label-width="150px">
        <el-form-item label="资源名称：">
          <el-input v-model="resource.name" style="width: 250px" />
        </el-form-item>
        <el-form-item label="资源路径：">
          <el-input v-model="resource.url" style="width: 250px" />
        </el-form-item>
        <el-form-item label="资源分类：">
          <el-select
            v-model="resource.categoryId"
            placeholder="全部"
            clearable
            style="width: 250px"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input
            v-model="resource.description"
            type="textarea"
            :rows="5"
            style="width: 250px"
          />
        </el-form-item>
      </el-form>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type ElForm } from 'element-plus';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { AdminResourceVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useResourceStore } from '@/store/modules/resource';

const router = useRouter();
const resourceStore = useResourceStore();
const resourceFormRef = ref<InstanceType<typeof ElForm>>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  nameKeyword: null as string | null,
  urlKeyword: null as string | null,
  categoryId: null as number | null,
};

const defaultResource = {
  id: null,
  name: '',
  url: '',
  categoryId: null as number | null,
  description: '',
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
const submitLoading = ref(false);
const resource = reactive<Partial<AdminResourceVo>>({ ...defaultResource });
const isEdit = ref(false);
const categoryOptions = ref<Array<{ label: string; value: number }>>([]);
const defaultCategoryId = ref<number | null>(null);

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

const getCateList = async () => {
  try {
    await resourceStore.getAllCategories();
    const cateList = resourceStore.allCategories;
    categoryOptions.value = cateList.map((cate: any) => ({
      label: cate.name,
      value: cate.id,
    }));
    if (cateList.length > 0) {
      defaultCategoryId.value = cateList[0].id;
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

const handleAdd = () => {
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(resource, defaultResource);
  resource.categoryId = defaultCategoryId.value;
};

const handleUpdate = (_index: number, row: AdminResourceVo) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(resource, row);
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

const handleDialogConfirm = async () => {
  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await resourceStore.update(resource.id!, resource as any);
      ElMessage.success('修改成功');
    } else {
      await resourceStore.create(resource as any);
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
    await getList();
  } catch (error: any) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleShowCategory = () => {
  router.push({ path: '/ums/resourceCategory' });
};

onMounted(() => {
  getList();
  getCateList();
});
</script>

<style scoped lang="scss">
.input-width {
  width: 203px;
}
</style>
