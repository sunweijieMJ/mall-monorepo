<!--
  优惠券列表页面
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
          <el-form-item label="优惠券名称：">
            <el-input
              v-model="listQuery.name"
              class="input-width"
              placeholder="优惠券名称"
            />
          </el-form-item>
          <el-form-item label="优惠券类型：">
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
        </el-form>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAdd"> 添加 </el-button>
    </el-card>

    <div class="table-container">
      <el-table
        ref="couponTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="优惠劵名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="优惠券类型" width="100" align="center">
          <template #default="{ row }">{{ formatType(row.type) }}</template>
        </el-table-column>
        <el-table-column label="可使用商品" width="100" align="center">
          <template #default="{ row }">{{
            formatUseType(row.useType)
          }}</template>
        </el-table-column>
        <el-table-column label="使用门槛" width="140" align="center">
          <template #default="{ row }">满{{ row.minPoint }}元可用</template>
        </el-table-column>
        <el-table-column label="面值" width="100" align="center">
          <template #default="{ row }">{{ row.amount }}元</template>
        </el-table-column>
        <el-table-column label="适用平台" width="100" align="center">
          <template #default="{ row }">{{
            formatPlatform(row.platform)
          }}</template>
        </el-table-column>
        <el-table-column label="有效期" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.startTime) }}至{{ formatDate(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">{{
            formatStatus(row.endTime)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row, $index }">
            <el-button @click="handleView($index, row)"> 查看 </el-button>
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
  </div>
</template>

<script setup lang="ts">
import { Search, Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CouponService } from '@/api/modules';
import type { Coupon } from '@/interface';

const router = useRouter();
const couponTableRef = ref<InstanceType<typeof ElTable>>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  name: null as string | null,
  type: null as number | null,
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<Coupon[]>([]);
const total = ref(0);
const multipleSelection = ref<Coupon[]>([]);
const listLoading = ref(false);

const typeOptions = [
  { label: '全场赠券', value: 0 },
  { label: '会员赠券', value: 1 },
  { label: '购物赠券', value: 2 },
  { label: '注册赠券', value: 3 },
];

const formatType = (type?: number) => {
  const option = typeOptions.find((item) => item.value === type);
  return option?.label || '';
};

const formatUseType = (useType?: number) => {
  if (useType === 0) return '全场通用';
  else if (useType === 1) return '指定分类';
  return '指定商品';
};

const formatPlatform = (platform?: number) => {
  if (platform === 1) return '移动平台';
  else if (platform === 2) return 'PC平台';
  return '全平台';
};

const formatDate = (time?: string) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return date.toLocaleDateString('zh-CN');
};

const formatStatus = (endTime?: string) => {
  if (!endTime) return '未知';
  const now = new Date().getTime();
  const endDate = new Date(endTime).getTime();
  return endDate > now ? '未过期' : '已过期';
};

const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery);
};

const handleSearchList = () => {
  listQuery.pageNum = 1;
  getList();
};

const handleSelectionChange = (val: Coupon[]) => {
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

const handleAdd = () => {
  router.push({ path: '/mall/sms/coupon/add' });
};

const handleView = (_index: number, row: Coupon) => {
  router.push({
    path: '/mall/sms/coupon/history',
    query: { id: String(row.id) },
  });
};

const handleUpdate = (_index: number, row: Coupon) => {
  router.push({
    path: '/mall/sms/coupon/update',
    query: { id: String(row.id) },
  });
};

const handleDelete = async (_index: number, row: Coupon) => {
  try {
    await ElMessageBox.confirm('是否进行删除操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await CouponService.deleteCoupon(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const getList = async () => {
  listLoading.value = true;
  try {
    const response = await CouponService.fetchList(listQuery);
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
