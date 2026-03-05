<template>
  <view>
    <!-- 地址 -->
    <navigator url="/pages/address/address?source=1" class="address-section">
      <view class="order-content">
        <text class="yticon icon-shouhuodizhi"></text>
        <view class="cen">
          <view class="top">
            <text class="name">{{ currentAddress.name }}</text>
            <text class="mobile">{{ currentAddress.phoneNumber }}</text>
          </view>
          <text class="address">
            {{ currentAddress.province }} {{ currentAddress.city }}
            {{ currentAddress.region }}
            {{ currentAddress.detailAddress }}
          </text>
        </view>
        <text class="yticon icon-you"></text>
      </view>

      <image
        class="a-bg"
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAu4AAAAFCAYAAAAaAWmiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Rjk3RjkzMjM2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Rjk3RjkzMjQ2NzMxMTFFOUI4RkU4OEZGMDcxQzgzOEYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGOTdGOTMyMTY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGOTdGOTMyMjY3MzExMUU5QjhGRTg4RkYwNzFDODM4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PrEOZlQAAAiuSURBVHjazJp7bFvV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"
      ></image>
    </navigator>

    <view class="goods-section">
      <view class="g-header b-b">
        <text class="name">商品信息</text>
      </view>
      <!-- 商品列表 -->
      <view v-for="item in cartPromotionItemList" :key="item.id" class="g-item">
        <image :src="item.productPic"></image>
        <view class="right">
          <text class="title clamp">{{ item.productName }}</text>
          <text class="spec">{{ formatProductAttr(item.productAttr) }}</text>
          <text class="promotion clamp">{{ item.promotionMessage }}</text>
          <view class="price-box">
            <text class="price">￥{{ item.price }}</text>
            <text class="number">x {{ item.quantity }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 优惠明细 -->
    <view class="yt-list">
      <view class="yt-list-cell b-b" @click="toggleMask('show')">
        <view class="cell-icon"> 券 </view>
        <text class="cell-tit clamp">优惠券</text>
        <text class="cell-tip active"> 选择优惠券 </text>
        <text class="cell-more wanjia wanjia-gengduo-d"></text>
      </view>
      <view class="yt-list-cell b-b">
        <view class="cell-icon hb"> 积 </view>
        <text class="cell-tit clamp">积分抵扣</text>
        <input
          v-model="useIntegration"
          class="integration"
          type="number"
          placeholder="使用积分数量"
          placeholder-class="placeholder"
          @input="handleIntegrationInput"
        />
      </view>
    </view>
    <!-- 金额明细 -->
    <view class="yt-list">
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">商品合计</text>
        <text class="cell-tip">￥{{ calcAmount.totalAmount }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">运费</text>
        <text class="cell-tip">￥{{ calcAmount.freightAmount }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">活动优惠</text>
        <text class="cell-tip red">-￥{{ calcAmount.promotionAmount }}</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">优惠券</text>
        <text v-if="currCoupon != null" class="cell-tip red"
          >-￥{{ currCoupon.amount }}</text
        >
        <text v-else class="cell-tip red">-￥0</text>
      </view>
      <view class="yt-list-cell b-b">
        <text class="cell-tit clamp">积分抵扣</text>
        <text class="cell-tip red"
          >-￥{{ calcIntegrationAmount(useIntegration) }}</text
        >
      </view>
      <view class="yt-list-cell desc-cell">
        <text class="cell-tit clamp">备注</text>
        <input
          v-model="desc"
          class="desc"
          type="text"
          placeholder="请填写备注信息"
          placeholder-class="placeholder"
        />
      </view>
    </view>

    <!-- 底部 -->
    <view class="footer">
      <view class="price-content">
        <text>实付款</text>
        <text class="price-tip">￥</text>
        <text class="price">{{ calcAmount.payAmount }}</text>
      </view>
      <text class="submit" @click="submit">提交订单</text>
    </view>

    <!-- 优惠券面板 -->
    <view
      class="mask"
      :class="maskState === 0 ? 'none' : maskState === 1 ? 'show' : ''"
      @click="toggleMask()"
    >
      <view class="mask-content" @click.stop.prevent="stopPrevent">
        <!-- 优惠券页面，仿mt -->
        <view
          v-for="(item, index) in couponList"
          :key="index"
          class="coupon-item"
          @click="selectCoupon(item)"
        >
          <view class="con">
            <view class="left">
              <text class="title">{{ item.name }}</text>
              <text class="time"
                >有效期至{{ formatDateTime(item.endTime) }}</text
              >
            </view>
            <view class="right">
              <text class="price">{{ item.amount }}</text>
              <text>满{{ item.minPoint }}可用</text>
            </view>

            <view class="circle l"></view>
            <view class="circle circle-right"></view>
          </view>
          <text class="tips">{{ formatCouponUseType(item.useType) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '确认订单',
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { OrderService } from '@/api';
import { formatDateTime } from '@/utils/formatters';

/**
 * 创建订单页面（订单确认页）
 * 展示订单确认信息，包括收货地址、商品列表、优惠券、积分抵扣、金额明细
 * 支持选择优惠券、使用积分、填写备注、提交订单
 */

/** 收货地址接口 */
interface Address {
  id?: number;
  name?: string;
  phoneNumber?: string;
  province?: string;
  city?: string;
  region?: string;
  detailAddress?: string;
  defaultStatus?: number;
}

/** 购物车促销商品接口 */
interface CartPromotionItem {
  id: number;
  productPic: string;
  productName: string;
  productAttr: string;
  promotionMessage?: string;
  price: number;
  quantity: number;
}

/** 优惠券接口 */
interface Coupon {
  id: number;
  name: string;
  endTime: string;
  amount: number;
  minPoint: number;
  useType: number;
}

/** 计算金额接口 */
interface CalcAmount {
  totalAmount?: number;
  freightAmount?: number;
  promotionAmount?: number;
  payAmount?: number;
}

/** 积分消费设置接口 */
interface IntegrationConsumeSetting {
  couponStatus?: number;
  deductionPerAmount?: number;
}

/** 商品属性项 */
interface ProductAttrItem {
  key: string;
  value: string;
}

/** 优惠券面板显示状态 */
const maskState = ref<0 | 1 | 2>(0);
/** 备注 */
const desc = ref('');
/** 支付类型 */
const payType = ref(1);
/** 优惠券列表 */
const couponList = ref<Coupon[]>([]);
/** 收货地址列表 */
const memberReceiveAddressList = ref<Address[]>([]);
/** 当前选中地址 */
const currentAddress = reactive<Address>({});
/** 购物车促销商品列表 */
const cartPromotionItemList = ref<CartPromotionItem[]>([]);
/** 计算金额 */
const calcAmount = reactive<CalcAmount>({});
/** 当前选中优惠券 */
const currCoupon = ref<Coupon | null>(null);
/** 使用积分数量 */
const useIntegration = ref(0);
/** 积分消费设置 */
const integrationConsumeSetting = ref<IntegrationConsumeSetting>({});
/** 会员积分 */
const memberIntegration = ref(0);
/** 购物车ID列表 */
const cartIds = ref<number[]>([]);

/**
 * 页面加载
 */
onLoad((option) => {
  cartIds.value = JSON.parse(option.cartIds);
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
 * 格式化优惠券使用类型
 */
const formatCouponUseType = (useType: number): string => {
  const typeMap: Record<number, string> = {
    0: '全场通用',
    1: '指定分类商品可用',
    2: '指定商品可用',
  };
  return typeMap[useType] || '';
};

/**
 * 生成确认单信息
 */
const loadData = async () => {
  try {
    const response = await OrderService.generateConfirmOrder(
      JSON.stringify(cartIds.value),
    );
    memberReceiveAddressList.value =
      response.data.memberReceiveAddressList || [];
    Object.assign(currentAddress, getDefaultAddress());
    cartPromotionItemList.value = response.data.cartPromotionItemList || [];
    couponList.value = [];
    for (const item of response.data.couponHistoryDetailList || []) {
      couponList.value.push(item.coupon);
    }
    Object.assign(calcAmount, response.data.calcAmount || {});
    integrationConsumeSetting.value =
      response.data.integrationConsumeSetting || {};
    memberIntegration.value = response.data.memberIntegration || 0;
  } catch (error) {
    console.error('加载订单确认信息失败:', error);
  }
};

/**
 * 显示/隐藏优惠券面板
 */
const toggleMask = (type?: 'show') => {
  const timer = type === 'show' ? 10 : 300;
  const state = type === 'show' ? 1 : 0;
  maskState.value = 2;
  setTimeout(() => {
    maskState.value = state as 0 | 1;
  }, timer);
};

/**
 * 提交订单
 */
const submit = async () => {
  const orderParam: any = {
    payType: 0,
    couponId: null,
    cartIds: cartIds.value,
    memberReceiveAddressId: currentAddress.id,
    useIntegration: useIntegration.value,
  };
  if (currCoupon.value != null) {
    orderParam.couponId = currCoupon.value.id;
  }

  try {
    const response = await OrderService.generateOrder(orderParam);
    const orderId = response.data.order.id;
    uni.showModal({
      title: '提示',
      content: '订单创建成功，是否要立即支付？',
      confirmText: '去支付',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.redirectTo({
            url: `/pages/money/pay?orderId=${orderId}`,
          });
        } else if (res.cancel) {
          uni.redirectTo({
            url: '/pages-sub/order/order?state=0',
          });
        }
      },
    });
  } catch (error) {
    console.error('创建订单失败:', error);
  }
};

/**
 * 防止事件冒泡
 */
const stopPrevent = () => {};

/**
 * 获取默认收货地址
 */
const getDefaultAddress = (): Address => {
  for (const item of memberReceiveAddressList.value) {
    if (item.defaultStatus == 1) {
      return item;
    }
  }
  if (
    memberReceiveAddressList.value != null &&
    memberReceiveAddressList.value.length > 0
  ) {
    return memberReceiveAddressList.value[0];
  }
  return {};
};

/**
 * 选择优惠券
 */
const selectCoupon = (coupon: Coupon) => {
  currCoupon.value = coupon;
  calcPayAmount();
  toggleMask();
};

/**
 * 计算支付金额
 */
const calcPayAmount = () => {
  calcAmount.payAmount =
    (calcAmount.totalAmount || 0) +
    (calcAmount.freightAmount || 0) -
    (calcAmount.promotionAmount || 0);
  if (currCoupon.value != null) {
    calcAmount.payAmount = calcAmount.payAmount - currCoupon.value.amount;
  }
  if (useIntegration.value != 0) {
    calcAmount.payAmount =
      calcAmount.payAmount - calcIntegrationAmount(useIntegration.value);
  }
};

/**
 * 积分转金额
 */
const calcIntegrationAmount = (integration: number): number => {
  if (
    integrationConsumeSetting.value == undefined ||
    integrationConsumeSetting.value == null
  ) {
    return 0;
  }
  if (integrationConsumeSetting.value.couponStatus == 0) {
    return 0;
  }
  return (
    integration / (integrationConsumeSetting.value.deductionPerAmount || 1)
  );
};

/**
 * 积分输入处理
 */
const handleIntegrationInput = (event: any) => {
  if (event.detail.value > memberIntegration.value) {
    useIntegration.value = memberIntegration.value;
    uni.showToast({
      title: `您的积分只有${memberIntegration.value}`,
      duration: 1000,
      icon: 'none',
    });
  }
};
</script>

<style lang="scss" scoped>
page {
  padding-bottom: 100upx;
  background: #f8f8f8;
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

  .icon-you {
    margin-right: 30upx;
    color: #999;
    font-size: 32upx;
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

  .cell-icon {
    width: 32upx;
    height: 32upx;
    margin-right: 12upx;
    border-radius: 4upx;
    background: #f85e52;
    color: #fff;
    font-size: 22upx;
    line-height: 32upx;
    text-align: center;

    &.hb {
      background: #ffaa0e;
    }
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

    &.active {
      color: #fa436a;
    }

    &.red {
      color: #fa436a;
    }
  }

  &.desc-cell {
    .cell-tit {
      max-width: 90upx;
    }
  }

  .desc {
    flex: 1;
    color: #333;
    font-size: 28upx;
  }

  .integration {
    flex: 1;
    color: #333;
    font-size: 28upx;
    text-align: right;
  }
}

.footer {
  display: flex;
  position: fixed;
  z-index: 998;
  bottom: 0;
  left: 0;
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

  .submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 280upx;
    height: 100%;
    background-color: #fa436a;
    color: #fff;
    font-size: 32upx;
  }
}

/* 优惠券面板 */
.mask {
  display: flex;
  position: fixed;
  z-index: 9995;
  top: var(--window-top);
  bottom: 0;
  left: 0;
  align-items: flex-end;
  width: 100%;
  transition: 0.3s;
  background: rgba(0, 0, 0, 0);

  .mask-content {
    width: 100%;
    min-height: 30vh;
    max-height: 70vh;
    overflow-y: scroll;
    transform: translateY(100%);
    transition: 0.3s;
    background: #f3f3f3;
  }

  &.none {
    display: none;
  }

  &.show {
    background: rgba(0, 0, 0, 0.4);

    .mask-content {
      transform: translateY(0);
    }
  }
}

/* 优惠券列表 */
.coupon-item {
  display: flex;
  flex-direction: column;
  margin: 20upx 24upx;
  background: #fff;

  .con {
    display: flex;
    position: relative;
    align-items: center;
    height: 120upx;
    padding: 0 30upx;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 0;
      transform: scaleY(50%);
      border-bottom: 1px dashed #f3f3f3;
    }
  }

  .left {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    height: 100upx;
    overflow: hidden;
  }

  .title {
    margin-bottom: 10upx;
    color: #333;
    font-size: 32upx;
  }

  .time {
    color: #999;
    font-size: 24upx;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100upx;
    color: #666;
    font-size: 26upx;
  }

  .price {
    color: #fa436a;
    font-size: 44upx;

    &::before {
      content: '￥';
      font-size: 34upx;
    }
  }

  .tips {
    padding-left: 30upx;
    color: #999;
    font-size: 24upx;
    line-height: 60upx;
  }

  .circle {
    position: absolute;
    z-index: 10;
    bottom: -10upx;
    left: -6upx;
    width: 20upx;
    height: 20upx;
    border-radius: 100px;
    background: #f3f3f3;

    &.circle-right {
      right: -6upx;
      left: auto;
    }
  }
}
</style>
