/**
 * 本地存储工具
 * 提供统一的存储操作方法，包括异步和同步版本
 * 支持数据过期功能
 */

import { log } from './core/logger';

/**
 * 存储项结构
 */
interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  expiry?: number;
}

/**
 * 存储操作选项
 */
interface StorageOptions {
  expiry?: number; // 过期时间（毫秒）
}

/**
 * 存储键名常量
 * 使用常量来约束和管理所有存储键名
 */
export const STORAGE_KEYS = [
  // 用户相关
  'userInfo',
  'token',
  'preferences',
  'username',
  'password',

  // 购物车相关
  'cartItems',
  'cartCount',

  // 缓存相关
  'apiCache',
  'imageCache',
  'configCache',

  // 应用设置
  'theme',
  'language',
  'version',

  // 业务数据
  'searchHistory',
  'viewHistory',
  'favoriteProducts',
  'recentAddresses',

  // 临时数据
  'tempData',
  'formDraft',
  'pageCache',
] as const;

type StorageKey = (typeof STORAGE_KEYS)[number];

/**
 * 创建存储项
 */
function createStorageItem<T>(data: T, expiry?: number): StorageItem<T> {
  const item: StorageItem<T> = {
    data,
    timestamp: Date.now(),
  };

  if (expiry) {
    item.expiry = Date.now() + expiry;
  }

  return item;
}

/**
 * 检查存储项是否过期
 */
function isExpired(item: StorageItem): boolean {
  return item.expiry ? Date.now() > item.expiry : false;
}

/**
 * 统一的存储管理器
 */
export const storage = {
  /**
   * 异步设置存储项
   */
  async set<T>(
    key: StorageKey,
    value: T,
    options: StorageOptions = {},
  ): Promise<boolean> {
    try {
      const { expiry } = options;
      const item = createStorageItem(value, expiry);

      await new Promise<void>((resolve, reject) => {
        uni.setStorage({
          key,
          data: item,
          success: () => resolve(),
          fail: reject,
        });
      });

      return true;
    } catch (error) {
      log.error(`Failed to set storage item: ${key}`, error);
      return false;
    }
  },

  /**
   * 异步获取存储项
   */
  async get<T = any>(key: StorageKey): Promise<T | null> {
    try {
      const result = await new Promise<StorageItem<T> | null>((resolve) => {
        uni.getStorage({
          key,
          success: (res) => resolve(res.data as StorageItem<T>),
          fail: () => resolve(null),
        });
      });

      if (!result) {
        return null;
      }

      // 检查过期
      if (isExpired(result)) {
        await this.remove(key);
        return null;
      }

      return result.data;
    } catch (error) {
      log.error(`Failed to get storage item: ${key}`, error);
      return null;
    }
  },

  /**
   * 异步删除存储项
   */
  async remove(key: StorageKey): Promise<boolean> {
    try {
      await new Promise<void>((resolve, reject) => {
        uni.removeStorage({
          key,
          success: () => resolve(),
          fail: reject,
        });
      });

      return true;
    } catch (error) {
      log.error(`Failed to remove storage item: ${key}`, error);
      return false;
    }
  },

  /**
   * 异步清空所有存储
   */
  async clear(): Promise<boolean> {
    try {
      uni.clearStorage();
      return true;
    } catch (error) {
      log.error('Failed to clear storage', error);
      return false;
    }
  },

  /**
   * 同步设置存储项
   */
  setSync<T>(key: StorageKey, value: T, options: StorageOptions = {}): boolean {
    try {
      const { expiry } = options;
      const item = createStorageItem(value, expiry);

      uni.setStorageSync(key, item);
      return true;
    } catch (error) {
      log.error(`Failed to set storage item sync: ${key}`, error);
      return false;
    }
  },

  /**
   * 同步获取存储项
   */
  getSync<T = any>(key: StorageKey): T | null {
    try {
      const result = uni.getStorageSync(key) as StorageItem<T> | null;

      if (!result) {
        return null;
      }

      // 检查过期
      if (isExpired(result)) {
        this.removeSync(key);
        return null;
      }

      return result.data;
    } catch (error) {
      log.error(`Failed to get storage item sync: ${key}`, error);
      return null;
    }
  },

  /**
   * 同步删除存储项
   */
  removeSync(key: StorageKey): boolean {
    try {
      uni.removeStorageSync(key);
      return true;
    } catch (error) {
      log.error(`Failed to remove storage item sync: ${key}`, error);
      return false;
    }
  },

  /**
   * 同步清空所有存储
   */
  clearSync(): boolean {
    try {
      uni.clearStorageSync();
      return true;
    } catch (error) {
      log.error('Failed to clear storage sync', error);
      return false;
    }
  },
};

export default storage;
