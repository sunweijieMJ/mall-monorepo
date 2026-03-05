<template>
  <view class="container">
    <view class="left-bottom-sign"></view>
    <view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
    <view class="right-top-sign"></view>
    <!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
    <view class="wrapper">
      <view class="empty">
        <image
          src="/static/qrcode_for_macrozheng_258.jpg"
          mode="aspectFit"
        ></image>
        <view class="empty-tips">
          扫描上方二维码<view class="navigator">关注公众号</view>，
        </view>
        <view class="empty-tips">
          回复<view class="navigator">会员</view>获取体验账号。
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '',
    navigationStyle: 'custom',
    'app-plus': {
      titleNView: false,
      animationType: 'slide-in-bottom',
    },
  },
});
/**
 * 注册页面 / 获取体验账号页面
 * 引导用户扫描二维码关注公众号获取体验账号
 */

/**
 * 返回上一页
 */
const navBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
page {
  background: #fff;
}

.empty {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  padding-bottom: 100upx;
  background: #fff;

  image {
    width: 420upx;
    height: 420upx;
    margin-bottom: 30upx;
  }

  .empty-tips {
    display: flex;
    color: #999;
    font-size: 32upx;

    .navigator {
      margin-left: 0upx;
      color: #fa436a;
    }
  }
}

.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  padding-top: 115px;
  overflow: hidden;
  background: #fff;
}

.wrapper {
  position: relative;
  z-index: 90;
  padding-bottom: 40upx;
  background: #fff;
}

.back-btn {
  position: absolute;
  z-index: 9999;
  top: 40upx;
  left: 40upx;
  padding-top: var(--status-bar-height);
  color: #333;
  font-size: 40upx;
}

.left-top-sign {
  position: relative;
  left: -16upx;
  color: #f8f8f8;
  font-size: 120upx;
}

.right-top-sign {
  position: absolute;
  z-index: 95;
  top: 80upx;
  right: -30upx;

  &::before,
  &::after {
    content: '';
    display: block;
    width: 400upx;
    height: 80upx;
    background: #b4f3e2;
  }

  &::before {
    transform: rotate(50deg);
    border-radius: 0 50px 0 0;
  }

  &::after {
    position: absolute;
    top: 0;
    right: -198upx;
    transform: rotate(-50deg);
    border-radius: 50px 0 0;
  }
}

.left-bottom-sign {
  position: absolute;
  bottom: -320upx;
  left: -270upx;
  padding: 180upx;
  border: 100upx solid #d0d1fd;
  border-radius: 50%;
}
</style>
