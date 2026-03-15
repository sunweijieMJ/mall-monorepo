<!--
  管理员列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="输入搜索：">
          <el-input
            v-model="listQuery.keyword"
            class="input-width"
            placeholder="帐号/姓名"
            clearable
          />
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 数据列表 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAdd">添加</el-button>
    </OperateContainer>

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
      <el-table-column label="帐号" align="center">
        <template #default="{ row }">{{ row.username }}</template>
      </el-table-column>
      <el-table-column label="姓名" align="center">
        <template #default="{ row }">{{ row.nickName }}</template>
      </el-table-column>
      <el-table-column label="邮箱" align="center">
        <template #default="{ row }">{{ row.email }}</template>
      </el-table-column>
      <el-table-column label="添加时间" width="160" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="最后登录" width="160" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.loginTime) }}
        </template>
      </el-table-column>
      <el-table-column label="是否启用" width="140" align="center">
        <template #default="{ row, $index }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange($index, row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row, $index }">
          <el-button size="small" @click="handleSelectRole($index, row)">
            分配角色
          </el-button>
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
    <AdminFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @success="getList"
    />

    <!-- 分配角色对话框 -->
    <RoleAssignDialog
      v-model="allocDialogVisible"
      :admin-id="allocAdminId"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import AdminFormDialog from './components/AdminFormDialog.vue';
import RoleAssignDialog from './components/RoleAssignDialog.vue';
import type { AdminUserVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useAdminUserStore } from '@/store/modules/adminUser';

const adminUserStore = useAdminUserStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  keyword: null as string | null,
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
  (q) => adminUserStore.getList(q),
  computed(() => adminUserStore.list),
  computed(() => adminUserStore.total),
);

// 编辑弹窗
const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<AdminUserVo> | null>(null);

// 分配角色弹窗
const allocDialogVisible = ref(false);
const allocAdminId = ref<number>();

const formatDateTime = (time?: string) => {
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

const handleAdd = () => {
  isEdit.value = false;
  editData.value = null;
  dialogVisible.value = true;
};

const handleUpdate = (_index: number, row: AdminUserVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const handleSelectRole = (_index: number, row: AdminUserVo) => {
  allocAdminId.value = row.id;
  allocDialogVisible.value = true;
};

const handleStatusChange = async (_index: number, row: AdminUserVo) => {
  try {
    await ElMessageBox.confirm('是否要修改该状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await adminUserStore.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改状态失败:', error);
      row.status = (row.status === 0 ? 1 : 0) as any;
      ElMessage.error('修改失败');
    } else {
      await getList();
    }
  }
};

const handleDelete = async (_index: number, row: AdminUserVo) => {
  try {
    await ElMessageBox.confirm('是否要删除该用户?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await adminUserStore.deleteItem(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
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

<style scoped lang="scss">
.input-width {
  width: 203px;
}
</style>
