<!--
  优惠券领取历史页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <!-- 优惠券信息卡片 -->
    <div class="table-layout">
      <el-row>
        <el-col :span="4" class="table-cell-title">名称</el-col>
        <el-col :span="4" class="table-cell-title">优惠券类型</el-col>
        <el-col :span="4" class="table-cell-title">可使用商品</el-col>
        <el-col :span="4" class="table-cell-title">使用门槛</el-col>
        <el-col :span="4" class="table-cell-title">面值</el-col>
        <el-col :span="4" class="table-cell-title">状态</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="table-cell">{{ coupon.name }}</el-col>
        <el-col :span="4" class="table-cell">{{
          formatType(coupon.type)
        }}</el-col>
        <el-col :span="4" class="table-cell">{{
          formatUseType(coupon.useType)
        }}</el-col>
        <el-col :span="4" class="table-cell"
          >满{{ coupon.minPoint }}元可用</el-col
        >
        <el-col :span="4" class="table-cell">{{ coupon.amount }}元</el-col>
        <el-col :span="4" class="table-cell">{{
          formatStatus(coupon.endTime)
        }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="table-cell-title">有效期</el-col>
        <el-col :span="4" class="table-cell-title">总发行量</el-col>
        <el-col :span="4" class="table-cell-title">已领取</el-col>
        <el-col :span="4" class="table-cell-title">待领取</el-col>
        <el-col :span="4" class="table-cell-title">已使用</el-col>
        <el-col :span="4" class="table-cell-title">未使用</el-col>
      </el-row>
      <el-row>
        <el-col :span="4" class="table-cell" style="font-size: 13px">
          {{ formatDate(coupon.startTime) }}至{{ formatDate(coupon.endTime) }}
        </el-col>
        <el-col :span="4" class="table-cell">{{ coupon.publishCount }}</el-col>
        <el-col :span="4" class="table-cell">{{ coupon.receiveCount }}</el-col>
        <el-col :span="4" class="table-cell">{{
          (coupon.publishCount || 0) - (coupon.receiveCount || 0)
        }}</el-col>
        <el-col :span="4" class="table-cell">{{ coupon.useCount }}</el-col>
        <el-col :span="4" class="table-cell">{{
          (coupon.publishCount || 0) - (coupon.useCount || 0)
        }}</el-col>
      </el-row>
    </div>

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
          <el-form-item label="使用状态：">
            <el-select
              v-model="listQuery.useStatus"
              placeholder="全部"
              clearable
              class="input-width"
            >
              <el-option
                v-for="item in useTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="订单编号：">
            <el-input
              v-model="listQuery.orderSn"
              class="input-width"
              placeholder="订单编号"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="couponHistoryTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column label="优惠码" width="160" align="center">
          <template #default="{ row }">{{ row.couponCode }}</template>
        </el-table-column>
        <el-table-column label="领取会员" width="140" align="center">
          <template #default="{ row }">{{ row.memberNickname }}</template>
        </el-table-column>
        <el-table-column label="领取方式" width="100" align="center">
          <template #default="{ row }">{{
            formatGetType(row.getType)
          }}</template>
        </el-table-column>
        <el-table-column label="领取时间" width="160" align="center">
          <template #default="{ row }">{{
            formatTime(row.createTime)
          }}</template>
        </el-table-column>
        <el-table-column label="当前状态" width="140" align="center">
          <template #default="{ row }">{{
            formatCouponHistoryUseType(row.useStatus)
          }}</template>
        </el-table-column>
        <el-table-column label="使用时间" width="160" align="center">
          <template #default="{ row }">{{ formatTime(row.useTime) }}</template>
        </el-table-column>
        <el-table-column label="订单编号" align="center">
          <template #default="{ row }">{{
            row.orderSn === null ? 'N/A' : row.orderSn
          }}</template>
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
import { Search } from '@element-plus/icons-vue';
import { ElMessage, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { CouponService, CouponHistoryService } from '@/api/modules';
import type { Coupon, CouponHistory } from '@/interface';
import { formatDate as formatDateUtil } from '@/utils/date';

const route = useRoute();
const couponHistoryTableRef = ref<InstanceType<typeof ElTable>>();

// 优惠券类型选项
const typeOptions = [
  { label: '全场赠券', value: 0 },
  { label: '会员赠券', value: 1 },
  { label: '购物赠券', value: 2 },
  { label: '注册赠券', value: 3 },
];

// 使用状态选项
const useTypeOptions = [
  { label: '未使用', value: 0 },
  { label: '已使用', value: 1 },
  { label: '已过期', value: 2 },
];

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  useStatus: null as number | null,
  orderSn: null as string | null,
  couponId: null as number | null,
};

const coupon = ref<Partial<Coupon>>({});
const listQuery = reactive({ ...defaultListQuery });
const list = ref<CouponHistory[]>([]);
const total = ref(0);
const listLoading = ref(false);

// 格式化方法
const formatType = (type?: number) => {
  if (type === undefined) return '';
  const option = typeOptions.find((item) => item.value === type);
  return option?.label || '';
};

const formatUseType = (useType?: number) => {
  if (useType === 0) return '全场通用';
  if (useType === 1) return '指定分类';
  if (useType === 2) return '指定商品';
  return '';
};

const formatDate = (time?: string | number) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDateUtil(date, 'yyyy-MM-dd');
};

const formatTime = (time?: string | number) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDateUtil(date, 'yyyy-MM-dd hh:mm:ss');
};

const formatStatus = (endTime?: number) => {
  if (!endTime) return 'N/A';
  const now = new Date().getTime();
  return endTime > now ? '未过期' : '已过期';
};

const formatGetType = (type?: number) => {
  return type === 1 ? '主动获取' : '后台赠送';
};

const formatCouponHistoryUseType = (useType?: number) => {
  if (useType === 0) return '未使用';
  if (useType === 1) return '已使用';
  if (useType === 2) return '已过期';
  return 'N/A';
};

// 获取优惠券信息
const getCouponInfo = async () => {
  try {
    const id = Number(route.query.id);
    if (!id) {
      ElMessage.error('缺少优惠券ID');
      return;
    }
    const response = await CouponService.getCoupon(id);
    coupon.value = response.data;
  } catch (error) {
    console.error('获取优惠券信息失败:', error);
    ElMessage.error('获取优惠券信息失败');
  }
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await CouponHistoryService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery);
  listQuery.couponId = Number(route.query.id);
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

onMounted(() => {
  const id = Number(route.query.id);
  if (id) {
    listQuery.couponId = id;
    getCouponInfo();
    getList();
  }
});
</script>

<style scoped lang="scss">
.app-container {
  width: 80%;
  margin: 20px auto;
}

.filter-container {
  margin-top: 20px;

  .el-icon {
    margin-right: 5px;
    vertical-align: middle;
  }

  .input-width {
    width: 203px;
  }
}

.table-layout {
  margin-top: 20px;
  border-top: 1px solid #dcdfe6;
  border-left: 1px solid #dcdfe6;
}

.table-cell {
  height: 60px;
  padding: 10px;
  overflow: hidden;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  color: #606266;
  font-size: 14px;
  line-height: 40px;
  text-align: center;
}

.table-cell-title {
  height: 60px;
  padding: 10px;
  overflow: hidden;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  background: #f2f6fc;
  color: #303133;
  font-size: 14px;
  font-weight: bold;
  line-height: 40px;
  text-align: center;
}

.table-container {
  margin-top: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
