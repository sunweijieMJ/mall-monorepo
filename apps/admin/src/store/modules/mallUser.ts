/**
 * Mall 用户状态管理
 * 从 mall-admin-web 的 Vuex 迁移到 Pinia
 */

import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AdminService } from '@/api/modules';
import type { UserInfo, MenuItem } from '@/interface';
import { getMallToken, setMallToken, removeMallToken } from '@/utils/mallAuth';

export const useMallUserStore = defineStore(
  'mallUser',
  () => {
    // State
    const token = ref<string>(getMallToken());
    const name = ref<string>('');
    const avatar = ref<string>('');
    const roles = ref<string[]>([]);
    const menus = ref<MenuItem[]>([]);

    // Getters
    const isLoggedIn = () => !!token.value;

    // Actions
    /**
     * 登录
     */
    const loginAction = async (username: string, password: string) => {
      const response = await AdminService.login(username.trim(), password);
      const data = response.data;
      if (data) {
        const tokenStr = data.tokenHead + data.token;
        setMallToken(tokenStr);
        token.value = tokenStr;
      }
    };

    /**
     * 获取用户信息
     */
    const getInfoAction = async (): Promise<UserInfo> => {
      const response = await AdminService.getInfo();
      const data = response.data;
      if (data) {
        // 验证返回的roles是否是一个非空数组
        if (data.roles && data.roles.length > 0) {
          roles.value = data.roles;
        } else {
          throw new Error('getInfo: roles must be a non-null array!');
        }
        name.value = data.username;
        avatar.value = data.icon || '';
        menus.value = data.menus || [];
      }
      return data as UserInfo;
    };

    /**
     * 登出
     */
    const logoutAction = async () => {
      await AdminService.logout();
      token.value = '';
      roles.value = [];
      menus.value = [];
      removeMallToken();
    };

    /**
     * 前端登出（不调用后端）
     */
    const fedLogoutAction = () => {
      token.value = '';
      roles.value = [];
      menus.value = [];
      removeMallToken();
    };

    // 重置状态
    const resetState = () => {
      token.value = '';
      name.value = '';
      avatar.value = '';
      roles.value = [];
      menus.value = [];
      removeMallToken();
    };

    return {
      // State
      token,
      name,
      avatar,
      roles,
      menus,
      // Getters
      isLoggedIn,
      // Actions
      loginAction,
      getInfoAction,
      logoutAction,
      fedLogoutAction,
      resetState,
    };
  },
  {
    persist: true, // 启用持久化
  },
);
