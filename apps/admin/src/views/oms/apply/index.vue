<!--
  退货申请列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="服务单号：">
          <el-input
            v-model="listQuery.id"
            class="input-width"
            placeholder="服务单号"
            clearable
          />
        </el-form-item>
        <el-form-item label="处理状态：">
          <el-select
            v-model="listQuery.status"
            class="input-width"
            placeholder="全部"
            clearable
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="申请时间：">
          <el-date-picker
            v-model="listQuery.createTime"
            class="input-width"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="请选择时间"
          />
        </el-form-item>
        <el-form-item label="用户账号：">
          <el-input
            v-model="listQuery.receiverKeyword"
            class="input-width"
            placeholder="用户账号"
            clearable
          />
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 数据列表 -->
    <OperateContainer />

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
      <el-table-column label="服务单号" width="180" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="申请时间" width="180" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="用户账号" align="center">
        <template #default="{ row }">{{ row.memberUsername }}</template>
      </el-table-column>
      <el-table-column label="退款金额" width="120" align="center">
        <template #default="{ row }">￥{{ row.returnAmount }}</template>
      </el-table-column>
      <el-table-column label="申请状态" width="120" align="center">
        <template #default="{ row }">
          <ApplyStatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="handleViewDetail(row)">
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </AppTable>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import ApplyStatusTag from './components/ApplyStatusTag.vue';
import type { ReturnApplyVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useReturnApplyStore } from '@/store';
import { formatDateTime } from '@/utils/format';

const router = useRouter();
const returnApplyStore = useReturnApplyStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  id: null as number | null,
  status: null as number | null,
  createTime: '',
  receiverKeyword: '',
};

const statusOptions = [
  { label: '待处理', value: 0 },
  { label: '退货中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已拒绝', value: 3 },
];

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
  (q) => returnApplyStore.getList(q),
  computed(() => returnApplyStore.list),
  computed(() => returnApplyStore.total),
);

const handleViewDetail = (row: ReturnApplyVo) => {
  router.push({
    path: '/oms/apply/applyDetail',
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
</style>
