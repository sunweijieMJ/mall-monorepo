<template>
  <view class="container">
    <view class="left-bottom-sign"></view>
    <view class="back-btn" @click="navBack">
      <uni-icons type="arrow-left" size="20" color="var(--color-text)" />
    </view>
    <view class="right-top-sign"></view>
    <!-- 设置白色背景防止软键盘把下部绝对定位元素顶上来盖住输入框等 -->
    <view class="wrapper">
      <view class="left-top-sign">LOGIN</view>
      <view class="welcome">欢迎回来！</view>
      <view class="input-content">
        <view class="input-item">
          <text class="tit">用户名</text>
          <input
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            maxlength="11"
          />
        </view>
        <view class="input-item">
          <text class="tit">密码</text>
          <input
            v-model="password"
            type="text"
            placeholder="8-18位不含特殊字符的数字、字母组合"
            placeholder-class="input-empty"
            maxlength="20"
            password
            @confirm="handleLogin"
          />
        </view>
      </view>
      <button class="confirm-btn" :disabled="logining" @click="handleLogin">
        登录
      </button>
      <button class="confirm-btn2" @click="toRegist">获取体验账号</button>
      <view class="forget-section" @click="toRegist">忘记密码?</view>
    </view>
    <view class="register-section">
      还没有账号?
      <text @click="toRegist">马上注册</text>
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
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import {
  portalAuthControllerLoginV1,
  memberInfoControllerGetInfoV1,
} from '@/api';
import { useUserStore } from '@/store';
import { storage } from '@/utils/storage';

/**
 * 登录页面
 * 提供用户登录功能，支持记住用户名和密码
 */

/** 用户名 */
const username = ref('');
/** 密码 */
const password = ref('');
/** 是否正在登录 */
const logining = ref(false);

/** 用户状态管理 */
const userStore = useUserStore();

/**
 * 页面加载时恢复上次登录的用户名和密码
 * 注意：生产环境不应该存储明文密码，这里仅为演示
 */
onLoad(() => {
  username.value = storage.getSync('username') || '';
  password.value = storage.getSync('password') || '';
});

/**
 * 返回上一页
 */
const navBack = () => {
  uni.navigateBack();
};

/**
 * 跳转到注册页
 */
const toRegist = () => {
  uni.navigateTo({ url: '/pages/register/index' });
};

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (logining.value) return;

  // 简单验证
  if (!username.value || !password.value) {
    uni.showToast({
      title: '请输入用户名和密码',
      icon: 'none',
    });
    return;
  }

  logining.value = true;

  try {
    // 调用登录API
    const loginResponse = await portalAuthControllerLoginV1({
      username: username.value,
      password: password.value,
    });

    // 拼接完整token
    const token =
      (loginResponse.data?.tokenHead ?? '') + (loginResponse.data?.token ?? '');

    // 保存token和用户凭证
    storage.setSync('token', token);
    storage.setSync('username', username.value);
    // ⚠️ 安全提示：生产环境不应该明文存储密码
    // storage.setSync('password', password.value);

    // 获取用户信息
    const userResponse = await memberInfoControllerGetInfoV1();

    // 更新用户状态
    userStore.login(userResponse.data, token);

    // 登录成功提示
    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
    });

    // 延迟返回，让用户看到成功提示
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch (error) {
    console.error('登录失败:', error);
    logining.value = false;
    // 错误提示由API拦截器统一处理
  }
};
</script>

<style lang="scss" scoped>
page {
  background: var(--color-bg);
}

.container {
  position: relative;
  width: 100vw;
  height: 100vh;
  padding-top: 115px;
  overflow: hidden;
  background: var(--color-bg);
}

.wrapper {
  position: relative;
  z-index: 90;
  padding-bottom: 40rpx;
  background: var(--color-bg);
}

.back-btn {
  display: flex;
  position: absolute;
  z-index: 9999;
  top: 40rpx;
  left: 40rpx;
  align-items: center;
  padding-top: var(--status-bar-height);
}

.left-top-sign {
  position: relative;
  left: -16rpx;
  color: var(--color-bg-grey);
  font-size: 120rpx;
}

.right-top-sign {
  position: absolute;
  z-index: 95;
  top: 80rpx;
  right: -30rpx;

  &::before,
  &::after {
    content: '';
    display: block;
    width: 400rpx;
    height: 80rpx;
    background: #b4f3e2;
  }

  &::before {
    transform: rotate(50deg);
    border-radius: 0 50px 0 0;
  }

  &::after {
    position: absolute;
    top: 0;
    right: -198rpx;
    transform: rotate(-50deg);
    border-radius: 50px 0 0;
  }
}

.left-bottom-sign {
  position: absolute;
  bottom: -320rpx;
  left: -270rpx;
  padding: 180rpx;
  border: 100rpx solid #d0d1fd;
  border-radius: 50%;
}

.welcome {
  position: relative;
  top: -90rpx;
  left: 50rpx;
  color: #555;
  font-size: 46rpx;
  text-shadow: 1px 0 1px rgba(0, 0, 0, 0.3);
}

.input-content {
  padding: 0 60rpx;
}

.input-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  height: 120rpx;
  margin-bottom: 50rpx;
  padding: 0 30rpx;
  border-radius: 4px;
  background: #f6f6f6;

  &:last-child {
    margin-bottom: 0;
  }

  .tit {
    height: 50rpx;
    color: var(--color-text-secondary);
    font-size: 26rpx;
    line-height: 56rpx;
  }

  input {
    width: 100%;
    height: 60rpx;
    color: var(--color-text);
    font-size: 30rpx;
  }
}

.confirm-btn {
  width: 630rpx;
  height: 76rpx;
  margin-top: 70rpx;
  border-radius: 50px;
  background: var(--color-primary);
  color: var(--color-bg);
  font-size: 32rpx;
  line-height: 76rpx;

  &::after {
    border-radius: 100px;
  }
}

.confirm-btn2 {
  width: 630rpx;
  height: 76rpx;
  margin-top: 40rpx;
  border-radius: 50px;
  background: var(--color-primary);
  color: var(--color-bg);
  font-size: 32rpx;
  line-height: 76rpx;

  &::after {
    border-radius: 100px;
  }
}

.forget-section {
  margin-top: 40rpx;
  color: #4cd964;
  font-size: 26rpx;
  text-align: center;
}

.register-section {
  position: absolute;
  bottom: 50rpx;
  left: 0;
  width: 100%;
  color: var(--color-text-secondary);
  font-size: 26rpx;
  text-align: center;

  text {
    margin-left: 10rpx;
    color: #4cd964;
  }
}
</style>
