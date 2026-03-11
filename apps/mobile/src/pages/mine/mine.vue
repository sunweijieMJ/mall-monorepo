<template>
  <view class="container">
    <view class="user-section">
      <image class="bg" src="/static/ui/user-bg.jpg"></image>
      <view class="user-info-box">
        <view class="portrait-box">
          <image
            class="portrait"
            :src="userInfo.icon || '/static/ui/missing-face.png'"
          ></image>
        </view>
        <view class="info-box">
          <text class="username">{{ userInfo.nickname || '游客' }}</text>
        </view>
      </view>
      <view class="vip-card-box">
        <image class="card-bg" src="/static/ui/vip-card-bg.png" mode=""></image>
        <view class="b-btn">立即开通</view>
        <view class="tit">
          <uni-icons type="vip" size="22" color="#f6e5a3" />
          黄金会员
        </view>
        <text class="e-m">mall移动端商城</text>
        <text class="e-b">黄金及以上会员可享有会员价优惠商品。</text>
      </view>
    </view>

    <view
      class="cover-container"
      :style="{
        transform: coverTransform,
        transition: coverTransition,
      }"
      @touchstart="coverTouchstart"
      @touchmove="coverTouchmove"
      @touchend="coverTouchend"
    >
      <image class="arc" src="/static/ui/arc.png"></image>

      <view class="tj-sction">
        <view class="tj-item">
          <text class="num">{{ userInfo.integration || '暂无' }}</text>
          <text>积分</text>
        </view>
        <view class="tj-item">
          <text class="num">{{ userInfo.growth || '暂无' }}</text>
          <text>成长值</text>
        </view>
        <view class="tj-item" @click="navTo('/pages-sub/coupon/coupon-list')">
          <text class="num">{{ couponCount || '暂无' }}</text>
          <text>优惠券</text>
        </view>
      </view>
      <!-- 订单 -->
      <view class="order-section">
        <view
          class="order-item"
          hover-class="common-hover"
          :hover-stay-time="50"
          @click="navTo('/pages-sub/order/order?state=0')"
        >
          <uni-icons
            type="home"
            size="24"
            color="var(--color-primary)"
            class="order-icon"
          />
          <text>全部订单</text>
        </view>
        <view
          class="order-item"
          hover-class="common-hover"
          :hover-stay-time="50"
          @click="navTo('/pages-sub/order/order?state=1')"
        >
          <uni-icons
            type="wallet"
            size="24"
            color="var(--color-primary)"
            class="order-icon"
          />
          <text>待付款</text>
        </view>
        <view
          class="order-item"
          hover-class="common-hover"
          :hover-stay-time="50"
          @click="navTo('/pages-sub/order/order?state=2')"
        >
          <uni-icons
            type="shop"
            size="24"
            color="var(--color-primary)"
            class="order-icon"
          />
          <text>待收货</text>
        </view>
        <view
          class="order-item"
          hover-class="common-hover"
          :hover-stay-time="50"
        >
          <uni-icons
            type="redo"
            size="24"
            color="var(--color-primary)"
            class="order-icon"
          />
          <text>退款/售后</text>
        </view>
      </view>
      <!-- 浏览历史 -->
      <view class="history-section icon">
        <UMenuItem
          icon="location"
          icon-color="#5fcda2"
          title="地址管理"
          @click="navTo('/pages-sub/address/address')"
        />
        <UMenuItem
          icon="list"
          icon-color="#e07472"
          title="我的足迹"
          @click="navTo('/pages-sub/user/read-history')"
        />
        <UMenuItem
          icon="heart"
          icon-color="#5fcda2"
          title="我的关注"
          @click="navTo('/pages-sub/user/brand-attention')"
        />
        <UMenuItem
          icon="heart-filled"
          icon-color="#54b4ef"
          title="我的收藏"
          @click="navTo('/pages-sub/user/product-collection')"
        />
        <UMenuItem icon="star" icon-color="#ee883b" title="我的评价" />
        <UMenuItem
          icon="gear"
          icon-color="#e07472"
          title="设置"
          :border="false"
          @click="navTo('/pages-sub/user/set')"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '我的',
    'app-plus': {
      bounce: 'none',
      titleNView: {
        type: 'transparent',
      },
    },
  },
});
import { onLoad, onShow } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import { UMenuItem } from '@/components';
import { useCouponStore } from '@/store';
import { useUserStore } from '@/store/modules/user';

/**
 * 用户中心页面
 * 显示用户信息、会员卡、统计数据（积分、成长值、优惠券）
 * 提供订单入口、地址管理、足迹、关注、收藏等功能入口
 * 支持会员卡下拉回弹交互效果
 */

/** 用户信息接口 */
interface UserInfo {
  icon?: string;
  nickname?: string;
  integration?: number;
  growth?: number;
}

const userStore = useUserStore();
const couponStore = useCouponStore();

/** 是否已登录 */
const hasLogin = computed(() => userStore.hasLogin);
/** 用户信息 */
const userInfo = computed<UserInfo>(() => userStore.userInfo || {});

/** 封面变换样式 */
const coverTransform = ref('translateY(0px)');
/** 封面过渡样式 */
const coverTransition = ref('0s');
/** 是否正在移动 */
const moving = ref(false);
/** 优惠券数量 */
const couponCount = ref<number | null>(null);

/** 下拉相关变量 */
let startY = 0;
let moveY = 0;
let pageAtTop = true;

