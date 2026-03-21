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
    navigationBarTitleText: '支付结果',
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { API_CONFIG } from '@/constants';
import { useOrderStore } from '@/store';

const orderStore = useOrderStore();

/**
 * 支付结果页面
 * 通过后端查询订单状态来确认支付结果，而非仅依赖前端 URL 参数
 */

/** 支付结果文本 */
const payText = ref('查询支付结果中...');
/** 交易状态 */
const tradeStatus = ref<string | null>(null);

/**
 * 获取 orderId：优先从 URL 参数获取，其次从本地存储获取（支付宝回调场景）
 */
const resolveOrderId = (
  options: Record<string, string> | undefined,
): number | null => {
  if (options?.orderId) {
    return +options.orderId;
  }
  // 支付宝回调场景：从本地存储获取支付前保存的 orderId
  const storedId = uni.getStorageSync('payingOrderId');
  if (storedId) {
    uni.removeStorageSync('payingOrderId');
    return +storedId;
  }
  return null;
};

/**
 * 通过后端验证订单支付状态
 * 订单状态：0-待付款 1-待发货 2-已发货 3-已完成 4-已关闭 5-无效订单
 */
const verifyPaymentStatus = async (orderId: number) => {
  try {
    const data = await orderStore.fetchDetail(orderId);
    // status >= 1 且 < 4 表示已支付（待发货/已发货/已完成）
    if (data && data.status != null && data.status >= 1 && data.status <= 3) {
      payText.value = '支付成功';
      tradeStatus.value = 'TRADE_SUCCESS';
    } else {
      payText.value = '支付失败';
      tradeStatus.value = 'TRADE_FAILED';
    }
  } catch (error) {
    console.error('查询订单状态失败:', error);
    payText.value = '支付结果查询失败';
  }
};

/**
 * 页面加载
 */
onLoad((options) => {
  const orderId = resolveOrderId(options);

  if (!orderId) {
    // 无法获取订单ID，降级为旧逻辑
    if (!API_CONFIG.USE_ALIPAY) {
      payText.value = '支付成功';
    } else {
      payText.value = options?.out_trade_no ? '支付成功' : '支付失败';
    }
    return;
  }

  // 通过后端验证订单实际支付状态
  verifyPaymentStatus(orderId);
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
