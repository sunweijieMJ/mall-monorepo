<!--
  首页仪表盘
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <!-- 学习资源区域 -->
    <div class="address-layout">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="out-border">
            <div class="layout-title">学习教程</div>
            <div class="color-main address-content">
              <a href="https://www.macrozheng.com" target="_blank"
              >mall学习教程</a
              >
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="out-border">
            <div class="layout-title">视频教程</div>
            <div class="color-main address-content">
              <a
                href="https://www.macrozheng.com/mall/catalog/mall_video.html"
                target="_blank"
              >
                mall视频教程（2023）
              </a>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="out-border">
            <div class="layout-title">点Star支持项目</div>
            <div class="color-main address-content">
              <a href="https://github.com/macrozheng/mall" target="_blank"
              >mall项目</a
              >
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 销售统计区域 -->
    <div class="total-layout">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="total-frame">
            <el-icon class="total-icon" :size="60" color="#409EFF">
              <ShoppingCart />
            </el-icon>
            <div class="total-title">今日订单总数</div>
            <div class="total-value">{{ todayOrderCount }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <el-icon class="total-icon" :size="60" color="#67C23A">
              <Money />
            </el-icon>
            <div class="total-title">今日销售总额</div>
            <div class="total-value">￥{{ todayAmount.toFixed(2) }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <el-icon class="total-icon" :size="60" color="#E6A23C">
              <TrendCharts />
            </el-icon>
            <div class="total-title">昨日销售总额</div>
            <div class="total-value">￥{{ yesterdayAmount.toFixed(2) }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 二维码区域 -->
    <el-card class="mine-layout">
      <div style="text-align: center">
        <img
          width="150px"
          height="150px"
          src="http://macro-oss.oss-cn-shenzhen.aliyuncs.com/mall/banner/qrcode_for_macrozheng_258.jpg"
        />
      </div>
      <div style="text-align: center">mall全套学习教程连载中！</div>
      <div style="margin-top: 5px; text-align: center">
        <span class="color-main">关注公号</span>，第一时间获取。
      </div>
    </el-card>

    <!-- 待处理事务区域 -->
    <div class="un-handle-layout">
      <div class="layout-title">待处理事务</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待付款订单</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.pendingPayment }})</span
              >
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">已完成订单</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.completed }})</span
              >
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待确认收货订单</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.pendingConfirm }})</span
              >
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待发货订单</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.pendingDelivery }})</span
              >
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">新缺货登记</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.outOfStock }})</span
              >
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待处理退款申请</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.pendingRefund }})</span
              >
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">已发货订单</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.delivered }})</span
              >
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待处理退货订单</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.pendingReturn }})</span
              >
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">广告位即将到期</span>
              <span style="float: right" class="color-danger"
              >({{ orderStats.expiringSoon }})</span
              >
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 商品与用户总览区域 -->
    <div class="overview-layout">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="out-border">
            <div class="layout-title">商品总览</div>
            <div style="padding: 40px">
              <el-row>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ productStats.offShelf }}
                </el-col>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ productStats.onShelf }}
                </el-col>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ productStats.lowStock }}
                </el-col>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ productStats.total }}
                </el-col>
              </el-row>
              <el-row class="font-medium">
                <el-col :span="6" class="overview-item-title">已下架</el-col>
                <el-col :span="6" class="overview-item-title">已上架</el-col>
                <el-col :span="6" class="overview-item-title">库存紧张</el-col>
                <el-col :span="6" class="overview-item-title">全部商品</el-col>
              </el-row>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="out-border">
            <div class="layout-title">用户总览</div>
            <div style="padding: 40px">
              <el-row>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ memberStats.todayNew }}
                </el-col>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ memberStats.yesterdayNew }}
                </el-col>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ memberStats.monthNew }}
                </el-col>
                <el-col :span="6" class="color-danger overview-item-value">
                  {{ memberStats.total }}
                </el-col>
              </el-row>
              <el-row class="font-medium">
                <el-col :span="6" class="overview-item-title">今日新增</el-col>
                <el-col :span="6" class="overview-item-title">昨日新增</el-col>
                <el-col :span="6" class="overview-item-title">本月新增</el-col>
                <el-col :span="6" class="overview-item-title">会员总数</el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 订单统计区域 -->
    <div class="statistics-layout">
      <div class="layout-title">订单统计</div>
      <el-row>
        <el-col :span="4">
          <div style="padding: 20px">
            <div>
              <div class="stat-label">本月订单总数</div>
              <div class="stat-value">
                {{ statisticsData.monthOrders }}
              </div>
              <div>
                <span class="color-success" style="font-size: 14px">+10%</span>
                <span class="stat-compare">同比上月</span>
              </div>
            </div>
            <div style="margin-top: 20px">
              <div class="stat-label">本周订单总数</div>
              <div class="stat-value">
                {{ statisticsData.weekOrders }}
              </div>
              <div>
                <span class="color-danger" style="font-size: 14px">-10%</span>
                <span class="stat-compare">同比上周</span>
              </div>
            </div>
            <div style="margin-top: 20px">
              <div class="stat-label">今日订单总数</div>
              <div class="stat-value">
                {{ statisticsData.todayOrders }}
              </div>
              <div>
                <span class="color-success" style="font-size: 14px">+5%</span>
                <span class="stat-compare">同比昨日</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="20">
          <div class="chart-placeholder">
            <el-icon :size="80" color="#DCDFE6">
              <TrendCharts />
            </el-icon>
            <div class="placeholder-text">
              订单统计图表区域<br />
              <span class="placeholder-hint">
                (需要安装 ECharts 或其他图表库来展示数据趋势)
              </span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, Money, TrendCharts } from '@element-plus/icons-vue';
