<!--
  退货申请详情页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="detail-container">
    <el-card shadow="never">
      <span class="font-title-medium">退货商品</span>
      <el-table
        ref="productTableRef"
        :data="productList"
        border
        class="standard-margin"
      >
        <el-table-column label="商品图片" width="160" align="center">
          <template #default="{ row }">
            <img style="height: 80px" :src="row.productPic" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="{ row }">
            <span class="font-small">{{ row.productName }}</span
            ><br />
            <span class="font-small">品牌：{{ row.productBrand }}</span>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="180" align="center">
          <template #default="{ row }">
            <span class="font-small">价格：￥{{ row.productRealPrice }}</span
            ><br />
            <span class="font-small">货号：NO.{{ row.productId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="180" align="center">
          <template #default="{ row }">{{ row.productAttr }}</template>
        </el-table-column>
        <el-table-column label="数量" width="100" align="center">
          <template #default="{ row }">{{ row.productCount }}</template>
        </el-table-column>
        <el-table-column label="小计" width="100" align="center">
          <template #default>￥{{ totalAmount }}</template>
        </el-table-column>
      </el-table>
      <div style="margin-top: 15px; margin-bottom: 15px; float: right">
        <span class="font-title-medium">合计：</span>
        <span class="font-title-medium color-danger">￥{{ totalAmount }}</span>
      </div>
    </el-card>
    <el-card shadow="never" class="standard-margin">
      <span class="font-title-medium">服务单信息</span>
      <div class="form-container-border">
        <el-row>
          <el-col :span="6" class="form-border form-left-bg font-small"
            >服务单号</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.id
          }}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >申请状态</el-col
          ><el-col class="form-border font-small" :span="18">
            {{ formatStatus(orderReturnApply.status) }}
          </el-col>
        </el-row>
        <el-row>
          <el-col
            :span="6"
            class="form-border form-left-bg font-small"
            style="height: 50px"
            >订单编号</el-col
          ><el-col
            class="form-border font-small"
            :span="18"
            style="height: 50px"
          >
            {{ orderReturnApply.orderSn
            }}<el-button type="text" @click="handleViewOrder">查看</el-button>
          </el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >申请时间</el-col
          ><el-col class="form-border font-small" :span="18">
            {{ formatTime(orderReturnApply.createTime) }}
          </el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >用户账号</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.memberUsername
          }}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >联系人</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.returnName
          }}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >联系电话</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.returnPhone
          }}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >退货原因</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.reason
          }}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >问题描述</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.description
          }}</el-col>
        </el-row>
        <el-row>
          <el-col
            class="form-border form-left-bg font-small"
            :span="6"
            style="height: 100px"
            >凭证图片</el-col
          ><el-col
            class="form-border font-small"
            :span="18"
            style="height: 100px"
          >
            <img
              v-for="(item, index) in proofPics"
              :key="index"
              style="width: 80px; height: 80px"
              :src="item"
            />
          </el-col>
        </el-row>
      </div>
      <div class="form-container-border">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >订单金额</el-col
          ><el-col class="form-border font-small" :span="18"
            >￥{{ totalAmount }}</el-col
          >
        </el-row>
        <el-row>
          <el-col
            class="form-border form-left-bg font-small"
            :span="6"
            style="height: 52px"
            >确认退款金额</el-col
          ><el-col
            class="form-border font-small"
            style="height: 52px"
            :span="18"
          >
            ￥<el-input
              v-model.number="updateStatusParam.returnAmount"
              :disabled="orderReturnApply.status !== 0"
              style="width: 200px; margin-left: 10px"
            />
          </el-col>
        </el-row>
        <div v-show="orderReturnApply.status !== 3">
          <el-row>
            <el-col
              class="form-border form-left-bg font-small"
              :span="6"
              style="height: 52px"
              >选择收货点</el-col
            ><el-col
              class="form-border font-small"
              style="height: 52px"
              :span="18"
            >
              <el-select
                v-model="updateStatusParam.companyAddressId"
                style="width: 200px"
                :disabled="orderReturnApply.status !== 0"
              >
                <el-option
                  v-for="address in companyAddressList"
                  :key="address.id"
                  :value="address.id"
                  :label="address.addressName"
                />
              </el-select>
            </el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6"
              >收货人姓名</el-col
            ><el-col class="form-border font-small" :span="18">{{
              currentAddress.name
            }}</el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6"
              >所在区域</el-col
            ><el-col class="form-border font-small" :span="18">{{
              formatRegion(currentAddress)
            }}</el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6"
              >详细地址</el-col
            ><el-col class="form-border font-small" :span="18">{{
              currentAddress.detailAddress
            }}</el-col>
          </el-row>
          <el-row>
            <el-col class="form-border form-left-bg font-small" :span="6"
              >联系电话</el-col
            ><el-col class="form-border font-small" :span="18">{{
              currentAddress.phone
            }}</el-col>
          </el-row>
        </div>
      </div>
      <div v-show="orderReturnApply.status !== 0" class="form-container-border">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >处理人员</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.handleMan
          }}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >处理时间</el-col
          ><el-col class="form-border font-small" :span="18">
            {{ formatTime(orderReturnApply.handleTime) }}
          </el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >处理备注</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.handleNote
          }}</el-col>
        </el-row>
      </div>
      <div v-show="orderReturnApply.status === 2" class="form-container-border">
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >收货人员</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.receiveMan
          }}</el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >收货时间</el-col
          ><el-col class="form-border font-small" :span="18">
            {{ formatTime(orderReturnApply.receiveTime) }}
          </el-col>
        </el-row>
        <el-row>
          <el-col class="form-border form-left-bg font-small" :span="6"
            >收货备注</el-col
          ><el-col class="form-border font-small" :span="18">{{
            orderReturnApply.receiveNote
          }}</el-col>
        </el-row>
      </div>
      <div v-show="orderReturnApply.status === 0" class="form-container-border">
        <el-row>
          <el-col
            class="form-border form-left-bg font-small"
            :span="6"
            style="height: 52px"
            >处理备注</el-col
          ><el-col class="form-border font-small" :span="18">
            <el-input
              v-model="updateStatusParam.handleNote"
              style="width: 200px; margin-left: 10px"
            />
          </el-col>
        </el-row>
      </div>
      <div v-show="orderReturnApply.status === 1" class="form-container-border">
        <el-row>
          <el-col
            class="form-border form-left-bg font-small"
            :span="6"
            style="height: 52px"
            >收货备注</el-col
          ><el-col class="form-border font-small" :span="18">
            <el-input
              v-model="updateStatusParam.receiveNote"
              style="width: 200px; margin-left: 10px"
            />
          </el-col>
        </el-row>
      </div>
      <div
        v-show="orderReturnApply.status === 0"
        style="margin-top: 15px; text-align: center"
      >
        <el-button type="primary" @click="handleUpdateStatus(1)"
          >确认退货</el-button
        >
        <el-button type="danger" @click="handleUpdateStatus(3)"
          >拒绝退货</el-button
        >
      </div>
      <div
        v-show="orderReturnApply.status === 1"
        style="margin-top: 15px; text-align: center"
      >
        <el-button type="primary" @click="handleUpdateStatus(2)"
          >确认收货</el-button
        >
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CompanyAddressService from '@/api/modules/companyAddress';
import ReturnApplyService from '@/api/modules/returnApply';
import type { OrderReturnApply, CompanyAddress } from '@/interface';
import { formatDate } from '@/utils/date';

