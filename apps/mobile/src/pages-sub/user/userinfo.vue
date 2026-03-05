<template>
  <view>
    <view class="user-section">
      <image class="bg" src="/static/user-bg.jpg"></image>
      <text class="bg-upload-btn yticon icon-paizhao"></text>
      <view class="portrait-box">
        <image
          class="portrait"
          :src="userInfo.portrait || '/static/missing-face.png'"
        ></image>
        <text class="pt-upload-btn yticon icon-paizhao"></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '个人信息',
  },
});
import { computed } from 'vue';
import { useUserStore } from '@/store/user';

/**
 * 用户信息编辑页面
 * 显示用户头像和背景图
 * 提供上传头像和背景图功能（按钮已显示，功能待实现）
 */

/** 用户信息接口 */
interface UserInfo {
  portrait?: string;
}

const userStore = useUserStore();

/** 用户信息 */
const userInfo = computed<UserInfo>(() => userStore.userInfo || {});
</script>

<style lang="scss" scoped>
page {
  background: #f8f8f8;
}

.user-section {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  height: 460upx;
  padding: 40upx 30upx 0;

  .bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.7;
    filter: blur(1px);
  }

  .portrait-box {
    position: relative;
    z-index: 2;
    width: 200upx;
    height: 200upx;
    border: 6upx solid #fff;
    border-radius: 50%;
  }

  .portrait {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .yticon {
    position: absolute;
    z-index: 5;
    padding: 4upx 6upx;
    border-radius: 6upx;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    font-size: 48upx;
    line-height: 1;
  }

  .pt-upload-btn {
    right: 0;
    bottom: 10upx;
  }

  .bg-upload-btn {
    right: 20upx;
    bottom: 16upx;
  }
}
</style>
