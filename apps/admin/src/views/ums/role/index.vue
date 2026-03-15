<!--
  角色列表页面
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
            placeholder="角色名称"
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
      :page-sizes="[5, 10, 15]"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="角色名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="描述" align="center">
        <template #default="{ row }">{{ row.description }}</template>
      </el-table-column>
      <el-table-column label="用户数" width="100" align="center">
        <template #default="{ row }">{{ row.adminCount }}</template>
      </el-table-column>
      <el-table-column label="添加时间" width="160" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
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
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row, $index }">
          <el-button size="small" @click="handleSelectMenu(row)">
            分配菜单
          </el-button>
          <el-button size="small" @click="handleSelectResource(row)">
            分配资源
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
    <RoleFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @success="getList"
    />

    <!-- 分配菜单弹窗 -->
    <AllocMenuDialog v-model="allocMenuVisible" :role-id="currentRoleId" />

    <!-- 分配资源弹窗 -->
    <AllocResourceDialog
      v-model="allocResourceVisible"
      :role-id="currentRoleId"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import AllocMenuDialog from './components/AllocMenuDialog.vue';
import AllocResourceDialog from './components/AllocResourceDialog.vue';
import RoleFormDialog from './components/RoleFormDialog.vue';
import type { AdminRoleVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useRoleStore } from '@/store/modules/role';

const roleStore = useRoleStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
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
  (q) => roleStore.getList(q),
  computed(() => roleStore.list),
  computed(() => roleStore.total),
);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<AdminRoleVo> | null>(null);

const allocMenuVisible = ref(false);
const allocResourceVisible = ref(false);
const currentRoleId = ref(0);

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

const handleUpdate = (_index: number, row: AdminRoleVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const handleStatusChange = async (_index: number, row: AdminRoleVo) => {
  try {
    await ElMessageBox.confirm('是否要修改该状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await roleStore.updateStatus(row.id!, { status: row.status });
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

const handleDelete = async (_index: number, row: AdminRoleVo) => {
  try {
    await ElMessageBox.confirm('是否要删除该角色?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await roleStore.batchDelete([row.id!]);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleSelectMenu = (row: AdminRoleVo) => {
  currentRoleId.value = row.id!;
  allocMenuVisible.value = true;
};

const handleSelectResource = (row: AdminRoleVo) => {
  currentRoleId.value = row.id!;
  allocResourceVisible.value = true;
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
