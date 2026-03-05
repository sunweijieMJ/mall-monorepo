<!--
  订单详情页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="detail-container">
    <!-- 订单流程步骤条 -->
    <div>
      <el-steps
        :active="formatStepStatus(order.status)"
        finish-status="success"
        align-center
      >
        <el-step title="提交订单" :description="formatTime(order.createTime)" />
        <el-step
          title="支付订单"
          :description="formatTime(order.paymentTime)"
        />
        <el-step
          title="平台发货"
          :description="formatTime(order.deliveryTime)"
        />
        <el-step
          title="确认收货"
          :description="formatTime(order.receiveTime)"
        />
        <el-step
          title="完成评价"
          :description="formatTime(order.commentTime)"
        />
      </el-steps>
    </div>

    <el-card shadow="never" style="margin-top: 15px">
      <!-- 操作栏 -->
      <div class="operate-container">
        <el-icon class="color-danger" style="margin-left: 20px">
          <WarningFilled />
        </el-icon>
        <span class="color-danger"
          >当前订单状态：{{ formatStatus(order.status) }}</span
        >

        <!-- 待付款状态操作按钮 -->
        <div v-show="order.status === 0" class="operate-button-container">
          <el-button @click="showUpdateReceiverDialog"
            >修改收货人信息</el-button
          >
          <el-button @click="showUpdateMoneyDialog">修改费用信息</el-button>
          <el-button @click="showMessageDialog">发送站内信</el-button>
          <el-button @click="showCloseOrderDialog">关闭订单</el-button>
          <el-button @click="showMarkOrderDialog">备注订单</el-button>
        </div>

        <!-- 待发货状态操作按钮 -->
        <div v-show="order.status === 1" class="operate-button-container">
          <el-button @click="showUpdateReceiverDialog"
            >修改收货人信息</el-button
          >
          <el-button @click="showMessageDialog">发送站内信</el-button>
          <el-button>取消订单</el-button>
          <el-button @click="showMarkOrderDialog">备注订单</el-button>
        </div>

        <!-- 已发货/已完成状态操作按钮 -->
        <div
          v-show="order.status === 2 || order.status === 3"
          class="operate-button-container"
        >
          <el-button @click="showLogisticsDialog">订单跟踪</el-button>
          <el-button @click="showMessageDialog">发送站内信</el-button>
          <el-button @click="showMarkOrderDialog">备注订单</el-button>
        </div>

        <!-- 已关闭状态操作按钮 -->
        <div v-show="order.status === 4" class="operate-button-container">
          <el-button @click="handleDeleteOrder">删除订单</el-button>
          <el-button @click="showMarkOrderDialog">备注订单</el-button>
        </div>
      </div>

      <!-- 基本信息 -->
      <div style="margin-top: 20px">
        <el-icon style="color: #606266">
          <Memo />
        </el-icon>
        <span class="font-small">基本信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="4" class="table-cell-title">订单编号</el-col>
          <el-col :span="4" class="table-cell-title">发货单流水号</el-col>
          <el-col :span="4" class="table-cell-title">用户账号</el-col>
          <el-col :span="4" class="table-cell-title">支付方式</el-col>
          <el-col :span="4" class="table-cell-title">订单来源</el-col>
          <el-col :span="4" class="table-cell-title">订单类型</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell">{{ order.orderSn }}</el-col>
          <el-col :span="4" class="table-cell">暂无</el-col>
          <el-col :span="4" class="table-cell">{{
            order.memberUsername
          }}</el-col>
          <el-col :span="4" class="table-cell">{{
            formatPayType(order.payType)
          }}</el-col>
          <el-col :span="4" class="table-cell">{{
            formatSourceType(order.sourceType)
          }}</el-col>
          <el-col :span="4" class="table-cell">{{
            formatOrderType(order.orderType)
          }}</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell-title">配送方式</el-col>
          <el-col :span="4" class="table-cell-title">物流单号</el-col>
          <el-col :span="4" class="table-cell-title">自动确认收货时间</el-col>
          <el-col :span="4" class="table-cell-title">订单可得优币</el-col>
          <el-col :span="4" class="table-cell-title">订单可得成长值</el-col>
          <el-col :span="4" class="table-cell-title">活动信息</el-col>
        </el-row>
        <el-row>
          <el-col :span="4" class="table-cell">{{
            formatNull(order.deliveryCompany)
          }}</el-col>
          <el-col :span="4" class="table-cell">{{
            formatNull(order.deliverySn)
          }}</el-col>
          <el-col :span="4" class="table-cell"
            >{{ order.autoConfirmDay }}天</el-col
          >
          <el-col :span="4" class="table-cell">{{ order.integration }}</el-col>
          <el-col :span="4" class="table-cell">{{ order.growth }}</el-col>
          <el-col :span="4" class="table-cell">
            <el-popover
              placement="top-start"
              title="活动信息"
              width="200"
              trigger="hover"
              :content="order.promotionInfo"
            >
              <template #reference>
                <span>{{ formatLongText(order.promotionInfo) }}</span>
              </template>
            </el-popover>
          </el-col>
        </el-row>
      </div>

      <!-- 收货人信息 -->
      <div style="margin-top: 20px">
        <el-icon style="color: #606266">
          <Location />
        </el-icon>
        <span class="font-small">收货人信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">收货人</el-col>
          <el-col :span="6" class="table-cell-title">手机号码</el-col>
          <el-col :span="6" class="table-cell-title">邮政编码</el-col>
          <el-col :span="6" class="table-cell-title">收货地址</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell">{{ order.receiverName }}</el-col>
          <el-col :span="6" class="table-cell">{{
            order.receiverPhone
          }}</el-col>
          <el-col :span="6" class="table-cell">{{
            order.receiverPostCode
          }}</el-col>
          <el-col :span="6" class="table-cell">{{
            formatAddress(order)
          }}</el-col>
        </el-row>
      </div>

      <!-- 商品信息 -->
      <div style="margin-top: 20px">
        <el-icon style="color: #606266">
          <ShoppingCart />
        </el-icon>
        <span class="font-small">商品信息</span>
      </div>
      <el-table
        ref="orderItemTableRef"
        :data="order.orderItemList"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column label="商品图片" width="120" align="center">
          <template #default="{ row }">
            <img :src="row.productPic" style="height: 80px" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="{ row }">
            <p>{{ row.productName }}</p>
            <p>品牌：{{ row.productBrand }}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="120" align="center">
          <template #default="{ row }">
            <p>价格：￥{{ row.productPrice }}</p>
            <p>货号：{{ row.productSn }}</p>
          </template>
        </el-table-column>
        <el-table-column label="属性" width="120" align="center">
          <template #default="{ row }">{{
            formatProductAttr(row.productAttr)
          }}</template>
        </el-table-column>
        <el-table-column label="数量" width="120" align="center">
          <template #default="{ row }">{{ row.productQuantity }}</template>
        </el-table-column>
        <el-table-column label="小计" width="120" align="center">
          <template #default="{ row }">
            ￥{{ (row.productPrice * row.productQuantity).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
      <div style="margin: 20px; float: right">
        合计：<span class="color-danger">￥{{ order.totalAmount }}</span>
      </div>

      <!-- 费用信息 -->
      <div style="margin-top: 60px">
        <el-icon style="color: #606266">
          <Money />
        </el-icon>
        <span class="font-small">费用信息</span>
      </div>
      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">商品合计</el-col>
          <el-col :span="6" class="table-cell-title">运费</el-col>
          <el-col :span="6" class="table-cell-title">优惠券</el-col>
          <el-col :span="6" class="table-cell-title">积分抵扣</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell"
            >￥{{ order.totalAmount }}</el-col
          >
          <el-col :span="6" class="table-cell"
            >￥{{ order.freightAmount }}</el-col
          >
          <el-col :span="6" class="table-cell"
            >-￥{{ order.couponAmount }}</el-col
          >
          <el-col :span="6" class="table-cell"
            >-￥{{ order.integrationAmount }}</el-col
          >
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell-title">活动优惠</el-col>
          <el-col :span="6" class="table-cell-title">折扣金额</el-col>
          <el-col :span="6" class="table-cell-title">订单总金额</el-col>
          <el-col :span="6" class="table-cell-title">应付款金额</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell"
            >-￥{{ order.promotionAmount }}</el-col
          >
          <el-col :span="6" class="table-cell"
            >-￥{{ order.discountAmount }}</el-col
          >
          <el-col :span="6" class="table-cell">
            <span class="color-danger">
              ￥{{
                ((order.totalAmount || 0) + (order.freightAmount || 0)).toFixed(
                  2,
                )
              }}
            </span>
          </el-col>
          <el-col :span="6" class="table-cell">
            <span class="color-danger">
              ￥{{
                (
                  (order.payAmount || 0) +
                  (order.freightAmount || 0) -
                  (order.discountAmount || 0)
                ).toFixed(2)
              }}
            </span>
          </el-col>
        </el-row>
      </div>

      <!-- 操作信息 -->
      <div style="margin-top: 20px">
        <el-icon style="color: #606266">
          <Document />
        </el-icon>
        <span class="font-small">操作信息</span>
      </div>
      <el-table
        ref="orderHistoryTableRef"
        :data="order.historyList"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column label="操作者" width="120" align="center">
          <template #default="{ row }">{{ row.operateMan }}</template>
        </el-table-column>
        <el-table-column label="操作时间" width="160" align="center">
          <template #default="{ row }">{{
            formatTime(row.createTime)
          }}</template>
        </el-table-column>
        <el-table-column label="订单状态" width="120" align="center">
          <template #default="{ row }">{{
            formatStatus(row.orderStatus)
          }}</template>
        </el-table-column>
        <el-table-column label="付款状态" width="120" align="center">
          <template #default="{ row }">{{
            formatPayStatus(row.orderStatus)
          }}</template>
        </el-table-column>
        <el-table-column label="发货状态" width="120" align="center">
          <template #default="{ row }">{{
            formatDeliverStatus(row.orderStatus)
          }}</template>
        </el-table-column>
        <el-table-column label="备注" align="center">
          <template #default="{ row }">{{ row.note }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 修改收货人信息对话框 -->
    <el-dialog
      v-model="receiverDialogVisible"
      title="修改收货人信息"
      width="40%"
    >
      <el-form
        ref="receiverInfoFormRef"
        :model="receiverInfo"
        label-width="150px"
      >
        <el-form-item label="收货人姓名：">
          <el-input v-model="receiverInfo.receiverName" style="width: 200px" />
        </el-form-item>
        <el-form-item label="手机号码：">
          <el-input v-model="receiverInfo.receiverPhone" style="width: 200px" />
        </el-form-item>
        <el-form-item label="邮政编码：">
          <el-input
            v-model="receiverInfo.receiverPostCode"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="所在区域：">
          <el-input
            v-model="receiverRegionText"
            placeholder="省-市-区"
            style="width: 300px"
            readonly
          />
        </el-form-item>
        <el-form-item label="详细地址：">
          <el-input
            v-model="receiverInfo.receiverDetailAddress"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receiverDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateReceiverInfo"
          >确 定</el-button
        >
      </template>
    </el-dialog>

    <!-- 修改费用信息对话框 -->
    <el-dialog v-model="moneyDialogVisible" title="修改费用信息" width="40%">
      <div class="table-layout">
        <el-row>
          <el-col :span="6" class="table-cell-title">商品合计</el-col>
          <el-col :span="6" class="table-cell-title">运费</el-col>
          <el-col :span="6" class="table-cell-title">优惠券</el-col>
          <el-col :span="6" class="table-cell-title">积分抵扣</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell"
            >￥{{ order.totalAmount }}</el-col
          >
          <el-col :span="6" class="table-cell">
            <el-input v-model.number="moneyInfo.freightAmount">
              <template #prepend>￥</template>
            </el-input>
          </el-col>
          <el-col :span="6" class="table-cell"
            >-￥{{ order.couponAmount }}</el-col
          >
          <el-col :span="6" class="table-cell"
            >-￥{{ order.integrationAmount }}</el-col
          >
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell-title">活动优惠</el-col>
          <el-col :span="6" class="table-cell-title">折扣金额</el-col>
          <el-col :span="6" class="table-cell-title">订单总金额</el-col>
          <el-col :span="6" class="table-cell-title">应付款金额</el-col>
        </el-row>
        <el-row>
          <el-col :span="6" class="table-cell"
            >-￥{{ order.promotionAmount }}</el-col
          >
          <el-col :span="6" class="table-cell">
            <el-input v-model.number="moneyInfo.discountAmount">
              <template #prepend>-￥</template>
            </el-input>
          </el-col>
          <el-col :span="6" class="table-cell">
            <span class="color-danger">
              ￥{{
                ((order.totalAmount || 0) + moneyInfo.freightAmount).toFixed(2)
              }}
            </span>
          </el-col>
          <el-col :span="6" class="table-cell">
            <span class="color-danger">
              ￥{{
                (
                  (order.payAmount || 0) +
                  moneyInfo.freightAmount -
                  moneyInfo.discountAmount
                ).toFixed(2)
              }}
            </span>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <el-button @click="moneyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateMoneyInfo"
          >确 定</el-button
        >
      </template>
    </el-dialog>

    <!-- 发送站内信对话框 -->
    <el-dialog v-model="messageDialogVisible" title="发送站内信" width="40%">
      <el-form :model="message" label-width="150px">
        <el-form-item label="标题：">
          <el-input v-model="message.title" style="width: 200px" />
        </el-form-item>
        <el-form-item label="内容：">
          <el-input v-model="message.content" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="messageDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSendMessage">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 关闭订单对话框 -->
    <el-dialog v-model="closeDialogVisible" title="关闭订单" width="40%">
      <el-form :model="closeInfo" label-width="150px">
        <el-form-item label="操作备注：">
          <el-input v-model="closeInfo.note" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleCloseOrder">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 备注订单对话框 -->
    <el-dialog v-model="markOrderDialogVisible" title="备注订单" width="40%">
      <el-form :model="markInfo" label-width="150px">
        <el-form-item label="操作备注：">
          <el-input v-model="markInfo.note" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="markOrderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleMarkOrder">确 定</el-button>
      </template>
    </el-dialog>

    <!-- 物流跟踪对话框（占位） -->
    <el-dialog v-model="logisticsDialogVisible" title="订单跟踪" width="50%">
      <div style="padding: 40px; text-align: center">
        <el-icon :size="80" color="#DCDFE6">
          <Van />
        </el-icon>
        <p style="margin-top: 20px; color: #909399">物流跟踪功能待开发</p>
      </div>
      <template #footer>
        <el-button @click="logisticsDialogVisible = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  WarningFilled,
  Memo,
  Location,
  ShoppingCart,
  Money,
  Document,
  Van,
} from '@element-plus/icons-vue';
import {
  ElMessage,
  ElMessageBox,
  type ElTable,
  type ElForm,
} from 'element-plus';
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import OrderService from '@/api/modules/order';
import type { OrderDetail } from '@/interface';
import { formatDate } from '@/utils/date';

