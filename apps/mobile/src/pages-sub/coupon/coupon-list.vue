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
    <!-- 优惠券页面，仿mt -->
    <view v-for="(item, index) in couponList" :key="index" class="coupon-item">
      <view class="con">
        <view class="left">
          <text class="title">{{ item.name }}</text>
          <text class="time">有效期至{{ formatDateTime(item.endTime) }}</text>
        </view>
        <view class="right">
          <text class="price">{{ item.amount }}</text>
          <text>满{{ item.minPoint }}可用</text>
        </view>

        <view class="circle coupon-left"></view>
        <view class="circle coupon-right"></view>
      </view>
      <text class="tips">{{ formatCouponUseType(item.useType) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '优惠券列表',
    enablePullDownRefresh: true,
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { useCouponStore } from '@/store';
import { formatDateTime } from '@/utils/formatters';

/**
 * 优惠券列表页面
 * 显示用户的优惠券（未使用、已使用、已过期）
 * 支持Tab切换查看不同状态的优惠券
 */

/** 优惠券接口 */
interface Coupon {
  name: string;
  endTime: string;
  amount: number;
  minPoint: number;
  useType: number;
}

/** 导航项接口 */
interface NavItem {
  useStatus: number;
  text: string;
}

const couponStore = useCouponStore();

/** 优惠券列表 */
const couponList = ref<Coupon[]>([]);
/** 当前tab索引 */
const tabCurrentIndex = ref(0);
/** 使用状态 */
const useStatus = ref(0);
/** 导航列表 */
const navList: NavItem[] = [
  { useStatus: 0, text: '未使用' },
  { useStatus: 1, text: '已使用' },
  { useStatus: 2, text: '已过期' },
];

/**
 * 页面加载
 */
onLoad(() => {
  loadData();
});

/**
 * 格式化优惠券使用类型
 */
const formatCouponUseType = (useType: number): string => {
  if (useType === 0) {
    return '全场通用';
  } else if (useType === 1) {
    return '指定分类商品可用';
  } else if (useType === 2) {
    return '指定商品可用';
  }
  return '';
};

/**
 * 加载优惠券列表
 */
const loadData = async () => {
  try {
    const data = await couponStore.fetchMemberList({
      useStatus: useStatus.value,
    });
    couponList.value = (data as any)?.list || data || [];
  } catch (error) {
    console.error('加载优惠券列表失败:', error);
  }
};

/**
 * Tab点击切换
 */
const tabClick = (index: number) => {
  tabCurrentIndex.value = index;
  useStatus.value = navList[index].useStatus;
  loadData();
};
</script>

<style lang="scss" scoped>
page {
  padding-bottom: 100rpx;
  background: var(--color-bg-grey);
}

.navbar {
  display: flex;
  position: relative;
  z-index: 10;
  height: 40px;
  padding: 0 5px;
  background: var(--color-bg);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);

  .nav-item {
    display: flex;
    position: relative;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text);
    font-size: 15px;

    &.current {
      color: var(--color-primary);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 44px;
        height: 0;
        transform: translateX(-50%);
        border-bottom: 2px solid var(--color-primary);
      }
    }
  }
}

/* 优惠券列表 */
.coupon-item {
  display: flex;
  flex-direction: column;
  margin: 20rpx 24rpx;
  background: var(--color-bg);

  .con {
    display: flex;
    position: relative;
    align-items: center;
    height: 120rpx;
    padding: 0 30rpx;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 0;
      transform: scaleY(50%);
      border-bottom: 1px dashed var(--color-bg-grey);
    }
  }

  .left {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    height: 100rpx;
    overflow: hidden;
  }

  .title {
    margin-bottom: 10rpx;
    color: var(--color-text);
    font-size: 32rpx;
  }

  .time {
    color: var(--color-text-secondary);
    font-size: 24rpx;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100rpx;
    color: #606266;
    font-size: 26rpx;
  }

  .price {
    color: var(--color-primary);
    font-size: 44rpx;

    &::before {
      content: '￥';
      font-size: 34rpx;
    }
  }

  .tips {
    padding-left: 30rpx;
    color: var(--color-text-secondary);
    font-size: 24rpx;
    line-height: 60rpx;
  }

  .circle {
    position: absolute;
    z-index: 10;
    bottom: -10rpx;
    left: -6rpx;
    width: 20rpx;
    height: 20rpx;
    border-radius: 100px;
    background: var(--color-bg-grey);

    &.coupon-right {
      right: -6rpx;
      left: auto;
    }
  }
}
</style>