/**
 * 页面加载
 */
onLoad(() => {
  // 页面加载时的初始化
});

/**
 * 页面显示
 */
onShow(() => {
  if (hasLogin.value) {
    couponStore
      .fetchMemberList({ useStatus: 0 })
      .then((data) => {
        if (data != null && data.length > 0) {
          couponCount.value = data.length;
        }
      })
      .catch((error) => {
        console.error('加载优惠券列表失败:', error);
      });
  } else {
    couponCount.value = null;
  }
});

/**
 * 统一跳转接口，拦截未登录路由
 * navigator标签现在默认没有转场动画，所以用view
 */
const navTo = (url: string) => {
  let targetUrl = url;
  if (!hasLogin.value) {
    targetUrl = '/pages/login/index';
  }
  uni.navigateTo({
    url: targetUrl,
  });
};

/**
 * 会员卡下拉和回弹
 * 1.关闭bounce避免ios端下拉冲突
 * 2.由于touchmove事件的缺陷（以前做小程序就遇到，比如20跳到40，h5反而好很多），下拉的时候会有掉帧的感觉
 *   transition设置0.1秒延迟，让css来过渡这段空窗期
 * 3.回弹效果可修改曲线值来调整效果，推荐一个好用的bezier生成工具 http://cubic-bezier.com/
 */
const coverTouchstart = (e: TouchEvent) => {
  if (pageAtTop === false) {
    return;
  }
  coverTransition.value = 'transform .1s linear';
  startY = e.touches[0].clientY;
};

const coverTouchmove = (e: TouchEvent) => {
  moveY = e.touches[0].clientY;
  let moveDistance = moveY - startY;
  if (moveDistance < 0) {
    moving.value = false;
    return;
  }
  moving.value = true;
  if (moveDistance >= 80 && moveDistance < 100) {
    moveDistance = 80;
  }

  if (moveDistance > 0 && moveDistance <= 80) {
    coverTransform.value = `translateY(${moveDistance}px)`;
  }
};

const coverTouchend = () => {
  if (moving.value === false) {
    return;
  }
  moving.value = false;
  coverTransition.value = 'transform 0.3s cubic-bezier(.21,1.93,.53,.64)';
  coverTransform.value = 'translateY(0px)';
};
</script>

<style lang="scss" scoped>
%flex-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

%section {
  display: flex;
  place-content: center space-around;
  border-radius: 10rpx;
  background: var(--color-bg);
}

.user-section {
  position: relative;
  height: 520rpx;
  padding: 100rpx 30rpx 0;

  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.7;
    filter: blur(1px);
  }
}

.user-info-box {
  display: flex;
  position: relative;
  z-index: 1;
  align-items: center;
  height: 180rpx;

  .portrait {
    width: 130rpx;
    height: 130rpx;
    border: 5rpx solid var(--color-bg);
    border-radius: 50%;
  }

  .username {
    margin-left: 20rpx;
    color: var(--color-text);
    font-size: 40rpx;
  }
}

.vip-card-box {
  display: flex;
  position: relative;
  flex-direction: column;
  height: 240rpx;
  padding: 20rpx 24rpx;
  overflow: hidden;
  border-radius: 16rpx 16rpx 0 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8));
  color: #f7d680;

  .card-bg {
    position: absolute;
    top: 20rpx;
    right: 0;
    width: 380rpx;
    height: 260rpx;
  }

  .b-btn {
    position: absolute;
    z-index: 1;
    top: 16rpx;
    right: 20rpx;
    width: 132rpx;
    height: 40rpx;
    border-radius: 20px;
    background: linear-gradient(to right, #f9e6af, #ffd465);
    color: #36343c;
    font-size: 22rpx;
    line-height: 40rpx;
    text-align: center;
  }

  .tit {
    margin-bottom: 28rpx;
    color: #f7d680;
    font-size: 32rpx;

    uni-icons {
      margin-right: 16rpx;
    }
  }

  .e-b {
    margin-top: 10rpx;
    color: #d8cba9;
    font-size: 24rpx;
  }
}

.cover-container {
  position: relative;
  margin-top: -150rpx;
  padding: 0 30rpx;
  padding-bottom: 20rpx;
  background: var(--color-bg-grey);

  .arc {
    position: absolute;
    top: -34rpx;
    left: 0;
    width: 100%;
    height: 36rpx;
  }
}

.tj-sction {
  @extend %section;

  .tj-item {
    @extend %flex-center;

    flex-direction: column;
    height: 140rpx;
    color: #75787d;
    font-size: 24rpx;
  }

  .num {
    margin-bottom: 8rpx;
    color: var(--color-text);
    font-size: 36rpx;
  }
}

.order-section {
  @extend %section;

  margin-top: 20rpx;
  padding: 28rpx 0;

  .order-item {
    @extend %flex-center;

    width: 120rpx;
    height: 120rpx;
    border-radius: 10rpx;
    color: var(--color-text);
    font-size: 24rpx;
  }

  .order-icon {
    margin-bottom: 18rpx;
  }
}

.history-section {
  margin-top: 20rpx;
  padding: 30rpx 0 0;
  border-radius: 10rpx;
  background: var(--color-bg);

  .h-list {
    padding: 30rpx 30rpx 0;
    white-space: nowrap;

    image {
      display: inline-block;
      width: 160rpx;
      height: 160rpx;
      margin-right: 20rpx;
      border-radius: 10rpx;
    }
  }
}
</style>