const route = useRoute();
const router = useRouter();

const orderItemTableRef = ref<InstanceType<typeof ElTable>>();
const orderHistoryTableRef = ref<InstanceType<typeof ElTable>>();
const receiverInfoFormRef = ref<InstanceType<typeof ElForm>>();

const id = ref<number>(0);
const order = reactive<Partial<OrderDetail>>({});

// 对话框显示状态
const receiverDialogVisible = ref(false);
const moneyDialogVisible = ref(false);
const messageDialogVisible = ref(false);
const closeDialogVisible = ref(false);
const markOrderDialogVisible = ref(false);
const logisticsDialogVisible = ref(false);

// 收货人信息
const receiverInfo = reactive({
  orderId: null as number | null,
  receiverName: null as string | null,
  receiverPhone: null as string | null,
  receiverPostCode: null as string | null,
  receiverDetailAddress: null as string | null,
  receiverProvince: null as string | null,
  receiverCity: null as string | null,
  receiverRegion: null as string | null,
  status: null as number | null,
});

// 收货地址文本（用于展示）
const receiverRegionText = computed(() => {
  const parts = [
    receiverInfo.receiverProvince,
    receiverInfo.receiverCity,
    receiverInfo.receiverRegion,
  ].filter(Boolean);
  return parts.join('-');
});

