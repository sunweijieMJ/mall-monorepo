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
      <el-table-column label="操作" width="180" align="center">
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
    <AppDialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="40%"
      :confirm-loading="submitLoading"
      @confirm="handleDialogConfirm"
    >
      <el-form
        ref="adminFormRef"
        :model="admin"
        :rules="formRules"
        label-width="150px"
      >
        <el-form-item label="帐号：" prop="username">
          <el-input v-model="admin.username" style="width: 250px" />
        </el-form-item>
        <el-form-item label="姓名：">
          <el-input v-model="admin.nickName" style="width: 250px" />
        </el-form-item>
        <el-form-item label="邮箱：" prop="email">
          <el-input v-model="admin.email" style="width: 250px" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码：" prop="password">
          <el-input
            v-model="admin.password"
            type="password"
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item label="备注：">
          <el-input
            v-model="admin.note"
            type="textarea"
            :rows="5"
            style="width: 250px"
          />
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-radio-group v-model="admin.status">
            <el-radio :value="1">是</el-radio>
            <el-radio :value="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </AppDialog>

    <!-- 分配角色对话框 -->
    <AppDialog
      v-model="allocDialogVisible"
      title="分配角色"
      width="30%"
      :confirm-loading="allocLoading"
      @confirm="handleAllocDialogConfirm"
    >
      <el-select
        v-model="allocRoleIds"
        multiple
        placeholder="请选择"
        style="width: 80%"
      >
        <el-option
          v-for="item in allRoleList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
    </AppDialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { ref, reactive, computed, onMounted } from 'vue';
import type { AdminUserVo, AdminRoleVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useAdminUserStore } from '@/store/modules/adminUser';
import { useRoleStore } from '@/store/modules/role';

const adminUserStore = useAdminUserStore();
const roleStore = useRoleStore();

const adminFormRef = ref<FormInstance>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  keyword: null as string | null,
};

const defaultAdmin: Partial<AdminUserVo> & { password?: string } = {
  id: undefined,
  username: '',
  password: '',
  nickName: '',
  email: '',
  note: '',
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
  (q) => adminUserStore.getList(q),
  computed(() => adminUserStore.list),
  computed(() => adminUserStore.total),
);

const dialogVisible = ref(false);
const submitLoading = ref(false);
const admin = reactive<Partial<AdminUserVo> & { password?: string }>({
  ...defaultAdmin,
});
const isEdit = ref(false);

// 表单校验规则
const formRules = computed(() => ({
  username: [{ required: true, message: '请输入帐号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  password: isEdit.value
    ? []
    : [{ required: true, message: '请输入密码', trigger: 'blur' }],
}));

const allocDialogVisible = ref(false);
const allocLoading = ref(false);
const allocRoleIds = ref<number[]>([]);
const allRoleList = ref<AdminRoleVo[]>([]);
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
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(admin, defaultAdmin);
  adminFormRef.value?.clearValidate();
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

const handleUpdate = (_index: number, row: AdminUserVo) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(admin, row);
  adminFormRef.value?.clearValidate();
};

const handleDialogConfirm = async () => {
  const valid = await adminFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    if (isEdit.value) {
      await adminUserStore.update(admin.id!, admin as any);
      ElMessage.success('修改成功');
    } else {
      await adminUserStore.register(admin as any);
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

const handleAllocDialogConfirm = async () => {
  allocLoading.value = true;
  try {
    await adminUserStore.assignRoles(allocAdminId.value!, {
      roleIds: allocRoleIds.value,
    });
    ElMessage.success('分配成功');
    allocDialogVisible.value = false;
  } catch (error) {
    console.error('分配失败:', error);
    ElMessage.error('分配失败');
  } finally {
    allocLoading.value = false;
  }
};

const handleSelectRole = async (_index: number, row: AdminUserVo) => {
  allocAdminId.value = row.id;
  allocDialogVisible.value = true;
  await getRoleListByAdmin(row.id!);
};

const getAllRoleList = async () => {
  try {
    await roleStore.getAllList();
    allRoleList.value = roleStore.allRoles;
  } catch (error) {
    console.error('获取角色列表失败:', error);
  }
};

const getRoleListByAdmin = async (adminId: number) => {
  try {
    const allocRoleList = (await adminUserStore.getRoles(adminId)) as any;
    allocRoleIds.value = [];
    if (allocRoleList && allocRoleList.length > 0) {
      allocRoleIds.value = allocRoleList.map((item: any) => item.id!);
    }
  } catch (error) {
    console.error('获取管理员角色失败:', error);
  }
};

onMounted(() => {
  getList();
  getAllRoleList();
});
</script>

<style scoped lang="scss">
.input-width {
  width: 203px;
}
</style>