const route = useRoute();
const router = useRouter();
const productTableRef = ref<InstanceType<typeof ElTable>>();

const id = ref<number>(0);
const orderReturnApply = reactive<Partial<OrderReturnApply>>({});
const productList = ref<Partial<OrderReturnApply>[]>([]);
const proofPics = ref<string[]>([]);
const updateStatusParam = reactive({
  companyAddressId: null as number | null,
  handleMan: 'admin',
  handleNote: null as string | null,
  receiveMan: 'admin',
  receiveNote: null as string | null,
  returnAmount: 0,
  status: 0,
});
const companyAddressList = ref<CompanyAddress[]>([]);

const totalAmount = computed(() => {
  if (orderReturnApply.productRealPrice && orderReturnApply.productCount) {
    return orderReturnApply.productRealPrice * orderReturnApply.productCount;
  }
  return 0;
});

const currentAddress = computed(() => {
  const id = updateStatusParam.companyAddressId;
  if (!companyAddressList.value) return {} as CompanyAddress;
  for (const address of companyAddressList.value) {
    if (address.id === id) return address;
  }
  return {} as CompanyAddress;
});

const formatStatus = (status?: number) => {
  if (status === 0) return '待处理';
  if (status === 1) return '退货中';
  if (status === 2) return '已完成';
  if (status === 3) return '已拒绝';
  return '';
};

const formatTime = (time?: string | null) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
};

const formatRegion = (address: Partial<CompanyAddress>) => {
  let str = address.province || '';
  if (address.city) str += '  ' + address.city;
  if (address.region) str += '  ' + address.region;
  return str;
};

const handleViewOrder = () => {
  router.push({
    path: '/oms/orderDetail',
    query: { id: String(orderReturnApply.orderId) },
  });
};

const getDetail = async () => {
  try {
    const response = await ReturnApplyService.getApplyDetail(id.value);
    Object.assign(orderReturnApply, response.data);
    productList.value = [orderReturnApply];
    if (orderReturnApply.proofPics)
      proofPics.value = orderReturnApply.proofPics.split(',');
    if (orderReturnApply.status === 1 || orderReturnApply.status === 2) {
      updateStatusParam.returnAmount = orderReturnApply.returnAmount || 0;
      updateStatusParam.companyAddressId =
        orderReturnApply.companyAddressId || null;
    }
    await getCompanyAddressList();
  } catch (error) {
    console.error('获取详情失败:', error);
    ElMessage.error('获取详情失败');
  }
};

const getCompanyAddressList = async () => {
  try {
    const response = await CompanyAddressService.fetchList();
    companyAddressList.value = response.data;
    for (const address of companyAddressList.value) {
      if (address.receiveStatus === 1 && orderReturnApply.status === 0) {
        updateStatusParam.companyAddressId = address.id;
        break;
      }
    }
  } catch (error) {
    console.error('获取收货地址列表失败:', error);
  }
};

const handleUpdateStatus = async (status: number) => {
  updateStatusParam.status = status;
  try {
    await ElMessageBox.confirm('是否要进行此操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await ReturnApplyService.updateApplyStatus(id.value, updateStatusParam);
    ElMessage.success('操作成功');
    router.back();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

onMounted(() => {
  id.value = Number(route.query.id);
  getDetail();
});
</script>

<style scoped lang="scss">
.detail-container {
  position: absolute;
  right: 0;
  left: 0;
  width: 1080px;
  margin: 20px auto;
  padding: 35px 35px 15px;
}

.standard-margin {
  margin-top: 15px;
}

.form-border {
  padding: 10px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
}

.form-container-border {
  margin-top: 15px;
  border-top: 1px solid #dcdfe6;
  border-left: 1px solid #dcdfe6;
}

.form-left-bg {
  background: #f2f6fc;
}

.font-title-medium {
  font-size: 16px;
  font-weight: 500;
}

.font-small {
  font-size: 13px;
}

.color-danger {
  color: #f56c6c;
}
</style>
