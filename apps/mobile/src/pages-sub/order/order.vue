<template>
  <view class="content">
    <view class="navbar">
      <view
        v-for="(item, index) in navList"
        :key="index"
        class="nav-item"
        :class="{ current: tabCurrentIndex === index }"
        @click="tabClick(index)"
      >
        {{ item.text }}
      </view>
    </view>

    <swiper
      :current="tabCurrentIndex"
      class="swiper-box"
      duration="300"
      @change="changeTab"
    >
      <swiper-item
        v-for="(tabItem, tabIndex) in navList"
        :key="tabIndex"
        class="tab-content"
      >
        <scroll-view
          class="list-scroll-content"
          scroll-y
          @scrolltolower="loadData('add')"
        >
          <!-- 空白页 -->
          <empty v-if="orderList == null || orderList.length === 0"></empty>

          <!-- 订单列表 -->
          <view
            v-for="(item, index) in orderList"
            :key="index"
            class="order-item"
          >
            <view class="i-top b-b">
              <text class="time" @click="showOrderDetail(item.id)">
                {{ formatDateTime(item.createTime) }}
              </text>
              <text class="state" :style="{ color: '#fa436a' }">
                {{ formatStatus(item.status) }}
              </text>
              <text
                v-if="item.status === 3 || item.status === 4"
                class="del-btn yticon icon-iconfontshanchu1"
                @click="deleteOrder(item.id)"
              ></text>
            </view>
            <view
              v-for="(orderItem, itemIndex) in item.orderItemList"
              :key="itemIndex"
              class="goods-box-single"
            >
              <image
                class="goods-img"
                :src="orderItem.productPic"
                mode="aspectFill"
              ></image>
              <view class="right">
                <text class="title clamp">{{ orderItem.productName }}</text>
                <text class="attr-box">
                  {{ formatProductAttr(orderItem.productAttr) }} x
                  {{ orderItem.productQuantity }}
                </text>
                <text class="price">{{ orderItem.productPrice }}</text>
              </view>
            </view>

            <view class="price-box">
              共
              <text class="num">{{ calcTotalQuantity(item) }}</text>
              件商品 实付款
              <text class="price">{{ item.payAmount }}</text>
            </view>
            <view v-if="item.status == 0" class="action-box b-t">
              <button class="action-btn" @click="cancelOrder(item.id)">
                取消订单
              </button>
              <button class="action-btn recom" @click="payOrder(item.id)">
                立即付款
              </button>
            </view>
            <view v-if="item.status == 2" class="action-box b-t">
              <button class="action-btn">查看物流</button>
              <button class="action-btn recom" @click="receiveOrder(item.id)">
                确认收货
              </button>
            </view>
            <view v-if="item.status == 3" class="action-box b-t">
              <button class="action-btn recom">评价商品</button>
            </view>
          </view>

          <uni-load-more :status="loadingType"></uni-load-more>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '我的订单',
    'app-plus': {
      bounce: 'none',
    },
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { OrderService } from '@/api';
import empty from '@/components/empty.vue';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import { formatDateTime } from '@/utils/formatters';

/**
 * 订单列表页面
 * 支持按订单状态筛选（全部、待付款、待收货、已完成、已取消）
 * 支持订单操作（取消、支付、确认收货、删除、查看详情）
 */

/** 订单项中的商品 */
interface OrderItem {
  productPic: string;
  productName: string;
  productAttr: string;
  productQuantity: number;
  productPrice: number;
}

/** 订单接口 */
interface Order {
  id: number;
  createTime: string;
  status: number;
  orderItemList: OrderItem[];
  payAmount: number;
}

/** 订单属性项 */
interface ProductAttrItem {
  key: string;
  value: string;
}

/** 搜索参数接口 */
interface OrderParam {
  status: number;
  pageNum: number;
  pageSize: number;
}

/** 导航项接口 */
interface NavItem {
  state: number;
  text: string;
}

/** 当前tab索引 */
const tabCurrentIndex = ref(0);
/** 订单参数 */
const orderParam = reactive<OrderParam>({
  status: -1,
  pageNum: 1,
  pageSize: 5,
});
/** 订单列表 */
const orderList = ref<Order[]>([]);
/** 加载更多状态 */
const loadingType = ref<'more' | 'loading' | 'nomore'>('more');
/** 导航列表 */
const navList: NavItem[] = [
  { state: -1, text: '全部' },
  { state: 0, text: '待付款' },
  { state: 2, text: '待收货' },
  { state: 3, text: '已完成' },
  { state: 4, text: '已取消' },
];

/**
 * 页面加载
 */
onLoad((options) => {
  tabCurrentIndex.value = +(options?.state || 0);
  // #ifndef MP
  loadData();
  // #endif
  // #ifdef MP
  if (options?.state == 0) {
    loadData();
  }
  // #endif
});

/**
 * 格式化订单状态
 */
const formatStatus = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: '等待付款',
    1: '等待发货',
    2: '等待收货',
    3: '交易完成',
    4: '交易关闭',
  };
  return statusMap[status] || '';
};

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
 * 获取订单列表
 */
