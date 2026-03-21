import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserInfo } from '@/interface';
import { storage } from '@/utils/storage';

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<UserInfo | null>(null);
    const hasLogin = ref(false);
    const token = ref<string | null>(null);

    const isLoggedIn = computed(() => hasLogin.value && !!userInfo.value?.id);

    const login = (user: UserInfo, loginToken?: string) => {
      hasLogin.value = true;
      userInfo.value = user;
      if (loginToken) {
        token.value = loginToken;
        // 同步写入 storage，供 API 拦截器读取
        storage.setSync('token', loginToken);
      }
    };

    const logout = () => {
      hasLogin.value = false;
      userInfo.value = null;
      token.value = null;
      // 同步清除 storage 中的 token
      storage.removeSync('token');
    };

    return { userInfo, hasLogin, token, isLoggedIn, login, logout };
  },
  {
    persist: {
      pick: ['hasLogin', 'userInfo', 'token'],
    },
  },
);
