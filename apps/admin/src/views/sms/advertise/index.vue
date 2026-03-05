<!--
  首页广告管理列表
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
          <el-form-item label="广告名称：">
            <el-input
              v-model="listQuery.name"
              class="input-width"
              placeholder="广告名称"
            />
          </el-form-item>
          <el-form-item label="广告位置：">
            <el-select
              v-model="listQuery.type"
              placeholder="全部"
              clearable
              class="input-width"
            >
              <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
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
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAdd"> 添加广告 </el-button>
    </el-card>

    <div class="table-container">
      <el-table
        ref="homeAdvertiseTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="编号" width="120" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="广告名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="广告位置" width="120" align="center">
          <template #default="{ row }">{{ formatType(row.type) }}</template>
        </el-table-column>
        <el-table-column label="广告图片" width="120" align="center">
          <template #default="{ row }">
            <img style="height: 80px" :src="row.pic" />
          </template>
        </el-table-column>
        <el-table-column label="时间" width="220" align="center">
          <template #default="{ row }">
            <p>开始时间：{{ formatTime(row.startTime) }}</p>
            <p>到期时间：{{ formatTime(row.endTime) }}</p>
          </template>
        </el-table-column>
        <el-table-column label="上线/下线" width="120" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleUpdateStatus($index, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="点击次数" width="120" align="center">
          <template #default="{ row }">{{ row.clickCount }}</template>
        </el-table-column>
        <el-table-column label="生成订单" width="120" align="center">
          <template #default="{ row }">{{ row.orderCount }}</template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
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
          v-for="item in operates"
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
  </div>
</template>

<script setup lang="ts">
import { Search, Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { HomeAdvertiseService } from '@/api/modules';
import type { HomeAdvertise } from '@/interface';

const router = useRouter();
const homeAdvertiseTableRef = ref<InstanceType<typeof ElTable>>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  name: null as string | null,
  type: null as number | null,
  endTime: null as string | null,
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<HomeAdvertise[]>([]);
const total = ref(0);
const multipleSelection = ref<HomeAdvertise[]>([]);
const listLoading = ref(false);

const typeOptions = [
  { label: 'PC首页轮播', value: 0 },
  { label: 'APP首页轮播', value: 1 },
];

const operates = [{ label: '删除', value: 0 }];

const operateType = ref<number | null>(null);

const formatType = (type?: number) => {
  return type === 1 ? 'APP首页轮播' : 'PC首页轮播';
};

const formatTime = (time?: string) => {
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

const handleSelectionChange = (val: HomeAdvertise[]) => {
  multipleSelection.value = val;
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

const handleUpdateStatus = async (_index: number, row: HomeAdvertise) => {
  try {
    await ElMessageBox.confirm('是否要修改上线/下线状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await HomeAdvertiseService.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
    await getList();
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

const handleDelete = async (_index: number, row: HomeAdvertise) => {
  try {
    await ElMessageBox.confirm('是否要删除该广告?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await HomeAdvertiseService.deleteHomeAdvertise([row.id!]);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleBatchOperate = async () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }

  const ids = multipleSelection.value.map((item) => item.id!);

  if (operateType.value === 0) {
    // 删除
    try {
      await ElMessageBox.confirm('是否要删除选中的广告?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });

      await HomeAdvertiseService.deleteHomeAdvertise(ids);
      ElMessage.success('删除成功');
      await getList();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error);
        ElMessage.error('删除失败');
      }
    }
  } else {
    ElMessage.warning('请选择批量操作类型');
  }
};

const handleAdd = () => {
  router.push({ path: '/mall/sms/advertise/add' });
};

const handleUpdate = (_index: number, row: HomeAdvertise) => {
  router.push({
    path: '/mall/sms/advertise/update',
    query: { id: String(row.id) },
  });
};

const getList = async () => {
  listLoading.value = true;
  try {
    const response = await HomeAdvertiseService.fetchList(listQuery);
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

.batch-operate-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
