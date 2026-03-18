<!--
  订单列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="100px">
        <el-form-item label="订单编号：">
          <el-input
            v-model="listQuery.orderSn"
            class="input-width"
            placeholder="订单编号"
            clearable
          />
        </el-form-item>
        <el-form-item label="收货人：">
          <el-input
            v-model="listQuery.receiverKeyword"
            class="input-width"
            placeholder="姓名/手机"
            clearable
          />
        </el-form-item>
        <el-form-item label="提交时间：">
          <el-date-picker
            v-model="listQuery.createTime"
            class="input-width"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="请选择时间"
          />
        </el-form-item>
        <el-form-item label="订单状态：">
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
        <el-form-item label="订单分类：">
          <el-select
            v-model="listQuery.orderType"
            class="input-width"
            placeholder="全部"
            clearable
          >
            <el-option
              v-for="item in orderTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="订单来源：">
          <el-select
            v-model="listQuery.sourceType"
            class="input-width"
            placeholder="全部"
            clearable
          >
            <el-option
              v-for="item in sourceTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 批量操作 -->
    <OperateContainer>
      <el-select
        v-model="batchAction"
        placeholder="批量操作"
        style="width: 150px"
      >
        <el-option label="批量发货" :value="1" />
        <el-option label="关闭订单" :value="2" />
        <el-option label="删除订单" :value="3" />
      </el-select>
      <el-button type="primary" @click="handleBatchOperate">确定</el-button>
    </OperateContainer>

    <!-- 数据列表 -->
    <AppTable
      v-model:current-page="listQuery.pageNum"
      v-model:page-size="listQuery.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      :page-sizes="[5, 10, 15]"
      show-selection
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <el-table-column label="订单编号" width="180" align="center">
        <template #default="{ row }">{{ row.orderSn }}</template>
      </el-table-column>
      <el-table-column label="提交时间" width="160" align="center">
        <template #default="{ row }">
          {{
            formatDateTime(row.createTime)
          }}
        </template>
      </el-table-column>
      <el-table-column label="用户账号" align="center">
        <template #default="{ row }">{{ row.memberUsername }}</template>
      </el-table-column>
      <el-table-column label="订单金额" width="100" align="center">
        <template #default="{ row }">¥{{ row.totalAmount }}</template>
      </el-table-column>
      <el-table-column label="支付方式" width="100" align="center">
        <template #default="{ row }">{{ formatPayType(row.payType) }}</template>
      </el-table-column>
      <el-table-column label="订单状态" width="100" align="center">
        <template #default="{ row }">
          <OrderStatusTag :status="row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleViewOrder(row)"
          >
            查看
          </el-button>
          <el-button
            v-if="row.status === 0"
            link
            type="warning"
            size="small"
            @click="handleCloseOrder(row)"
          >
            关闭
          </el-button>
          <el-button
            v-if="row.status === 1"
            link
            size="small"
            @click="handleDeliveryOrder(row)"
          >
            发货
          </el-button>
          <el-button
            v-if="row.status === 4"
            link
            type="danger"
            size="small"
            @click="handleDeleteOrder(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </AppTable>

    <!-- 关闭订单对话框 -->
    <CloseOrderDialog
      v-model="closeDialogVisible"
      :order-ids="closeOrderIds"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CloseOrderDialog from './components/CloseOrderDialog.vue';
import OrderStatusTag from './components/OrderStatusTag.vue';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useListPage } from '@/composables/useListPage';
import { useOrderStore } from '@/store';
import { formatDateTime } from '@/utils/format';

const router = useRouter();
const orderStore = useOrderStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  orderSn: '',
  receiverKeyword: '',
  status: null as number | null,
  orderType: null as number | null,
  sourceType: null as number | null,
  createTime: '',
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
  (q) => orderStore.getList(q),
  computed(() => orderStore.list),
  computed(() => orderStore.total),
);

const batchAction = ref<number | null>(null);
const selectedOrders = ref<any[]>([]);
const closeDialogVisible = ref(false);
const closeOrderIds = ref<number[]>([]);

const statusOptions = [
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '已发货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已关闭', value: 4 },
];

const orderTypeOptions = [
  { label: '正常订单', value: 0 },
  { label: '秒杀订单', value: 1 },
];

const sourceTypeOptions = [
  { label: 'PC订单', value: 0 },
  { label: 'APP订单', value: 1 },
];

const formatPayType = (value?: number) => {
  if (value === 1) return '支付宝';
  if (value === 2) return '微信';
  return '未支付';
};

const handleSelectionChange = (val: any[]) => {
  selectedOrders.value = val;
};

const handleViewOrder = (row: any) => {
  router.push({
    path: '/oms/order/orderDetail',
    query: { id: String(row.id) },
  });
};

const handleCloseOrder = (row: any) => {
  closeOrderIds.value = [row.id];
  closeDialogVisible.value = true;
};

const handleDeliveryOrder = (row: any) => {
  const listItem = {
    orderId: row.id,
    orderSn: row.orderSn,
    receiverName: row.receiverName,
    receiverPhone: row.receiverPhone,
    receiverPostCode: row.receiverPostCode,
    address: `${row.receiverProvince}${row.receiverCity}${row.receiverRegion}${row.receiverDetailAddress}`,
    deliveryCompany: '',
    deliverySn: '',
  };
  router.push({
    path: '/oms/order/deliverOrderList',
    query: { list: JSON.stringify([listItem]) },
  });
};

const handleDeleteOrder = async (row: any) => {
  try {
    await ElMessageBox.confirm('是否要删除该订单?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await orderStore.batchDelete([row.id]);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

const handleBatchOperate = () => {
  if (!selectedOrders.value.length) {
    ElMessage.warning('请选择订单');
    return;
  }

  if (batchAction.value === 1) {
    const deliveryList = selectedOrders.value
      .filter((item) => item.status === 1)
      .map((item) => ({
        orderId: item.id,
        orderSn: item.orderSn,
        receiverName: item.receiverName,
        receiverPhone: item.receiverPhone,
        receiverPostCode: item.receiverPostCode,
        address: `${item.receiverProvince}${item.receiverCity}${item.receiverRegion}${item.receiverDetailAddress}`,
        deliveryCompany: '',
        deliverySn: '',
      }));

    if (!deliveryList.length) {
      ElMessage.warning('选中订单中没有可发货的订单');
      return;
    }

    router.push({
      path: '/oms/order/deliverOrderList',
      query: { list: JSON.stringify(deliveryList) },
    });
  } else if (batchAction.value === 2) {
    closeOrderIds.value = selectedOrders.value.map((item) => item.id);
    closeDialogVisible.value = true;
  } else if (batchAction.value === 3) {
    const ids = selectedOrders.value.map((item) => item.id);
    ElMessageBox.confirm('是否要删除选中订单?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(async () => {
        await orderStore.batchDelete(ids);
        ElMessage.success('删除成功');
        await getList();
      })
      .catch(() => {});
  }
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
