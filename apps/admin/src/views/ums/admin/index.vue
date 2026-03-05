<!--
  管理员列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <el-icon><Search /></el-icon>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          type="primary"
          @click="handleSearchList"
        >
          查询搜索
        </el-button>
        <el-button
          style="margin-right: 15px; float: right"
          @click="handleResetSearch"
        >
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
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
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" style="margin-left: 20px" @click="handleAdd">
        添加
      </el-button>
    </el-card>

    <div class="table-container">
      <el-table
        ref="adminTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
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
          <template #default="{ row }">{{
            formatDateTime(row.createTime)
          }}</template>
        </el-table-column>
        <el-table-column label="最后登录" width="160" align="center">
          <template #default="{ row }">{{
            formatDateTime(row.loginTime)
          }}</template>
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
            <el-button @click="handleSelectRole($index, row)">
              分配角色
            </el-button>
            <el-button @click="handleUpdate($index, row)"> 编辑 </el-button>
            <el-button @click="handleDelete($index, row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.pageNum"
        v-model:page-size="listQuery.pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 15, 20]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="40%"
    >
      <el-form ref="adminFormRef" :model="admin" label-width="150px">
        <el-form-item label="帐号：">
          <el-input v-model="admin.username" style="width: 250px" />
        </el-form-item>
        <el-form-item label="姓名：">
          <el-input v-model="admin.nickName" style="width: 250px" />
        </el-form-item>
        <el-form-item label="邮箱：">
          <el-input v-model="admin.email" style="width: 250px" />
        </el-form-item>
        <el-form-item label="密码：">
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
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="allocDialogVisible" title="分配角色" width="30%">
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
      <template #footer>
        <el-button @click="allocDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleAllocDialogConfirm"
          >确 定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Tickets } from '@element-plus/icons-vue';
import {
  ElMessage,
  ElMessageBox,
  type ElTable,
  type FormInstance,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { AdminService, RoleService } from '@/api/modules';
import type { Admin, Role } from '@/interface';

const adminTableRef = ref<InstanceType<typeof ElTable>>();
const adminFormRef = ref<FormInstance>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  keyword: null as string | null,
};

const defaultAdmin: Partial<Admin> = {
  id: undefined,
  username: '',
  password: '',
  nickName: '',
  email: '',
  note: '',
  status: 1,
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<Admin[]>([]);
const total = ref(0);
const listLoading = ref(false);
const dialogVisible = ref(false);
const admin = reactive<Partial<Admin>>({ ...defaultAdmin });
const isEdit = ref(false);
const allocDialogVisible = ref(false);
const allocRoleIds = ref<number[]>([]);
const allRoleList = ref<Role[]>([]);
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

const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery);
};

const handleSearchList = () => {
  listQuery.pageNum = 1;
  getList();
};

const handleSizeChange = (val: number) => {
  listQuery.pageNum = 1;
  listQuery.pageSize = val;
  getList();
};

const handleCurrentChange = (val: number) => {
  listQuery.pageNum = val;
  getList();
};

const handleAdd = () => {
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(admin, defaultAdmin);
};

const handleStatusChange = async (_index: number, row: Admin) => {
  try {
    await ElMessageBox.confirm('是否要修改该状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await AdminService.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改状态失败:', error);
      row.status = row.status === 0 ? 1 : 0;
      ElMessage.error('修改失败');
    } else {
      await getList();
    }
  }
};

const handleDelete = async (_index: number, row: Admin) => {
  try {
    await ElMessageBox.confirm('是否要删除该用户?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await AdminService.deleteAdmin(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleUpdate = (_index: number, row: Admin) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(admin, row);
};

const handleDialogConfirm = async () => {
  try {
    await ElMessageBox.confirm('是否要确认?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (isEdit.value) {
      await AdminService.updateAdmin(admin.id!, admin as Admin);
      ElMessage.success('修改成功');
    } else {
      await AdminService.createAdmin(admin as Admin);
      ElMessage.success('添加成功');
    }

    dialogVisible.value = false;
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

const handleAllocDialogConfirm = async () => {
  try {
    await ElMessageBox.confirm('是否要确认?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await AdminService.allocRole({
      adminId: allocAdminId.value!,
      roleIds: allocRoleIds.value,
    });
    ElMessage.success('分配成功');
    allocDialogVisible.value = false;
  } catch (error) {
    if (error !== 'cancel') {
      console.error('分配失败:', error);
      ElMessage.error('分配失败');
    }
  }
};

const handleSelectRole = async (_index: number, row: Admin) => {
  allocAdminId.value = row.id;
  allocDialogVisible.value = true;
  await getRoleListByAdmin(row.id!);
};

const getList = async () => {
  listLoading.value = true;
  try {
    const response = await AdminService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

const getAllRoleList = async () => {
  try {
    const response = await RoleService.fetchAllRoleList();
    allRoleList.value = response.data;
  } catch (error) {
    console.error('获取角色列表失败:', error);
  }
};

const getRoleListByAdmin = async (adminId: number) => {
  try {
    const response = await AdminService.getRoleByAdmin(adminId);
    const allocRoleList = response.data;
    allocRoleIds.value = [];
    if (allocRoleList && allocRoleList.length > 0) {
      allocRoleIds.value = allocRoleList.map((item) => item.id!);
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
.filter-container {
  margin-bottom: 10px;

  .el-icon {
    margin-right: 5px;
    vertical-align: middle;
  }
}

.input-width {
  width: 203px;
}

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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
