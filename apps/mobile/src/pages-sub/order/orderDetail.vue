<template>
  <view>
    <view class="status-section">
      <image :src="orderStatus.image" class="icon" />
      <text class="label-text">{{ orderStatus.text }}</text>
    </view>
    <!-- 地址 -->
    <view class="address-section">
      <view class="order-content">
        <text class="yticon icon-shouhuodizhi"></text>
        <view class="cen">
          <view class="top">
            <text class="name">{{ order.receiverName }}</text>
            <text class="mobile">{{ order.receiverPhone }}</text>
          </view>
          <text class="address">
            {{ order.receiverProvince }} {{ order.receiverCity }}
            {{ order.receiverRegion }}
            {{ order.receiverDetailAddress }}
          </text>
        </view>
      </view>

      <image
        class="a-bg"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAAFCAYAAAAaAWmiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Rjk3RjkzMjM2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Rjk3RjkzMjQ2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGOTdGOTMyMTY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGOTdGOTMyMjY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrEOZlQAAAiuSURBVHjazJp7bFvV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"
      ></image>
    </view>

    <view class="goods-section">
      <view class="g-header b-b">
        <text class="name">商品信息</text>
      </view>
      <!-- 商品列表 -->
      <view v-for="item in order.orderItemList" :key="item.id" class="g-item">
        <image :src="item.productPic"></image>
        <view class="right">
          <text class="title clamp">{{ item.productName }}</text>
          <text class="spec">{{ formatProductAttr(item.productAttr) }}</text>
          <text class="promotion clamp">{{ item.promotionName }}</text>
          <view class="price-box">
            <text class="price">￥{{ item.productPrice }}</text>
            <text class="number">x {{ item.productQuantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 金额明细 -->
    <view class="yt-list">
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">商品合计</text>
        <text class="cell-tip">￥{{ order.totalAmount }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">运费</text>
        <text class="cell-tip">￥{{ order.freightAmount }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">活动优惠</text>
        <text class="cell-tip red">-￥{{ order.promotionAmount }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">优惠券</text>
        <text class="cell-tip red">-￥{{ order.couponAmount }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">积分抵扣</text>
        <text class="cell-tip red">-￥{{ order.integrationAmount }}</text>
      </view>
      <view class="yt-list-cell desc-cell">
        <text class="cell-tit clamp">备注</text>
        <text class="cell-tip">{{ order.note }}</text>
      </view>
    </view>

    <!-- 订单明细 -->
    <view class="yt-list">
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">订单编号</text>
        <text class="cell-tip">{{ order.orderSn }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">提交时间</text>
        <text class="cell-tip">{{ formatDateTime(order.createTime) }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">支付方式</text>
        <text class="cell-tip">{{ formatPayType(order.payType) }}</text>
      </view>
      <view
        v-if="order.status == 1 || order.status == 2 || order.status == 3"
        class="yt-list-cell b-b"
      >
        <text class="cell-tit clamp">实付金额</text>
        <text class="cell-tip">￥{{ order.payAmount }}</text>
      </view>
      <view
        v-if="order.status == 1 || order.status == 2 || order.status == 3"
        class="yt-list-cell b-b"
      >
        <text class="cell-tit clamp">付款时间</text>
        <text class="cell-tip">{{ formatDateTime(order.paymentTime) }}</text>
      </view>
    </view>

    <!-- 底部 -->
    <view
      v-if="order.status == 0 || order.status == 2 || order.status == 3"
      class="footer"
    >
      <view v-if="order.status == 0" class="action-box b-t">
        <button class="action-btn" @click="cancelOrder(order.id)">
          取消订单
        </button>
        <button class="action-btn recom" @click="payOrder(order.id)">
          立即付款
        </button>
      </view>
      <view v-if="order.status == 2" class="action-box b-t">
        <button class="action-btn">查看物流</button>
        <button class="action-btn recom" @click="receiveOrder(order.id)">
          确认收货
        </button>
      </view>
      <view v-if="order.status == 3" class="action-box b-t">
        <button class="action-btn">申请售后</button>
        <button class="action-btn recom">评价商品</button>
      </view>
      <view v-if="order.status == 0" class="price-content">
        <text>应付金额</text>
        <text class="price-tip">￥</text>
        <text class="price">{{ order.payAmount }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '订单详情',
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { OrderService } from '@/api';
import { formatDateTime } from '@/utils/formatters';

/**
 * 订单详情页面
 * 展示订单的完整信息，包括收货地址、商品列表、金额明细、订单信息
 * 支持订单操作（取消、支付、确认收货）
 */

/** 订单商品项 */
interface OrderItem {
  id: number;
  productPic: string;
  productName: string;
  productAttr: string;
  promotionName?: string;
  productPrice: number;
  productQuantity: number;
}

/** 订单接口 */
interface Order {
  id?: number;
  orderSn?: string;
  createTime?: string;
  status?: number;
  receiverName?: string;
  receiverPhone?: string;
  receiverProvince?: string;
  receiverCity?: string;
  receiverRegion?: string;
  receiverDetailAddress?: string;
  orderItemList?: OrderItem[];
  totalAmount?: number;
  freightAmount?: number;
  promotionAmount?: number;
  couponAmount?: number;
  integrationAmount?: number;
  note?: string;
  payType?: number;
  payAmount?: number;
  paymentTime?: string;
}

/** 订单状态 */
interface OrderStatus {
  text: string;
  image: string;
}

/** 商品属性项 */
interface ProductAttrItem {
  key: string;
  value: string;
}

/** 订单ID */
const orderId = ref<number | null>(null);
/** 订单信息 */
const order = reactive<Order>({});
/** 订单状态 */
const orderStatus = reactive<OrderStatus>({
  text: '',
  image: '',
});

/**
 * 页面加载
 */
onLoad((option) => {
  orderId.value = Number(option.orderId);
  loadData();
});

/**
 * 格式化商品属性
 */
const formatProductAttr = (jsonAttr: string): string => {
  try {
    const attrArr: ProductAttrItem[] = JSON.parse(jsonAttr);
    let attrStr = '';
    for (const attr of attrArr) {
      attrStr += `${attr.key}:${attr.value};`;
    }
    return attrStr;
  } catch (error) {
    return '';
  }
};

/**
 * 格式化支付类型
 */
const formatPayType = (payType?: number): string => {
  const payTypeMap: Record<number, string> = {
    0: '未支付',
    1: '支付宝支付',
    2: '微信支付',
  };
  return payTypeMap[payType || 0] || '';
};

/**
 * 加载订单详情
 */
const loadData = async () => {
  if (!orderId.value) return;

  try {
    const response = await OrderService.fetchOrderDetail(orderId.value);
    Object.assign(order, response.data);
    setOrderStatus(order.status || 0);
  } catch (error) {
    console.error('加载订单详情失败:', error);
  }
};

/**
 * 取消订单
 */
const cancelOrder = (orderIdParam: number) => {
  uni.showModal({
    title: '提示',
    content: '是否要取消该订单？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '请稍后' });
        try {
          await OrderService.cancelUserOrder({ orderId: orderIdParam });
          uni.hideLoading();
          loadData();
        } catch (error) {
          console.error('取消订单失败:', error);
          uni.hideLoading();
        }
      }
    },
  });
};

/**
 * 支付订单
 */
const payOrder = (orderIdParam: number) => {
  uni.redirectTo({
    url: `/pages/money/pay?orderId=${orderIdParam}`,
  });
};

/**
 * 确认收货
 */
const receiveOrder = (orderIdParam: number) => {
  uni.showModal({
    title: '提示',
    content: '是否要确认收货？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '请稍后' });
        try {
          await OrderService.confirmReceiveOrder({ orderId: orderIdParam });
          uni.hideLoading();
          loadData();
        } catch (error) {
          console.error('确认收货失败:', error);
          uni.hideLoading();
        }
      }
    },
  });
};

/**
 * 设置订单状态信息
 */
const setOrderStatus = (status: number) => {
  const statusMap: Record<number, OrderStatus> = {
    0: { text: '等待付款', image: '/static/icon_wait.png' },
    1: { text: '等待发货', image: '/static/icon_deliver.png' },
    2: { text: '等待收货', image: '/static/icon_receive.png' },
    3: { text: '交易完成', image: '/static/icon_finish.png' },
    4: { text: '交易关闭', image: '/static/icon_close.png' },
  };
  Object.assign(orderStatus, statusMap[status] || statusMap[0]);
};
</script>

<style lang="scss" scoped>
page {
  padding-bottom: 100upx;
  background: #f8f8f8;
}

.status-section {
  display: flex;
  align-items: center;
  height: 200upx;
  padding: 30upx;
  background-color: #fa436a;

  .icon {
    width: 48upx;
    height: 48upx;
  }

  .label-text {
    margin-left: 30upx;
    color: #fff;
  }
}

.address-section {
  position: relative;
  padding: 30upx 0;
  background: #fff;

  .order-content {
    display: flex;
    align-items: center;
  }

  .icon-shouhuodizhi {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 90upx;
    color: #888;
    font-size: 44upx;
  }

  .cen {
    display: flex;
    flex: 1;
    flex-direction: column;
    color: #333;
    font-size: 28upx;
  }

  .name {
    margin-right: 24upx;
    font-size: 34upx;
  }

  .address {
    margin-top: 16upx;
    margin-right: 20upx;
    color: #999;
  }

  .a-bg {
    display: block;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 5upx;
  }
}

.goods-section {
  margin-top: 16upx;
  padding-bottom: 1px;
  background: #fff;

  .g-header {
    display: flex;
    position: relative;
    align-items: center;
    height: 84upx;
    padding: 0 30upx;
  }

  .name {
    margin-left: 24upx;
    color: #666;
    font-size: 30upx;
  }

  .g-item {
    display: flex;
    margin: 20upx 30upx;

    image {
      display: block;
      flex-shrink: 0;
      width: 140upx;
      height: 140upx;
      border-radius: 4upx;
    }

    .right {
      flex: 1;
      padding-left: 24upx;
      overflow: hidden;
    }

    .title {
      color: #333;
      font-size: 30upx;
    }

    .spec {
      color: #999;
      font-size: 26upx;
    }

    .promotion {
      color: #fa436a;
      font-size: 24upx;
    }

    .price-box {
      display: flex;
      align-items: center;
      padding-top: 10upx;
      color: #333;
      font-size: 32upx;

      .price {
        margin-bottom: 4upx;
      }

      .number {
        margin-left: 20upx;
        color: #666;
        font-size: 26upx;
      }
    }
  }
}

.yt-list {
  margin-top: 16upx;
  background: #fff;
}

.yt-list-cell {
  display: flex;
  position: relative;
  align-items: center;
  padding: 10upx 30upx 10upx 40upx;
  line-height: 70upx;

  &.b-b::after {
    left: 30upx;
  }

  .cell-tit {
    flex: 1;
    margin-right: 10upx;
    color: #999;
    font-size: 26upx;
  }

  .cell-tip {
    color: #333;
    font-size: 26upx;

    &.red {
      color: #fa436a;
    }
  }

  &.desc-cell {
    .cell-tit {
      max-width: 90upx;
    }
  }
}

.footer {
  display: flex;
  position: fixed;
  z-index: 998;
  bottom: 0;
  left: 0;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 90upx;
  background-color: #fff;
  box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
  color: #666;
  font-size: 30upx;

  .price-content {
    padding-left: 30upx;
  }

  .price-tip {
    margin-left: 8upx;
    color: #fa436a;
  }

  .price {
    color: #fa436a;
    font-size: 36upx;
  }
}

.action-box {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: flex-end;
  height: 100upx;
  padding-right: 30upx;
}

.action-btn {
  width: 160upx;
  height: 60upx;
  margin: 0;
  margin-left: 24upx;
  padding: 0;
  border-radius: 100px;
  background: #fff;
  color: #333;
  font-size: 26upx;
  line-height: 60upx;
  text-align: center;

  &::after {
    border-radius: 100px;
  }

  &.recom {
    background: #fff9f9;
    color: #fa436a;

    &::after {
      border-color: #f7bcc8;
    }
  }
}
</style>
