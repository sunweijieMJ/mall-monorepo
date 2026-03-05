<template>
  <view class="container">
    <view
      class="list-cell b-b m-t"
      hover-class="cell-hover"
      :hover-stay-time="50"
      @click="navTo('个人资料')"
    >
      <text class="cell-tit">个人资料</text>
      <text class="cell-more yticon icon-you"></text>
    </view>
    <view
      class="list-cell b-b"
      hover-class="cell-hover"
      :hover-stay-time="50"
      @click="navTo('/pages/address/address')"
    >
      <text class="cell-tit">收货地址</text>
      <text class="cell-more yticon icon-you"></text>
    </view>
    <view
      class="list-cell"
      hover-class="cell-hover"
      :hover-stay-time="50"
      @click="navTo('实名认证')"
    >
      <text class="cell-tit">实名认证</text>
      <text class="cell-more yticon icon-you"></text>
    </view>

    <view class="list-cell m-t">
      <text class="cell-tit">消息推送</text>
      <switch checked color="#fa436a" @change="switchChange" />
    </view>
    <view
      class="list-cell m-t b-b"
      hover-class="cell-hover"
      :hover-stay-time="50"
      @click="navTo('清除缓存')"
    >
      <text class="cell-tit">清除缓存</text>
      <text class="cell-more yticon icon-you"></text>
    </view>
    <view
      class="list-cell b-b"
      hover-class="cell-hover"
      :hover-stay-time="50"
      @click="navToOuter('https://github.com/macrozheng/mall')"
    >
      <text class="cell-tit">关于mall-app-web</text>
      <text class="cell-more yticon icon-you"></text>
    </view>
    <view class="list-cell">
      <text class="cell-tit">检查更新</text>
      <text class="cell-tip">当前版本 1.0.0</text>
      <text class="cell-more yticon icon-you"></text>
    </view>
    <view class="list-cell log-out-btn" @click="toLogout">
      <text class="cell-tit">退出登录</text>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '设置',
  },
});
import { useUserStore } from '@/store/user';

/**
 * 设置页面
 * 包含个人资料、收货地址、实名认证、消息推送等设置项
 * 支持退出登录功能
 */

const userStore = useUserStore();

/**
 * 页面跳转
 */
const navTo = (url: string) => {
  if (url.indexOf('pages') !== -1) {
    uni.navigateTo({
      url: url,
    });
  } else {
    uni.showToast({
      title: `跳转到${url}`,
      icon: 'none',
    });
  }
};

/**
 * 外部链接跳转
 */
const navToOuter = (url: string) => {
  // #ifdef H5
  window.location.href = url;
  // #endif
  // #ifndef H5
  uni.showToast({
    title: '请在浏览器中打开',
    icon: 'none',
  });
  // #endif
};

/**
 * 退出登录
 */
const toLogout = () => {
  uni.showModal({
    content: '确定要退出登录么',
    success: (e) => {
      if (e.confirm) {
        userStore.logout();
        setTimeout(() => {
          uni.navigateBack();
        }, 200);
      }
    },
  });
};

/**
 * Switch 开关切换
 */
const switchChange = (e: any) => {
  const statusTip = e.detail.value ? '打开' : '关闭';
  uni.showToast({
    title: `${statusTip}消息推送`,
    icon: 'none',
  });
};
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8;
}

.list-cell {
  display: flex;
  position: relative;
  align-items: baseline;
  justify-content: center;
  padding: 20upx 30upx;
  background: #fff;
  line-height: 60upx;

  &.log-out-btn {
    margin-top: 40upx;

    .cell-tit {
      margin-right: 0;
      color: #fa436a;
      text-align: center;
    }
  }

  &.cell-hover {
    background: #fafafa;
  }

  &.b-b::after {
    left: 30upx;
  }

  &.m-t {
    margin-top: 16upx;
  }

  .cell-more {
    align-self: baseline;
    margin-left: 10upx;
    color: #c0c4cc;
    font-size: 34upx;
  }

  .cell-tit {
    flex: 1;
    margin-right: 10upx;
    color: #303133;
    font-size: 32upx;
  }

  .cell-tip {
    color: #c0c4cc;
    font-size: 30upx;
  }

  switch {
    transform: translateX(16upx) scale(0.84);
  }
}
</style>
