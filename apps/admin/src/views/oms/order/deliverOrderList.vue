<!--
  批量发货页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>发货列表</span>
    </el-card>
    <div class="table-container">
      <el-table
        ref="deliverOrderTableRef"
        :data="list"
        border
        style="width: 100%"
      >
        <el-table-column label="订单编号" width="180" align="center">
          <template #default="{ row }">{{ row.orderSn }}</template>
        </el-table-column>
        <el-table-column label="收货人" width="180" align="center">
          <template #default="{ row }">{{ row.receiverName }}</template>
        </el-table-column>
        <el-table-column label="手机号码" width="160" align="center">
          <template #default="{ row }">{{ row.receiverPhone }}</template>
        </el-table-column>
        <el-table-column label="邮政编码" width="160" align="center">
          <template #default="{ row }">{{ row.receiverPostCode }}</template>
        </el-table-column>
        <el-table-column label="收货地址" align="center">
          <template #default="{ row }">{{ formatAddress(row) }}</template>
        </el-table-column>
        <el-table-column label="配送方式" width="160" align="center">
          <template #default="{ row }">
            <el-select
              v-model="row.deliveryCompany"
              placeholder="请选择物流公司"
            >
              <el-option
                v-for="item in companyOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="物流单号" width="180" align="center">
          <template #default="{ row }">
            <el-input v-model="row.deliverySn" />
          </template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 15px; text-align: center">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import OrderService, { type DeliveryOrderItem } from '@/api/modules/order';
import type { Order } from '@/interface';

const route = useRoute();
const router = useRouter();
const deliverOrderTableRef = ref<InstanceType<typeof ElTable>>();

const defaultLogisticsCompanies = [
  '顺丰快递',
  '圆通快递',
  '中通快递',
  '韵达快递',
];

const list = ref<Order[]>([]);
const companyOptions = ref<string[]>(defaultLogisticsCompanies);

// 格式化收货地址
const formatAddress = (order: Order) => {
  const parts = [
    order.receiverProvince,
    order.receiverCity,
    order.receiverRegion,
    order.receiverDetailAddress,
  ].filter(Boolean);
  return parts.join(' ');
};

// 取消
const cancel = () => {
  router.back();
};

// 确认发货
const confirm = async () => {
  try {
    await ElMessageBox.confirm('是否要进行发货操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 构建发货数据
    const deliveryData: DeliveryOrderItem[] = list.value.map((item) => ({
      orderId: item.id,
      deliveryCompany: item.deliveryCompany || '',
      deliverySn: item.deliverySn || '',
    }));

    await OrderService.deliveryOrder(deliveryData);
    ElMessage.success('发货成功!');
    router.back();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('发货失败:', error);
      ElMessage.error('发货失败');
    }
  }
};

onMounted(() => {
  // 从路由query中获取发货列表
  const queryList = route.query.list;
  if (queryList) {
    try {
      // 如果是字符串，尝试解析
      if (typeof queryList === 'string') {
        list.value = JSON.parse(queryList);
      } else if (Array.isArray(queryList)) {
        list.value = queryList as Order[];
      }
    } catch (error) {
      console.error('解析发货列表失败:', error);
      list.value = [];
    }
  }

  // 当list不为数组时转换为数组
  if (!Array.isArray(list.value)) {
    list.value = [];
  }
});
</script>

<style scoped lang="scss">
.operate-container {
  margin-top: 0;
}
</style>
