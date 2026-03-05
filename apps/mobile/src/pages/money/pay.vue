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
import { OrderService } from '@/api';
import { API_CONFIG } from '@/constants/Config';

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
  OrderService.fetchOrderDetail(orderId.value)
    .then((response) => {
      Object.assign(orderInfo, response.data);
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
    window.location.href =
      API_CONFIG.BASE_URL +
      '/alipay/webPay?outTradeNo=' +
      orderInfo.orderSn +
      '&subject=' +
      orderInfo.receiverName +
      '的商品订单' +
      '&totalAmount=' +
      orderInfo.totalAmount;
    // #endif
  } else {
    OrderService.payOrderSuccess({
      orderId: orderId.value!,
      payType: payType.value,
    })
      .then(() => {
        uni.redirectTo({
          url: '/pages/money/paySuccess',
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
  height: 265upx;
  background-color: #fff;
  color: #909399;
  font-size: 28upx;

  .price {
    margin-top: 12upx;
    color: #303133;
    font-size: 50upx;

    &::before {
      content: '￥';
      font-size: 40upx;
    }
  }
}

.pay-type-list {
  margin-top: 20upx;
  padding-left: 60upx;
  background-color: #fff;

  .type-item {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
    height: 120upx;
    padding: 20upx 0;
    padding-right: 60upx;
    font-size: 30upx;
  }

  .icon {
    width: 100upx;
    font-size: 52upx;
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
    margin-bottom: 4upx;
    color: #303133;
    font-size: 32upx;
  }

  .con {
    display: flex;
    flex: 1;
    flex-direction: column;
    color: #c0c4cc;
    font-size: 28upx;
  }
}

.mix-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 630upx;
  height: 80upx;
  margin: 80upx auto 30upx;
  border-radius: 10upx;
  background-color: #fa436a;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  color: #fff;
  font-size: 32upx;
}
</style>
