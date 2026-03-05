import { createPinia } from 'pinia';
import {
  createPersistedState,
  type StorageLike,
} from 'pinia-plugin-persistedstate';

/**
 * UniApp 统一存储适配器
 * 支持 H5 / 小程序 / App 多端
 */
export const uniStorage: StorageLike = {
  getItem(key: string): string | null {
    try {
      return uni.getStorageSync(key) || null;
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      uni.setStorageSync(key, value);
    } catch (error) {
      console.error('[Storage] setItem error:', error);
    }
  },
};

/**
 * 创建带持久化的 Pinia 实例
 * 全局默认使用 uniStorage，各 store 可按需覆盖
 */
export const createPersistedPinia = () => {
  const pinia = createPinia();
  pinia.use(createPersistedState({ storage: uniStorage }));
  return pinia;
};
