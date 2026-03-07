<template>
  <view class="content">
    <text class="success-icon yticon icon-xuanzhong2"></text>
    <text class="tit">{{ payText }}</text>

    <view class="btn-group">
      <navigator
        url="/pages-sub/order/order?state=0"
        open-type="redirect"
        class="mix-btn"
      >
        查看订单
      </navigator>
      <navigator
        url="/pages/index/index"
        open-type="switchTab"
        class="mix-btn hollow"
      >
        返回首页
      </navigator>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '支付成功',
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { OrderService } from '@/api';
import { API_CONFIG } from '@/constants/Config';

/**
 * 支付成功页面
 * 支持真实支付（支付宝）和模拟支付
 * 显示支付结果并提供查看订单和返回首页按钮
 */

/** 支付结果文本 */
const payText = ref('');
/** 交易状态 */
const tradeStatus = ref<string | null>(null);

/**
 * 页面加载
 */
onLoad((options) => {
  if (!API_CONFIG.USE_ALIPAY) {
    payText.value = '支付成功';
    return;
  }
  const outTradeNo = options?.out_trade_no;
  OrderService.fetchAlipayStatus({ outTradeNo: outTradeNo! })
    .then((response) => {
      tradeStatus.value = response.data;
      if (tradeStatus.value != null && 'TRADE_SUCCESS' == tradeStatus.value) {
        payText.value = '支付成功';
      } else {
        payText.value = '支付失败';
      }
    })
    .catch((error) => {
      console.error('查询支付状态失败:', error);
      payText.value = '支付失败';
    });
});
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-icon {
  margin-top: 100upx;
  color: #fa436a;
  font-size: 160upx;
}

.tit {
  color: #303133;
  font-size: 38upx;
}

.btn-group {
  padding-top: 100upx;
}

.mix-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 600upx;
  height: 80upx;
  margin-top: 30upx;
  border-radius: 10upx;
  background-color: #fa436a;
  color: #fff;
  font-size: 32upx;

  &.hollow {
    border: 1px solid #ccc;
    background: #fff;
    color: #303133;
  }
}
</style>
