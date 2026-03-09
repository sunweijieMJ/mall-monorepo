<template>
  <view class="app">
    <view class="price-box">
      <text>支付金额</text>
      <text class="price">{{ orderInfo.payAmount }}</text>
    </view>

    <view class="pay-type-list">
      <view class="type-item b-b" @click="changePayType(1)">
        <text class="icon yticon icon-alipay"></text>
        <view class="con">
          <text class="tit">支付宝支付</text>
          <text>推荐使用支付宝支付</text>
        </view>
        <label class="radio">
          <radio value="" color="#fa436a" :checked="payType == 1" />
        </label>
      </view>
      <view class="type-item b-b" @click="changePayType(2)">
        <text class="icon yticon icon-weixinzhifu"></text>
        <view class="con">
          <text class="tit">微信支付</text>
        </view>
        <label class="radio">
          <radio value="" color="#fa436a" :checked="payType == 2" />
        </label>
      </view>
    </view>

    <text class="mix-btn" @click="confirm">确认支付</text>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '支付',
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { paymentControllerCreateAlipayPaymentV1 } from '@/api';
import { API_CONFIG } from '@/constants';
import { useOrderStore } from '@/store';

const orderStore = useOrderStore();

/**
 * 支付页面
 * 支持支付宝和微信支付
 * 根据配置决定是否使用真实支付或模拟支付
 */

/** 订单信息接口 */
interface OrderInfo {
  payAmount?: number;
  orderSn?: string;
  receiverName?: string;
  totalAmount?: number;
}

/** 订单ID */
const orderId = ref<number | null>(null);
/** 支付方式 1:支付宝 2:微信 */
const payType = ref(1);
/** 订单信息 */
const orderInfo = reactive<OrderInfo>({});

/**
 * 页面加载
 */
onLoad((options) => {
  orderId.value = +(options?.orderId || 0);
  orderStore
    .fetchDetail(orderId.value)
    .then((data) => {
      Object.assign(orderInfo, data);
    })
    .catch((error) => {
      console.error('加载订单详情失败:', error);
    });
});

/**
 * 选择支付方式
 */
const changePayType = (type: number) => {
  payType.value = type;
};

/**
 * 确认支付
 */
const confirm = async () => {
  if (API_CONFIG.USE_ALIPAY) {
    if (payType.value != 1) {
      uni.showToast({
        title: '暂不支持微信支付！',
        icon: 'none',
      });
      return;
    }
    // #ifdef H5
    paymentControllerCreateAlipayPaymentV1({
      orderId: orderId.value!,
      payType: payType.value,
    })
      .then((res) => {
        const payUrl = res.data as unknown as string;
        if (payUrl) {
          window.location.href = payUrl;
        }
      })
      .catch((error) => {
        console.error('创建支付宝支付失败:', error);
      });
    // #endif
  } else {
    orderStore
      .paySuccess(orderId.value!, { payType: payType.value as 1 | 2 })
      .then(() => {
        uni.redirectTo({
          url: '/pages-sub/order/pay-success',
        });
      })
      .catch((error) => {
        console.error('支付失败:', error);
      });
  }
};
</script>

<style lang="scss" scoped>
.app {
  width: 100%;
}

.price-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 265rpx;
  background-color: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: 28rpx;

  .price {
    margin-top: 12rpx;
    color: var(--color-text);
    font-size: 50rpx;

    &::before {
      content: '￥';
      font-size: 40rpx;
    }
  }
}

.pay-type-list {
  margin-top: 20rpx;
  padding-left: 60rpx;
  background-color: var(--color-bg);

  .type-item {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
    height: 120rpx;
    padding: 20rpx 0;
    padding-right: 60rpx;
    font-size: 30rpx;
  }

  .icon {
    width: 100rpx;
    font-size: 52rpx;
  }

  .icon-erjiye-yucunkuan {
    color: #fe8e2e;
  }

  .icon-weixinzhifu {
    color: #36cb59;
  }

  .icon-alipay {
    color: #01aaef;
  }

  .tit {
    margin-bottom: 4rpx;
    color: var(--color-text);
    font-size: 32rpx;
  }

  .con {
    display: flex;
    flex: 1;
    flex-direction: column;
    color: #c0c4cc;
    font-size: 28rpx;
  }
}

.mix-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 630rpx;
  height: 80rpx;
  margin: 80rpx auto 30rpx;
  border-radius: 10rpx;
  background-color: var(--color-primary);
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  color: var(--color-bg);
  font-size: 32rpx;
}
</style>
