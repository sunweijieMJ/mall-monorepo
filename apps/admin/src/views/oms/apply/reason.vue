<!--
  退货原因设置页面
  内联编辑对话框模式
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAdd"> 添加 </el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="returnReasonTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="编号" width="80" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="原因类型" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </el-table-column>
        <el-table-column label="是否可用" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($index, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="添加时间" width="180" align="center">
          <template #default="{ row }">{{
            formatCreateTime(row.createTime)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row, $index }">
            <el-button @click="handleUpdate($index, row)"> 编辑 </el-button>
            <el-button @click="handleDelete($index, row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        v-model="operateType"
        placeholder="批量操作"
        style="width: 200px"
      >
        <el-option
          v-for="item in operateOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        style="margin-left: 20px"
        type="primary"
        @click="handleBatchOperate"
      >
        确定
      </el-button>
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
    <el-dialog v-model="dialogVisible" title="退货原因" width="30%">
      <el-form ref="reasonFormRef" :model="returnReason" label-width="150px">
        <el-form-item label="原因类型：">
          <el-input v-model="returnReason.name" class="input-width" />
        </el-form-item>
        <el-form-item label="排序：">
          <el-input-number
            v-model="returnReason.sort"
            class="input-width"
            :min="0"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="是否启用：">
          <el-switch
            v-model="returnReason.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { ReturnReasonService } from '@/api/modules';
import type { ReturnReason } from '@/interface';

// 表格引用
const returnReasonTableRef = ref<InstanceType<typeof ElTable>>();

// 默认查询参数
const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
};

// 默认退货原因
const defaultReturnReason: Partial<ReturnReason> = {
  name: '',
  sort: 0,
  status: 1,
  createTime: '',
};

// 状态
const list = ref<ReturnReason[]>([]);
const total = ref(0);
const multipleSelection = ref<ReturnReason[]>([]);
const listLoading = ref(false);
const listQuery = reactive({ ...defaultListQuery });
const operateType = ref<number | null>(null);
const dialogVisible = ref(false);
const returnReason = reactive<Partial<ReturnReason>>({
  ...defaultReturnReason,
});
const operateReasonId = ref<number | null>(null);

// 操作选项
const operateOptions = [{ label: '删除', value: 1 }];

// 格式化时间
const formatCreateTime = (time?: string) => {
  if (!time) return '';
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

// 添加
const handleAdd = () => {
  dialogVisible.value = true;
  operateReasonId.value = null;
  Object.assign(returnReason, defaultReturnReason);
};

// 选择变化
const handleSelectionChange = (val: ReturnReason[]) => {
  multipleSelection.value = val;
};

// 状态变化
const handleStatusChange = async (_index: number, row: ReturnReason) => {
  try {
    await ReturnReasonService.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改状态失败:', error);
    row.status = row.status === 0 ? 1 : 0;
    ElMessage.error('修改失败');
  }
};

// 编辑
const handleUpdate = async (_index: number, row: ReturnReason) => {
  dialogVisible.value = true;
  operateReasonId.value = row.id!;
  try {
    const response = await ReturnReasonService.getReasonDetail(row.id!);
    Object.assign(returnReason, response.data);
  } catch (error) {
    console.error('获取详情失败:', error);
  }
};

// 删除
const handleDelete = async (_index: number, row: ReturnReason) => {
  try {
    await ElMessageBox.confirm('是否要删除该退货原因?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ReturnReasonService.deleteReason([row.id!]);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

// 批量操作
const handleBatchOperate = async () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }

  if (operateType.value === 1) {
    try {
      await ElMessageBox.confirm('是否要删除选中的退货原因?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      const ids = multipleSelection.value.map((item) => item.id!);
      await ReturnReasonService.deleteReason(ids);
      ElMessage.success('删除成功');
      await getList();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error);
      }
    }
  }
};

// 每页数量变化
const handleSizeChange = (val: number) => {
  listQuery.pageNum = 1;
  listQuery.pageSize = val;
  getList();
};

// 当前页变化
const handleCurrentChange = (val: number) => {
  listQuery.pageNum = val;
  getList();
};

// 确认添加/编辑
const handleConfirm = async () => {
  try {
    if (operateReasonId.value) {
      // 编辑
      await ReturnReasonService.updateReason(
        operateReasonId.value,
        returnReason as ReturnReason,
      );
      ElMessage.success('修改成功');
    } else {
      // 添加
      await ReturnReasonService.addReason(returnReason as ReturnReason);
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
    await getList();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await ReturnReasonService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 页面加载
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

.batch-operate-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.input-width {
  width: 100%;
}
</style>
