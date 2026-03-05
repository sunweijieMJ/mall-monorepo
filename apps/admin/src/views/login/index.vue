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
          <svg-icon icon-class="login-mall" class="icon" />
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
              <svg-icon icon-class="user" class="input-icon" />
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
              <svg-icon icon-class="password" class="input-icon" />
            </template>
            <template #suffix>
              <svg-icon
                icon-class="eye"
                class="input-icon clickable"
                @click="showPwd"
              />
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
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import loginCenterBg from '@/assets/images/login/background.png';
import { useMallUserStore } from '@/store/modules/mallUser';

// Router and Store
const router = useRouter();
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
    ElMessage.success('登录成功');
    router.push({ path: '/home' });
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
  background: #f0f2f5;
}

.login-form-layout {
  position: absolute;
  z-index: 10;
  top: 140px;
  left: 50%;
  width: 360px;
  transform: translateX(-50%);
  border-top: 10px solid #409eff;

  :deep(.el-card__body) {
    padding: 40px 30px;
  }
}

.login-icon {
  margin-bottom: 20px;
  text-align: center;

  .icon {
    width: 56px;
    height: 56px;
    color: #409eff;
  }
}

.login-title {
  margin: 0 0 30px;
  color: #409eff;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.input-icon {
  color: #409eff;

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
  background: #409eff;
}
</style>
