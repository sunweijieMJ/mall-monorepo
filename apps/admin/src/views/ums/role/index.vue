<!--
  角色列表页面
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
              placeholder="角色名称"
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
        ref="roleTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
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
          <template #default="{ row }">{{
            formatDateTime(row.createTime)
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
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row, $index }">
            <el-row>
              <el-button @click="handleSelectMenu($index, row)">
                分配菜单
              </el-button>
              <el-button @click="handleSelectResource($index, row)">
                分配资源
              </el-button>
            </el-row>
            <el-row>
              <el-button @click="handleUpdate($index, row)"> 编辑 </el-button>
              <el-button @click="handleDelete($index, row)"> 删除 </el-button>
            </el-row>
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
        :page-sizes="[5, 10, 15]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '添加角色'"
      width="40%"
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
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确 定</el-button>
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
import { useRouter } from 'vue-router';
import { RoleService } from '@/api/modules';
import type { Role } from '@/interface';

const router = useRouter();
const roleTableRef = ref<InstanceType<typeof ElTable>>();
const roleFormRef = ref<FormInstance>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  keyword: null as string | null,
};

const defaultRole: Partial<Role> = {
  id: undefined,
  name: '',
  description: '',
  adminCount: 0,
  status: 1,
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<Role[]>([]);
const total = ref(0);
const listLoading = ref(false);
const dialogVisible = ref(false);
const role = reactive<Partial<Role>>({ ...defaultRole });
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
  Object.assign(role, defaultRole);
};

const handleStatusChange = async (_index: number, row: Role) => {
  try {
    await ElMessageBox.confirm('是否要修改该状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await RoleService.updateStatus(row.id!, { status: row.status });
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

const handleDelete = async (_index: number, row: Role) => {
  try {
    await ElMessageBox.confirm('是否要删除该角色?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await RoleService.deleteRole([row.id!]);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleUpdate = (_index: number, row: Role) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(role, row);
};

const handleDialogConfirm = async () => {
  try {
    await ElMessageBox.confirm('是否要确认?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (isEdit.value) {
      await RoleService.updateRole(role.id!, role as Role);
      ElMessage.success('修改成功');
    } else {
      await RoleService.createRole(role as Role);
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

const handleSelectMenu = (_index: number, row: Role) => {
  router.push({
    path: '/ums/allocMenu',
    query: { roleId: String(row.id) },
  });
};

const handleSelectResource = (_index: number, row: Role) => {
  router.push({
    path: '/ums/allocResource',
    query: { roleId: String(row.id) },
  });
};

const getList = async () => {
  listLoading.value = true;
  try {
    const response = await RoleService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

onMounted(() => {
  getList();
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