// 费用信息
const moneyInfo = reactive({
  orderId: null as number | null,
  freightAmount: 0,
  discountAmount: 0,
  status: null as number | null,
});

// 站内信
const message = reactive({
  title: null as string | null,
  content: null as string | null,
});

// 关闭订单信息
const closeInfo = reactive({
  note: null as string | null,
  id: null as number | null,
});

// 备注订单信息
const markInfo = reactive({
  note: null as string | null,
  id: null as number | null,
});

// 格式化函数
const formatNull = (value?: string | null) => {
  return value || '暂无';
};

const formatLongText = (value?: string | null) => {
  if (!value) return '暂无';
  return value.length > 8 ? value.substr(0, 8) + '...' : value;
};

const formatPayType = (value?: number) => {
  if (value === 1) return '支付宝';
  if (value === 2) return '微信';
  return '未支付';
};

const formatSourceType = (value?: number) => {
  return value === 1 ? 'APP订单' : 'PC订单';
};

const formatOrderType = (value?: number) => {
  return value === 1 ? '秒杀订单' : '正常订单';
};

const formatAddress = (orderData: Partial<OrderDetail>) => {
  const parts = [
    orderData.receiverProvince,
    orderData.receiverCity,
    orderData.receiverRegion,
    orderData.receiverDetailAddress,
  ].filter(Boolean);
  return parts.join('  ');
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
  return statusMap[value || 0] || '未知';
};

