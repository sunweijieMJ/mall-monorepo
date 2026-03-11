<template>
  <view class="content">
    <uni-icons
      type="checkbox-filled"
      size="80"
      class="success-icon"
      color="var(--color-primary)"
    />
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
import { API_CONFIG } from '@/constants';

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
  // 支付宝回调后通过 out_trade_no 参数判断支付结果
  const outTradeNo = options?.out_trade_no;
  if (outTradeNo) {
    payText.value = '支付成功';
    tradeStatus.value = 'TRADE_SUCCESS';
  } else {
    payText.value = '支付失败';
  }
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
  margin-top: 100rpx;
}

.tit {
  color: var(--color-text);
  font-size: 38rpx;
}

.btn-group {
  padding-top: 100rpx;
}

.mix-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 600rpx;
  height: 80rpx;
  margin-top: 30rpx;
  border-radius: 10rpx;
  background-color: var(--color-primary);
  color: var(--color-bg);
  font-size: 32rpx;

  &.hollow {
    border: 1px solid #ccc;
    background: var(--color-bg);
    color: var(--color-text);
  }
}
</style>
