<!--
  退货申请列表页面
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
          <el-form-item label="服务单号：">
            <el-input
              v-model="listQuery.id"
              class="input-width"
              placeholder="服务单号"
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
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
    </el-card>

    <div class="table-container">
      <el-table
        ref="applyTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column label="服务单号" width="180" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="申请时间" width="180" align="center">
          <template #default="{ row }">{{ row.createTime }}</template>
        </el-table-column>
        <el-table-column label="用户账号" align="center">
          <template #default="{ row }">{{ row.memberUsername }}</template>
        </el-table-column>
        <el-table-column label="退款金额" width="120" align="center">
          <template #default="{ row }">￥{{ row.returnAmount }}</template>
        </el-table-column>
        <el-table-column label="申请状态" width="120" align="center">
          <template #default="{ row }">{{ formatStatus(row.status) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row }">
            <el-button @click="handleViewDetail(row)"> 查看详情 </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { Search, Tickets } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ReturnApplyService } from '@/api/modules';
import type { ReturnApply } from '@/interface';

const router = useRouter();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  id: null as number | null,
  status: null as number | null,
  createTime: '',
  receiverKeyword: '',
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<ReturnApply[]>([]);
const total = ref(0);
const listLoading = ref(false);

const statusOptions = [
  { label: '待处理', value: 0 },
  { label: '退货中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已拒绝', value: 3 },
];

const formatStatus = (value?: number) => {
  const statusMap: Record<number, string> = {
    0: '待处理',
    1: '退货中',
    2: '已完成',
    3: '已拒绝',
  };
  return statusMap[value || 0] || '待处理';
};

const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery);
};

const handleSearchList = () => {
  listQuery.pageNum = 1;
  getList();
};

const handleViewDetail = (row: ReturnApply) => {
  router.push({
    path: '/mall/oms/apply/applyDetail',
    query: { id: String(row.id) },
  });
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

const getList = async () => {
  listLoading.value = true;
  try {
    const response = await ReturnApplyService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取退货申请列表失败:', error);
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
}
</style>
