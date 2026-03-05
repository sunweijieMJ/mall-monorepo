<!--
  秒杀时间段列表页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <el-card shadow="never" class="operate-container">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAdd">添加</el-button>
    </el-card>

    <div class="table-container">
      <el-table
        ref="flashSessionTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="秒杀时间段名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="每日开始时间" align="center">
          <template #default="{ row }">{{
            formatTime(row.startTime)
          }}</template>
        </el-table-column>
        <el-table-column label="每日结束时间" align="center">
          <template #default="{ row }">{{ formatTime(row.endTime) }}</template>
        </el-table-column>
        <el-table-column label="启用" align="center">
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
      :title="isEdit ? '编辑时间段' : '添加时间段'"
      width="40%"
    >
      <el-form
        ref="flashSessionFormRef"
        :model="flashSession"
        label-width="150px"
      >
        <el-form-item label="秒杀时间段名称：">
          <el-input v-model="flashSession.name" style="width: 250px" />
        </el-form-item>
        <el-form-item label="每日开始时间：">
          <el-time-picker
            v-model="flashSession.startTime"
            placeholder="请选择时间"
          />
        </el-form-item>
        <el-form-item label="每日结束时间：">
          <el-time-picker
            v-model="flashSession.endTime"
            placeholder="请选择时间"
          />
        </el-form-item>
        <el-form-item label="是否启用">
          <el-radio-group v-model="flashSession.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">不启用</el-radio>
          </el-radio-group>
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
import { FlashSessionService } from '@/api/modules';
import type { FlashSession } from '@/interface';
import { formatDate } from '@/utils/date';

const flashSessionTableRef = ref<InstanceType<typeof ElTable>>();
const flashSessionFormRef = ref<InstanceType<typeof ElForm>>();

const list = ref<FlashSession[]>([]);
const listLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);

const defaultFlashSession = {
  name: '',
  startTime: null as Date | null,
  endTime: null as Date | null,
  status: 0,
};

const flashSession = reactive<Partial<FlashSession>>({
  ...defaultFlashSession,
});

// 格式化时间
const formatTime = (time?: string | number) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDate(date, 'hh:mm:ss');
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await FlashSessionService.fetchList({});
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
  Object.assign(flashSession, defaultFlashSession);
};

// 状态切换
const handleStatusChange = async (_index: number, row: FlashSession) => {
  try {
    await ElMessageBox.confirm('是否要修改该状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await FlashSessionService.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('修改失败:', error);
      ElMessage.error('修改失败');
    }
    // 恢复原状态
    await getList();
  }
};

// 编辑
const handleUpdate = (_index: number, row: FlashSession) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(flashSession, row);
  flashSession.startTime = new Date(row.startTime!);
  flashSession.endTime = new Date(row.endTime!);
};

// 删除
const handleDelete = async (_index: number, row: FlashSession) => {
  try {
    await ElMessageBox.confirm('是否要删除该时间段?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await FlashSessionService.deleteSession(row.id!);
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
      await FlashSessionService.updateSession(
        flashSession.id!,
        flashSession as FlashSession,
      );
      ElMessage.success('修改成功');
    } else {
      await FlashSessionService.createSession(flashSession as FlashSession);
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