const formatPayStatus = (value?: number) => {
  if (value === 0) return '未支付';
  if (value === 4) return '已退款';
  return '已支付';
};

const formatDeliverStatus = (value?: number) => {
  return value === 0 || value === 1 ? '未发货' : '已发货';
};

const formatProductAttr = (value?: string | null) => {
  if (!value) return '';
  try {
    const attr = JSON.parse(value);
    return attr.map((item: any) => `${item.key}:${item.value}`).join(';');
  } catch {
    return value;
  }
};

const formatTime = (time?: string | null) => {
  if (!time) return '';
  const date = new Date(time);
  return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
};

const formatStepStatus = (value?: number) => {
  // 0:待付款 1:待发货 2:已发货 3:已完成 4:已关闭 5:无效订单
  if (value === 1) return 2; // 待发货
  if (value === 2) return 3; // 已发货
  if (value === 3) return 4; // 已完成
  return 1; // 其他状态
};

// 显示修改收货人信息对话框
const showUpdateReceiverDialog = () => {
  receiverDialogVisible.value = true;
  Object.assign(receiverInfo, {
    orderId: order.id,
    receiverName: order.receiverName,
    receiverPhone: order.receiverPhone,
    receiverPostCode: order.receiverPostCode,
    receiverDetailAddress: order.receiverDetailAddress,
    receiverProvince: order.receiverProvince,
    receiverCity: order.receiverCity,
    receiverRegion: order.receiverRegion,
    status: order.status,
  });
};

