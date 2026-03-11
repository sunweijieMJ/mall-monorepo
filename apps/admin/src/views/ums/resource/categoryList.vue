<!--
  资源分类列表页面
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAdd">添加</el-button>
    </OperateContainer>

    <!-- 数据列表 -->
    <AppTable :data="list" :loading="listLoading">
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="排序" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center">
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
      :title="isEdit ? '编辑分类' : '添加分类'"
      :confirm-loading="submitLoading"
      @confirm="handleDialogConfirm"
    >
      <el-form
        ref="resourceCategoryFormRef"
        :model="resourceCategory"
        label-width="150px"
      >
        <el-form-item label="名称：">
          <el-input v-model="resourceCategory.name" style="width: 250px" />
        </el-form-item>
        <el-form-item label="排序：">
          <el-input
            v-model.number="resourceCategory.sort"
            style="width: 250px"
          />
        </el-form-item>
      </el-form>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type ElForm } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import type { AdminResourceCategoryVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import AppTable from '@/components/List/AppTable.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useResourceStore } from '@/store';
import { formatDate } from '@/utils/date';

const resourceCategoryFormRef = ref<InstanceType<typeof ElForm>>();
const resourceStore = useResourceStore();

const list = ref<AdminResourceCategoryVo[]>([]);
const listLoading = ref(false);
const dialogVisible = ref(false);
const submitLoading = ref(false);
const isEdit = ref(false);

const defaultResourceCategory = {
  name: '',
  sort: 0,
};

const resourceCategory = reactive<Partial<AdminResourceCategoryVo>>({
  ...defaultResourceCategory,
});

const formatDateTime = (time?: string | number) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
};

const getList = async () => {
  listLoading.value = true;
  try {
    await resourceStore.getAllCategories();
    list.value = resourceStore.allCategories;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

const handleAdd = () => {
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(resourceCategory, defaultResourceCategory);
};

const handleUpdate = (_index: number, row: AdminResourceCategoryVo) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(resourceCategory, row);
};

const handleDelete = async (_index: number, row: AdminResourceCategoryVo) => {
  try {
    await ElMessageBox.confirm('是否要删除该分类?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await resourceStore.deleteCategory(row.id);
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
      await resourceStore.updateCategory(
        resourceCategory.id!,
        resourceCategory,
      );
      ElMessage.success('修改成功');
    } else {
      await resourceStore.createCategory(resourceCategory);
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

onMounted(() => {
  getList();
});
</script>
