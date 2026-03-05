<template>
  <view class="container">
    <view class="user-section">
      <image class="bg" src="/static/user-bg.jpg"></image>
      <view class="user-info-box">
        <view class="portrait-box">
          <image
            class="portrait"
            :src="userInfo.icon || '/static/missing-face.png'"
          ></image>
        </view>
        <view class="info-box">
          <text class="username">{{ userInfo.nickname || '游客' }}</text>
        </view>
      </view>
      <view class="vip-card-box">
        <image class="card-bg" src="/static/vip-card-bg.png" mode=""></image>
        <view class="b-btn">立即开通</view>
        <view class="tit">
          <text class="yticon icon-iLinkapp-"></text>
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
      <image class="arc" src="/static/arc.png"></image>

      <view class="tj-sction">
        <view class="tj-item">
          <text class="num">{{ userInfo.integration || '暂无' }}</text>
          <text>积分</text>
        </view>
        <view class="tj-item">
          <text class="num">{{ userInfo.growth || '暂无' }}</text>
          <text>成长值</text>
        </view>
        <view class="tj-item" @click="navTo('/pages/coupon/couponList')">
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
          <text class="yticon icon-shouye"></text>
          <text>全部订单</text>
        </view>
        <view
          class="order-item"
          hover-class="common-hover"
          :hover-stay-time="50"
          @click="navTo('/pages-sub/order/order?state=1')"
        >
          <text class="yticon icon-daifukuan"></text>
          <text>待付款</text>
        </view>
        <view
          class="order-item"
          hover-class="common-hover"
          :hover-stay-time="50"
          @click="navTo('/pages-sub/order/order?state=2')"
        >
          <text class="yticon icon-yishouhuo"></text>
          <text>待收货</text>
        </view>
        <view
          class="order-item"
          hover-class="common-hover"
          :hover-stay-time="50"
        >
          <text class="yticon icon-shouhoutuikuan"></text>
          <text>退款/售后</text>
        </view>
      </view>
      <!-- 浏览历史 -->
      <view class="history-section icon">
        <list-cell
          icon="icon-dizhi"
          icon-color="#5fcda2"
          title="地址管理"
          @event-click="navTo('/pages/address/address')"
        ></list-cell>
        <list-cell
          icon="icon-lishijilu"
          icon-color="#e07472"
          title="我的足迹"
          @event-click="navTo('/pages-sub/user/readHistory')"
        ></list-cell>
        <list-cell
          icon="icon-shoucang"
          icon-color="#5fcda2"
          title="我的关注"
          @event-click="navTo('/pages-sub/user/brandAttention')"
        ></list-cell>
        <list-cell
          icon="icon-shoucang_xuanzhongzhuangtai"
          icon-color="#54b4ef"
          title="我的收藏"
          @event-click="navTo('/pages-sub/user/productCollection')"
        ></list-cell>
        <list-cell
          icon="icon-pingjia"
          icon-color="#ee883b"
          title="我的评价"
        ></list-cell>
        <list-cell
          icon="icon-shezhi1"
          icon-color="#e07472"
          title="设置"
          border=""
          @event-click="navTo('/pages-sub/user/set')"
        ></list-cell>
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
        buttons: [
          {
            fontSrc: '/static/yticon.ttf',
            text: '\ue60f',
            fontSize: '24',
            color: '#303133',
            width: '46px',
            background: 'rgba(0,0,0,0)',
          },
          {
            fontSrc: '/static/yticon.ttf',
            text: '\ue744',
            fontSize: '28',
            color: '#303133',
            background: 'rgba(0,0,0,0)',
            redDot: true,
          },
        ],
      },
    },
  },
});
import { onLoad, onShow } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import { CouponService } from '@/api';
import listCell from '@/components/mix-list-cell.vue';
import { useUserStore } from '@/store/user';

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
    CouponService.fetchMemberCouponList(0)
      .then((response) => {
        if (response.data != null && response.data.length > 0) {
          couponCount.value = response.data.length;
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
    targetUrl = '/pages/public/login';
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
  border-radius: 10upx;
  background: #fff;
}

.user-section {
  position: relative;
  height: 520upx;
  padding: 100upx 30upx 0;

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
  height: 180upx;

  .portrait {
    width: 130upx;
    height: 130upx;
    border: 5upx solid #fff;
    border-radius: 50%;
  }

  .username {
    margin-left: 20upx;
    color: #303133;
    font-size: 40upx;
  }
}

.vip-card-box {
  display: flex;
  position: relative;
  flex-direction: column;
  height: 240upx;
  padding: 20upx 24upx;
  overflow: hidden;
  border-radius: 16upx 16upx 0 0;
  background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8));
  color: #f7d680;

  .card-bg {
    position: absolute;
    top: 20upx;
    right: 0;
    width: 380upx;
    height: 260upx;
  }

  .b-btn {
    position: absolute;
    z-index: 1;
    top: 16upx;
    right: 20upx;
    width: 132upx;
    height: 40upx;
    border-radius: 20px;
    background: linear-gradient(to right, #f9e6af, #ffd465);
    color: #36343c;
    font-size: 22upx;
    line-height: 40upx;
    text-align: center;
  }

  .tit {
    margin-bottom: 28upx;
    color: #f7d680;
    font-size: 32upx;

    .yticon {
      margin-right: 16upx;
      color: #f6e5a3;
    }
  }

  .e-b {
    margin-top: 10upx;
    color: #d8cba9;
    font-size: 24upx;
  }
}

.cover-container {
  position: relative;
  margin-top: -150upx;
  padding: 0 30upx;
  padding-bottom: 20upx;
  background: #f5f5f5;

  .arc {
    position: absolute;
    top: -34upx;
    left: 0;
    width: 100%;
    height: 36upx;
  }
}

.tj-sction {
  @extend %section;

  .tj-item {
    @extend %flex-center;

    flex-direction: column;
    height: 140upx;
    color: #75787d;
    font-size: 24upx;
  }

  .num {
    margin-bottom: 8upx;
    color: #303133;
    font-size: 36upx;
  }
}

.order-section {
  @extend %section;

  margin-top: 20upx;
  padding: 28upx 0;

  .order-item {
    @extend %flex-center;

    width: 120upx;
    height: 120upx;
    border-radius: 10upx;
    color: #303133;
    font-size: 24upx;
  }

  .yticon {
    margin-bottom: 18upx;
    color: #fa436a;
    font-size: 48upx;
  }

  .icon-shouhoutuikuan {
    font-size: 44upx;
  }
}

.history-section {
  margin-top: 20upx;
  padding: 30upx 0 0;
  border-radius: 10upx;
  background: #fff;

  .sec-header {
    display: flex;
    align-items: center;
    margin-left: 30upx;
    color: #303133;
    font-size: 30upx;
    line-height: 40upx;

    .yticon {
      margin-right: 16upx;
      color: #5eba8f;
      font-size: 44upx;
      line-height: 40upx;
    }
  }

  .h-list {
    padding: 30upx 30upx 0;
    white-space: nowrap;

    image {
      display: inline-block;
      width: 160upx;
      height: 160upx;
      margin-right: 20upx;
      border-radius: 10upx;
    }
  }
}
</style>
