<template>
  <div class="login-container">
    <el-card class="login-form-layout">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="left"
        auto-complete="on"
      >
        <div class="login-icon">
          <el-icon class="icon"><ShoppingCart /></el-icon>
        </div>
        <h2 class="login-title">mall-admin</h2>

        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            name="username"
            type="text"
            placeholder="请输入用户名"
            auto-complete="on"
          >
            <template #prefix>
              <el-icon class="input-icon"><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            name="password"
            :type="pwdType"
            placeholder="请输入密码"
            auto-complete="on"
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon class="input-icon"><Lock /></el-icon>
            </template>
            <template #suffix>
              <el-icon class="input-icon clickable" @click="showPwd">
                <View v-if="pwdType === 'password'" />
                <Hide v-else />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item class="login-actions">
          <el-button
            type="primary"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <img :src="loginCenterBg" class="login-center-layout" alt="登录背景" />
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, User, Lock, View, Hide } from '@element-plus/icons-vue';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import loginCenterBg from '@/assets/images/login/background.png';
import { buildAndRegisterRoutes } from '@/router/guards';
import { useMallUserStore } from '@/store/modules/mallUser';

// Router and Store
const router = useRouter();
const route = useRoute();
const mallUserStore = useMallUserStore();

// Refs
const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const pwdType = ref<'password' | 'text'>('password');

// Form Data
const loginForm = reactive({
  username: 'admin',
  password: '',
});

// Validation Rules
const validateUsername = (_rule: any, value: string, callback: any) => {
  if (!value || value.trim() === '') {
    callback(new Error('请输入用户名'));
  } else {
    callback();
  }
};

const validatePassword = (_rule: any, value: string, callback: any) => {
  if (!value || value.length < 3) {
    callback(new Error('密码不能小于3位'));
  } else {
    callback();
  }
};

const loginRules: FormRules = {
  username: [{ required: true, trigger: 'blur', validator: validateUsername }],
  password: [{ required: true, trigger: 'blur', validator: validatePassword }],
};

// Methods
const showPwd = () => {
  pwdType.value = pwdType.value === 'password' ? 'text' : 'password';
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    const valid = await loginFormRef.value.validate();
    if (!valid) return;

    loading.value = true;
    await mallUserStore.loginAction(loginForm.username, loginForm.password);
    await mallUserStore.getInfoAction();
    // 登录后立即预生成路由，避免首次导航触发重定向造成"刷新"感
    buildAndRegisterRoutes(router, mallUserStore.menus);
    ElMessage.success('登录成功');
    const redirect = route.query.redirect as string;
    router.push({ path: redirect || '/home' });
  } catch (error: any) {
    console.error('登录失败:', error);
    ElMessage.error(error?.message || '登录失败，请检查用户名和密码');
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // 如果已经登录，直接跳转到首页
  if (mallUserStore.token) {
    router.push({ path: '/home' });
  }
});
</script>

<style scoped lang="scss">
.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--colorBgLayout);
}

.login-form-layout {
  position: absolute;
  z-index: 10;
  top: 140px;
  left: 50%;
  width: 360px;
  transform: translateX(-50%);
  border-top: 10px solid var(--colorPrimary);

  :deep(.el-card__body) {
    padding: 40px 30px;
  }
}

.login-icon {
  margin-bottom: 20px;
  text-align: center;

  .icon {
    color: var(--colorPrimary);
    font-size: 56px;
  }
}

.login-title {
  margin: 0 0 30px;
  color: var(--colorPrimary);
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.input-icon {
  color: var(--colorPrimary);

  &.clickable {
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}

.login-actions {
  margin-bottom: 0;
  text-align: center;

  .login-btn {
    width: 100%;
    margin-top: 20px;
  }
}

.login-center-layout {
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 100%;
  height: auto;
  background: var(--colorPrimary);
}
</style>