const loadData = async (type: 'refresh' | 'add' = 'refresh') => {
  if (type === 'refresh') {
    orderParam.pageNum = 1;
  } else {
    orderParam.pageNum++;
  }

  const index = tabCurrentIndex.value;
  const navItem = navList[index];

  if (loadingType.value === 'loading') {
    // 防止重复加载
    return;
  }

  orderParam.status = navItem.state;
  loadingType.value = 'loading';

  try {
    const response = await OrderService.fetchOrderList(orderParam);
    const list = response.data.list || [];

    if (type === 'refresh') {
      orderList.value = list;
      loadingType.value = 'more';
    } else {
      if (list.length > 0) {
        orderList.value = orderList.value.concat(list);
        loadingType.value = 'more';
      } else {
        orderParam.pageNum--;
        loadingType.value = 'nomore';
      }
    }
  } catch (error) {
    console.error('加载订单列表失败:', error);
    loadingType.value = 'more';
  }
};

/**
 * swiper切换
 */
const changeTab = (e: any) => {
  tabCurrentIndex.value = e.target.current;
  loadData();
};

/**
 * 顶部tab点击
 */
const tabClick = (index: number) => {
  tabCurrentIndex.value = index;
};

/**
 * 删除订单
 */
const deleteOrder = (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '是否要删除该订单？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '请稍后' });
        try {
          await OrderService.deleteUserOrder({ orderId });
          uni.hideLoading();
          loadData();
        } catch (error) {
          console.error('删除订单失败:', error);
          uni.hideLoading();
        }
      }
    },
  });
};

/**
 * 取消订单
 */
const cancelOrder = (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '是否要取消该订单？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '请稍后' });
        try {
          await OrderService.cancelUserOrder({ orderId });
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
const payOrder = (orderId: number) => {
  uni.redirectTo({
    url: `/pages/money/pay?orderId=${orderId}`,
  });
};

/**
 * 确认收货
 */
const receiveOrder = (orderId: number) => {
  uni.showModal({
    title: '提示',
    content: '是否要确认收货？',
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '请稍后' });
        try {
          await OrderService.confirmReceiveOrder({ orderId });
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
 * 查看订单详情
 */
const showOrderDetail = (orderId: number) => {
  uni.navigateTo({
    url: `/pages-sub/order/orderDetail?orderId=${orderId}`,
  });
};

/**
 * 计算商品总数量
 */
const calcTotalQuantity = (order: Order): number => {
  let totalQuantity = 0;
  if (order.orderItemList && order.orderItemList.length > 0) {
    for (const item of order.orderItemList) {
      totalQuantity += item.productQuantity;
    }
  }
  return totalQuantity;
};
</script>

<style lang="scss" scoped>
page,
.content {
  height: 100%;
  background: #f8f8f8;
}

.swiper-box {
  height: calc(100% - 40px);
}

.list-scroll-content {
  height: 100%;
}

.navbar {
  display: flex;
  position: relative;
  z-index: 10;
  height: 40px;
  padding: 0 5px;
  background: #fff;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);

  .nav-item {
    display: flex;
    position: relative;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #333;
    font-size: 15px;

    &.current {
      color: #fa436a;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 44px;
        height: 0;
        transform: translateX(-50%);
        border-bottom: 2px solid #fa436a;
      }
    }
  }
}

.order-item {
  display: flex;
  flex-direction: column;
  margin-top: 16upx;
  padding-left: 30upx;
  background: #fff;

  .i-top {
    display: flex;
    position: relative;
    align-items: center;
    height: 80upx;
    padding-right: 30upx;
    color: #333;
    font-size: 28upx;

    .time {
      flex: 1;
    }

    .state {
      color: #fa436a;
    }

    .del-btn {
      position: relative;
      padding: 10upx 0 10upx 36upx;
      color: #999;
      font-size: 36upx;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 20upx;
        width: 0;
        height: 30upx;
        transform: translateY(-50%);
        border-left: 1px solid #ddd;
      }
    }
  }

  /* 单条商品 */
  .goods-box-single {
    display: flex;
    padding: 20upx 0;

    .goods-img {
      display: block;
      width: 120upx;
      height: 120upx;
    }

    .right {
      display: flex;
      flex: 1;
      flex-direction: column;
      padding: 0 30upx 0 24upx;
      overflow: hidden;

      .title {
        color: #333;
        font-size: 30upx;
        line-height: 1;
      }

      .attr-box {
        padding: 10upx 12upx;
        color: #999;
        font-size: 26upx;
      }

      .price {
        color: #333;
        font-size: 30upx;

        &::before {
          content: '￥';
          margin: 0 2upx 0 8upx;
          font-size: 24upx;
        }
      }
    }
  }

  .price-box {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    padding: 20upx 30upx;
    color: #999;
    font-size: 26upx;

    .num {
      margin: 0 8upx;
      color: #333;
    }

    .price {
      color: #333;
      font-size: 36upx;

      &::before {
        content: '￥';
        margin: 0 2upx 0 8upx;
        font-size: 24upx;
      }
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
}
</style>
