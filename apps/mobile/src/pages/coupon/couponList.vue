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
import { CouponService } from '@/api';
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
const loadData = () => {
  CouponService.fetchMemberCouponList(useStatus.value)
    .then((response) => {
      couponList.value = response.data || [];
    })
    .catch((error) => {
      console.error('加载优惠券列表失败:', error);
    });
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
  padding-bottom: 100upx;
  background: #f8f8f8;
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
    color: #303133;
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
    color: #303133;
    font-size: 32upx;
  }

  .time {
    color: #909399;
    font-size: 24upx;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100upx;
    color: #606266;
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
    color: #909399;
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

    &.coupon-right {
      right: -6upx;
      left: auto;
    }
  }
}
</style>
