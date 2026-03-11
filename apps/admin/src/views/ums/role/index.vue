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
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row, $index }">
          <el-button size="small" @click="handleSelectMenu($index, row)">
            分配菜单
          </el-button>
          <el-button size="small" @click="handleSelectResource($index, row)">
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
    <AppDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '添加角色'"
      width="40%"
      :confirm-loading="submitLoading"
      @confirm="handleDialogConfirm"
    >
      <el-form ref="roleFormRef" :model="role" label-width="150px">
        <el-form-item label="角色名称：">
          <el-input v-model="role.name" style="width: 250px" />
        </el-form-item>
        <el-form-item label="描述：">
          <el-input
            v-model="role.description"
            type="textarea"
            :rows="5"
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="role.status">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { AdminRoleVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useRoleStore } from '@/store/modules/role';

const router = useRouter();
const roleStore = useRoleStore();
const roleFormRef = ref<FormInstance>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  keyword: null as string | null,
};

const defaultRole: Partial<AdminRoleVo> = {
  id: undefined,
  name: '',
  description: '',
  adminCount: 0,
  status: 1 as any,
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
const submitLoading = ref(false);
const role = reactive<Partial<AdminRoleVo>>({ ...defaultRole });
const isEdit = ref(false);

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
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(role, defaultRole);
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

const handleUpdate = (_index: number, row: AdminRoleVo) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(role, row);
};

const handleDialogConfirm = async () => {
  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await roleStore.update(role.id!, role as any);
      ElMessage.success('修改成功');
    } else {
      await roleStore.create(role as any);
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
    await getList();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleSelectMenu = (_index: number, row: AdminRoleVo) => {
  router.push({
    path: '/ums/allocMenu',
    query: { roleId: String(row.id) },
  });
};

const handleSelectResource = (_index: number, row: AdminRoleVo) => {
  router.push({
    path: '/ums/allocResource',
    query: { roleId: String(row.id) },
  });
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