import { ref } from 'vue';

// 今日销售数据 (TODO: 从API获取)
const todayOrderCount = ref(200);
const todayAmount = ref(5000.0);
const yesterdayAmount = ref(5000.0);

// 待处理事务统计 (TODO: 从API获取)
const orderStats = ref({
  pendingPayment: 10,
  completed: 10,
  pendingConfirm: 10,
  pendingDelivery: 10,
  outOfStock: 10,
  pendingRefund: 10,
  delivered: 10,
  pendingReturn: 10,
  expiringSoon: 10,
});

// 商品统计 (TODO: 从API获取)
const productStats = ref({
  offShelf: 100,
  onShelf: 400,
  lowStock: 50,
  total: 500,
});

// 用户统计 (TODO: 从API获取)
const memberStats = ref({
  todayNew: 100,
  yesterdayNew: 200,
  monthNew: 1000,
  total: 5000,
});

// 订单统计数据 (TODO: 从API获取)
const statisticsData = ref({
  monthOrders: 10000,
  weekOrders: 1000,
  todayOrders: 100,
});
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
}

.address-layout {
  margin-top: 20px;
}

.out-border {
  padding: 20px;
  border: 1px solid var(--colorBorder);
  border-radius: 4px;
}

.layout-title {
  margin-bottom: 15px;
  color: var(--colorTextHeading);
  font-size: 16px;
  font-weight: 500;
}

.color-main {
  color: var(--colorPrimary);
}

.address-content {
  padding: 10px 0;
  text-align: center;

  a {
    color: var(--colorPrimary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.total-layout {
  margin-top: 20px;
}

.total-frame {
  padding: 30px 20px;
  transition: box-shadow 0.3s;
  border: 1px solid var(--colorBorder);
  border-radius: 4px;
  background: var(--colorBgContainer);
  text-align: center;

  &:hover {
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 0.1);
  }
}

.total-icon {
  margin-bottom: 15px;
}

.total-title {
  margin-top: 15px;
  color: var(--colorTextDescription);
  font-size: 14px;
}

.total-value {
  margin-top: 10px;
  color: var(--colorTextHeading);
  font-size: 28px;
  font-weight: bold;
}

.mine-layout {
  margin-top: 20px;
  padding: 20px;
}

.un-handle-layout {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--colorBorder);
  border-radius: 4px;
}

.un-handle-content {
  margin-top: 15px;
}

.un-handle-item {
  margin-bottom: 15px;
  padding: 15px 20px;
  transition: background 0.3s;
  border: 1px solid var(--colorBorderSecondary);
  border-radius: 4px;
  background: var(--colorBgLayout);

  &:hover {
    background: var(--colorFillQuaternary);
  }
}

.font-medium {
  font-size: 14px;
}

.color-danger {
  color: var(--colorDanger);
}

.color-success {
  color: var(--colorSuccess);
}

.overview-layout {
  margin-top: 20px;
}

.overview-item-value {
  margin-bottom: 15px;
  font-size: 32px;
  font-weight: bold;
  text-align: center;
}

.overview-item-title {
  color: var(--colorTextSecondary);
  font-size: 14px;
  text-align: center;
}

.statistics-layout {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--colorBorder);
  border-radius: 4px;
}

.stat-label {
  color: var(--colorTextDescription);
  font-size: 14px;
}

.stat-value {
  padding: 10px 0;
  color: var(--colorTextSecondary);
  font-size: 24px;
}

.stat-compare {
  color: var(--colorTextQuaternary);
  font-size: 14px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  border: 2px dashed var(--colorBorder);
  border-radius: 4px;
  background: var(--colorBgLayout);
}

.placeholder-text {
  margin-top: 20px;
  color: var(--colorTextDescription);
  font-size: 16px;
  line-height: 1.8;
  text-align: center;
}

.placeholder-hint {
  color: var(--colorTextDescription);
  font-size: 12px;
}
</style>