// 修改收货人信息
const handleUpdateReceiverInfo = async () => {
  try {
    await ElMessageBox.confirm('是否要修改收货信息?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await OrderService.updateReceiverInfo(receiverInfo);
    receiverDialogVisible.value = false;
    ElMessage.success('修改成功!');
    getDetail();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('修改失败:', error);
      ElMessage.error('修改失败');
    }
  }
};

// 显示修改费用信息对话框
const showUpdateMoneyDialog = () => {
  moneyDialogVisible.value = true;
  moneyInfo.orderId = order.id || null;
  moneyInfo.freightAmount = order.freightAmount || 0;
  moneyInfo.discountAmount = order.discountAmount || 0;
  moneyInfo.status = order.status || null;
};

// 修改费用信息
const handleUpdateMoneyInfo = async () => {
  try {
    await ElMessageBox.confirm('是否要修改费用信息?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await OrderService.updateMoneyInfo(moneyInfo);
    moneyDialogVisible.value = false;
    ElMessage.success('修改成功!');
    getDetail();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('修改失败:', error);
      ElMessage.error('修改失败');
    }
  }
};

// 显示发送站内信对话框
const showMessageDialog = () => {
  messageDialogVisible.value = true;
  message.title = null;
  message.content = null;
};

// 发送站内信
const handleSendMessage = async () => {
  try {
    await ElMessageBox.confirm('是否要发送站内信?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    messageDialogVisible.value = false;
    ElMessage.success('发送成功!');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.info('已取消发送');
    }
  }
};

