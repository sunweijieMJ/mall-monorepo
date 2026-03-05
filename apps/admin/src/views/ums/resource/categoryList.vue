<!--
  资源分类列表页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAdd">添加</el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="resourceCategoryTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template #default="{ row }">{{
            formatDateTime(row.createTime)
          }}</template>
        </el-table-column>
        <el-table-column label="排序" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row, $index }">
            <el-button type="text" @click="handleUpdate($index, row)">
              编辑
            </el-button>
            <el-button type="text" @click="handleDelete($index, row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="40%"
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
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDialogConfirm"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Tickets } from '@element-plus/icons-vue';
import {
  ElMessage,
  ElMessageBox,
  type ElTable,
  type ElForm,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import ResourceCategoryService from '@/api/modules/resourceCategory';
import type { ResourceCategory } from '@/interface';
import { formatDate } from '@/utils/date';

const resourceCategoryTableRef = ref<InstanceType<typeof ElTable>>();
const resourceCategoryFormRef = ref<InstanceType<typeof ElForm>>();

const list = ref<ResourceCategory[]>([]);
const listLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);

const defaultResourceCategory = {
  name: '',
  sort: 0,
};

const resourceCategory = reactive<Partial<ResourceCategory>>({
  ...defaultResourceCategory,
});

// 格式化时间
const formatDateTime = (time?: string | number) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await ResourceCategoryService.listAllCate();
    list.value = response.data;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 添加
const handleAdd = () => {
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(resourceCategory, defaultResourceCategory);
};

// 编辑
const handleUpdate = (_index: number, row: ResourceCategory) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(resourceCategory, row);
};

// 删除
const handleDelete = async (_index: number, row: ResourceCategory) => {
  try {
    await ElMessageBox.confirm('是否要删除该分类?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ResourceCategoryService.deleteResourceCategory(row.id);
    ElMessage.success('删除成功');
    await getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 对话框确认
const handleDialogConfirm = async () => {
  try {
    await ElMessageBox.confirm('是否要确认?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (isEdit.value) {
      await ResourceCategoryService.updateResourceCategory(
        resourceCategory.id!,
        resourceCategory as ResourceCategory,
      );
      ElMessage.success('修改成功');
    } else {
      await ResourceCategoryService.createResourceCategory(
        resourceCategory as ResourceCategory,
      );
      ElMessage.success('添加成功');
    }

    dialogVisible.value = false;
    await getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.operate-container {
  margin-bottom: 10px;

  .btn-add {
    float: right;
  }

  .el-icon {
    margin-right: 5px;
    vertical-align: middle;
  }
}

.table-container {
  margin-bottom: 10px;
}
</style>
