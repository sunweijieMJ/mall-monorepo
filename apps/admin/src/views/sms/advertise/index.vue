<!--
  首页广告管理列表
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="广告名称：">
          <el-input
            v-model="listQuery.name"
            class="input-width"
            placeholder="广告名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="广告位置：">
          <el-select
            v-model="listQuery.type"
            placeholder="全部"
            clearable
            class="input-width"
          >
            <el-option label="PC首页轮播" :value="0" />
            <el-option label="APP首页轮播" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期时间：">
          <el-date-picker
            v-model="listQuery.endTime"
            class="input-width"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="请选择时间"
          />
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 数据列表 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAdd">添加广告</el-button>
    </OperateContainer>

    <AppTable
      v-model:current-page="listQuery.pageNum"
      v-model:page-size="listQuery.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      :page-sizes="[5, 10, 15]"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="广告名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="广告位置" width="120" align="center">
        <template #default="{ row }">
          {{ row.type === 1 ? 'APP首页轮播' : 'PC首页轮播' }}
        </template>
      </el-table-column>
      <el-table-column label="广告图片" width="120" align="center">
        <template #default="{ row }">
          <img style="height: 80px" :src="row.pic" />
        </template>
      </el-table-column>
      <el-table-column label="时间" width="220" align="center">
        <template #default="{ row }">
          <p>开始时间：{{ formatDateTime(row.startTime) }}</p>
          <p>到期时间：{{ formatDateTime(row.endTime) }}</p>
        </template>
      </el-table-column>
      <el-table-column label="上线/下线" width="120" align="center">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            @update:model-value="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="点击次数" width="100" align="center">
        <template #default="{ row }">{{ row.clickCount }}</template>
      </el-table-column>
      <el-table-column label="生成订单" width="100" align="center">
        <template #default="{ row }">{{ row.orderCount }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id!)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </AppTable>

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        v-model="operateType"
        placeholder="批量操作"
        style="width: 200px"
      >
        <el-option label="删除" :value="0" />
      </el-select>
      <el-button
        style="margin-left: 20px"
        type="primary"
        @click="handleBatchOperate"
      >
        确定
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { HomeAdvertiseVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import StatusSwitch from '@/components/StatusSwitch.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useAdvertiseStore } from '@/store';
import { formatDateTime } from '@/utils/format';

const router = useRouter();
const advertiseStore = useAdvertiseStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  name: null as string | null,
  type: null as number | null,
  endTime: null as string | null,
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
  (q) => advertiseStore.getList(q),
  computed(() => advertiseStore.list),
  computed(() => advertiseStore.total),
);

// 批量选择
const multipleSelection = ref<HomeAdvertiseVo[]>([]);
const operateType = ref<number | null>(null);

const handleSelectionChange = (val: HomeAdvertiseVo[]) => {
  multipleSelection.value = val;
};

// 状态切换
const handleStatusChange = async (row: HomeAdvertiseVo) => {
  const originalStatus = row.status === 1 ? 0 : 1;
  try {
    await advertiseStore.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改状态失败:', error);
    row.status = originalStatus;
    ElMessage.error('修改失败');
  }
};

// 删除
const { handleDelete } = useDeleteConfirm(
  '广告',
  (id: number) => advertiseStore.batchDelete([id]),
  getList,
);

// 批量操作
const handleBatchOperate = async () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }
  if (operateType.value !== 0) {
    ElMessage.warning('请选择批量操作类型');
    return;
  }

  const ids = multipleSelection.value.map((item) => item.id!);

  try {
    await ElMessageBox.confirm('是否要删除选中的广告?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await advertiseStore.batchDelete(ids);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleAdd = () => {
  router.push({ path: '/mall/sms/advertise/add' });
};

const handleUpdate = (row: HomeAdvertiseVo) => {
  router.push({
    path: '/mall/sms/advertise/update',
    query: { id: String(row.id) },
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

.batch-operate-container {
  margin: 16px 0;
}
</style>