// 显示关闭订单对话框
const showCloseOrderDialog = () => {
  closeDialogVisible.value = true;
  closeInfo.note = null;
  closeInfo.id = id.value;
};

// 关闭订单
const handleCloseOrder = async () => {
  try {
    await ElMessageBox.confirm('是否要关闭?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await OrderService.closeOrder({
      ids: [closeInfo.id!],
      note: closeInfo.note || '',
    });
    closeDialogVisible.value = false;
    ElMessage.success('订单关闭成功!');
    getDetail();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('关闭失败:', error);
      ElMessage.error('关闭失败');
    }
  }
};

// 显示备注订单对话框
const showMarkOrderDialog = () => {
  markOrderDialogVisible.value = true;
  markInfo.id = id.value;
  markInfo.note = null;
};

// 备注订单
const handleMarkOrder = async () => {
  try {
    await ElMessageBox.confirm('是否要备注订单?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await OrderService.updateOrderNote({
      id: markInfo.id!,
      note: markInfo.note || '',
      status: order.status || 0,
    });
    markOrderDialogVisible.value = false;
    ElMessage.success('订单备注成功!');
    getDetail();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('备注失败:', error);
      ElMessage.error('备注失败');
    }
  }
};

// 删除订单
const handleDeleteOrder = async () => {
  try {
    await ElMessageBox.confirm('是否要进行该删除操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await OrderService.deleteOrder({ ids: [id.value] });
    ElMessage.success('删除成功！');
    router.back();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 显示物流跟踪对话框
const showLogisticsDialog = () => {
  logisticsDialogVisible.value = true;
};

// 获取订单详情
const getDetail = async () => {
  try {
    const response = await OrderService.getOrderDetail(id.value);
    Object.assign(order, response.data);
  } catch (error) {
    console.error('获取订单详情失败:', error);
    ElMessage.error('获取订单详情失败');
  }
};

onMounted(() => {
  id.value = Number(route.query.id);
  getDetail();
});
</script>

<style scoped lang="scss">
.detail-container {
  width: 80%;
  margin: 20px auto;
  padding: 20px;
}

.operate-container {
  height: 80px;
  margin: -20px -20px 0;
  background: #f2f6fc;
  line-height: 80px;
}

.operate-button-container {
  margin-right: 20px;
  float: right;
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
  padding: 10px;
  border-right: 1px solid #dcdfe6;
  border-bottom: 1px solid #dcdfe6;
  background: #f2f6fc;
  color: #303133;
  font-size: 14px;
  text-align: center;
}

.font-small {
  font-size: 14px;
}

.color-danger {
  color: #f56c6c;
}
</style>
