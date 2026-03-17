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
    <CategoryFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, onMounted } from 'vue';
import CategoryFormDialog from './components/CategoryFormDialog.vue';
import type { AdminResourceCategoryVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useResourceStore } from '@/store';
import { formatDate } from '@/utils/format';

const resourceStore = useResourceStore();

const list = ref<AdminResourceCategoryVo[]>([]);
const listLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<AdminResourceCategoryVo> | null>(null);

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
  isEdit.value = false;
  editData.value = null;
  dialogVisible.value = true;
};

const handleUpdate = (_index: number, row: AdminResourceCategoryVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
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

onMounted(() => {
  getList();
});
</script>
