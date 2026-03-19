<!--
  退货原因设置页面
  内联编辑对话框模式
-->
<template>
  <div class="app-container">
    <!-- 操作区 -->
    <OperateContainer>
      <template #left>
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
        <el-button type="primary" @click="handleBatchOperate">确定</el-button>
      </template>
      <el-button type="primary" @click="handleAdd">添加</el-button>
    </OperateContainer>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
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
          <template #default="{ row }">
            {{ formatCreateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row, $index }">
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
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import type { ReturnReasonVo } from '@/api';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useReturnReasonStore } from '@/store';

// 表格引用
const returnReasonStore = useReturnReasonStore();

// 默认查询参数
const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
};

// 默认退货原因
const defaultReturnReason: Partial<ReturnReasonVo> = {
  name: '',
  sort: 0,
  status: 1,
  createTime: '',
};

// 状态
const list = ref<ReturnReasonVo[]>([]);
const total = ref(0);
const multipleSelection = ref<ReturnReasonVo[]>([]);
const listLoading = ref(false);
const listQuery = reactive({ ...defaultListQuery });
const operateType = ref<number | null>(null);
const dialogVisible = ref(false);
const returnReason = reactive<Partial<ReturnReasonVo>>({
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
const handleSelectionChange = (val: ReturnReasonVo[]) => {
  multipleSelection.value = val;
};

// 状态变化
const handleStatusChange = async (_index: number, row: ReturnReasonVo) => {
  try {
    await returnReasonStore.updateStatus([row.id!], row.status!);
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改状态失败:', error);
    row.status = row.status === 0 ? 1 : 0;
    ElMessage.error('修改失败');
  }
};

// 编辑
const handleUpdate = async (_index: number, row: ReturnReasonVo) => {
  dialogVisible.value = true;
  operateReasonId.value = row.id!;
  try {
    const data = await returnReasonStore.getItem(row.id!);
    if (data) Object.assign(returnReason, data);
  } catch (error) {
    console.error('获取详情失败:', error);
  }
};

// 删除
const handleDelete = async (_index: number, row: ReturnReasonVo) => {
  try {
    await ElMessageBox.confirm('是否要删除该退货原因?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await returnReasonStore.batchDelete([row.id!]);
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
      await returnReasonStore.batchDelete(ids);
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
      await returnReasonStore.update(
        operateReasonId.value,
        returnReason as ReturnReasonVo,
      );
      ElMessage.success('修改成功');
    } else {
      // 添加
      await returnReasonStore.create(returnReason as ReturnReasonVo);
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
    await returnReasonStore.getList(listQuery);
    list.value = returnReasonStore.list;
    total.value = returnReasonStore.total;
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
.table-container {
  margin-bottom: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}

.input-width {
  width: 100%;
}
</style>
