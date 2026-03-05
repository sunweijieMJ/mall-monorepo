<!--
  订单列表页面
  包含筛选、批量操作、关闭订单等功能
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
          <el-form-item label="输入搜索：">
            <el-input
              v-model="listQuery.orderSn"
              class="input-width"
              placeholder="订单编号"
            />
          </el-form-item>
          <el-form-item label="收货人：">
            <el-input
              v-model="listQuery.receiverKeyword"
              class="input-width"
              placeholder="收货人姓名/手机号码"
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
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
    </el-card>

    <div class="table-container">
      <el-table
        ref="orderTableRef"
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
        <el-table-column label="订单编号" width="180" align="center">
          <template #default="{ row }">{{ row.orderSn }}</template>
        </el-table-column>
        <el-table-column label="提交时间" width="180" align="center">
          <template #default="{ row }">{{
            formatCreateTime(row.createTime)
          }}</template>
        </el-table-column>
        <el-table-column label="用户账号" align="center">
          <template #default="{ row }">{{ row.memberUsername }}</template>
        </el-table-column>
        <el-table-column label="订单金额" width="120" align="center">
          <template #default="{ row }">￥{{ row.totalAmount }}</template>
        </el-table-column>
        <el-table-column label="支付方式" width="120" align="center">
          <template #default="{ row }">{{
            formatPayType(row.payType)
          }}</template>
        </el-table-column>
        <el-table-column label="订单来源" width="120" align="center">
          <template #default="{ row }">{{
            formatSourceType(row.sourceType)
          }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="120" align="center">
          <template #default="{ row }">{{ formatStatus(row.status) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row, $index }">
            <el-button @click="handleViewOrder($index, row)">
              查看订单
            </el-button>
            <el-button
              v-show="row.status === 0"
              @click="handleCloseOrder($index, row)"
            >
              关闭订单
            </el-button>
            <el-button
              v-show="row.status === 1"
              @click="handleDeliveryOrder($index, row)"
            >
              订单发货
            </el-button>
            <el-button
              v-show="row.status === 2 || row.status === 3"
              @click="handleViewLogistics($index, row)"
            >
              订单跟踪
            </el-button>
            <el-button
              v-show="row.status === 4"
              type="danger"
              @click="handleDeleteOrder($index, row)"
            >
              删除订单
            </el-button>
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

    <!-- 关闭订单对话框 -->
    <el-dialog
      v-model="closeOrderDialog.dialogVisible"
      title="关闭订单"
      width="30%"
    >
      <span style="vertical-align: top">操作备注：</span>
      <el-input
        v-model="closeOrderDialog.content"
        style="width: 80%"
        type="textarea"
        :rows="5"
        placeholder="请输入内容"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="closeOrderDialog.dialogVisible = false"
            >取 消</el-button
          >
          <el-button type="primary" @click="handleCloseOrderConfirm"
            >确 定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { OrderService } from '@/api/modules';
import type { Order } from '@/interface';

// Router
const router = useRouter();

// 表格引用
const orderTableRef = ref<InstanceType<typeof ElTable>>();

// 默认查询参数
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

// 查询参数
const listQuery = reactive({ ...defaultListQuery });

// 状态
const listLoading = ref(false);
const list = ref<Order[]>([]);
const total = ref(0);
const multipleSelection = ref<Order[]>([]);
const operateType = ref<number | null>(null);

// 关闭订单对话框
const closeOrderDialog = reactive({
  dialogVisible: false,
  content: '',
  orderIds: [] as number[],
});

// 选项列表
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

const operateOptions = [
  { label: '批量发货', value: 1 },
  { label: '关闭订单', value: 2 },
  { label: '删除订单', value: 3 },
];

// 格式化函数
const formatCreateTime = (time: string) => {
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

const formatPayType = (value?: number) => {
  if (value === 1) return '支付宝';
  else if (value === 2) return '微信';
  return '未支付';
};

const formatSourceType = (value?: number) => {
  return value === 1 ? 'APP订单' : 'PC订单';
};

const formatStatus = (value?: number) => {
  const statusMap: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '已发货',
    3: '已完成',
    4: '已关闭',
    5: '无效订单',
  };
  return statusMap[value || 0] || '待付款';
};

// 重置搜索
const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery);
};

// 搜索
const handleSearchList = () => {
  listQuery.pageNum = 1;
  getList();
};

// 选择变化
const handleSelectionChange = (val: Order[]) => {
  multipleSelection.value = val;
};

// 查看订单
const handleViewOrder = (_index: number, row: Order) => {
  router.push({
    path: '/mall/oms/order/orderDetail',
    query: { id: String(row.id) },
  });
};

// 关闭订单
const handleCloseOrder = (_index: number, row: Order) => {
  closeOrderDialog.dialogVisible = true;
  closeOrderDialog.orderIds = [row.id!];
};

// 订单发货
const handleDeliveryOrder = (_index: number, row: Order) => {
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
    path: '/mall/oms/order/deliverOrderList',
    query: { list: JSON.stringify([listItem]) },
  });
};

// 查看物流
const handleViewLogistics = (_index: number, _row: Order) => {
  ElMessage.info('物流跟踪功能待实现');
};

// 删除订单
const handleDeleteOrder = async (_index: number, row: Order) => {
  await deleteOrder([row.id!]);
};

// 批量操作
const handleBatchOperate = () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择要操作的订单');
    return;
  }

  if (operateType.value === 1) {
    // 批量发货
    const list = multipleSelection.value
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

    if (list.length === 0) {
      ElMessage.warning('选中订单中没有可以发货的订单');
      return;
    }

    router.push({
      path: '/mall/oms/order/deliverOrderList',
      query: { list: JSON.stringify(list) },
    });
  } else if (operateType.value === 2) {
    // 关闭订单
    closeOrderDialog.orderIds = multipleSelection.value.map((item) => item.id!);
    closeOrderDialog.dialogVisible = true;
  } else if (operateType.value === 3) {
    // 删除订单
    const ids = multipleSelection.value.map((item) => item.id!);
    deleteOrder(ids);
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

// 确认关闭订单
const handleCloseOrderConfirm = async () => {
  if (!closeOrderDialog.content || closeOrderDialog.content === '') {
    ElMessage.warning('操作备注不能为空');
    return;
  }

  try {
    await OrderService.closeOrder({
      ids: closeOrderDialog.orderIds,
      note: closeOrderDialog.content,
    });
    closeOrderDialog.orderIds = [];
    closeOrderDialog.dialogVisible = false;
    closeOrderDialog.content = '';
    await getList();
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('关闭订单失败:', error);
    ElMessage.error('操作失败');
  }
};

// 获取订单列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await OrderService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取订单列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 删除订单
const deleteOrder = async (ids: number[]) => {
  try {
    await ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await OrderService.deleteOrder({ ids });
    ElMessage.success('删除成功！');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

// 页面加载
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

.batch-operate-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>
