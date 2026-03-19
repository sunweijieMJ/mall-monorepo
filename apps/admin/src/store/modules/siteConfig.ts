import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  settingControllerFindByPathV1,
  settingControllerUpsertV1,
} from '@/api';
import {
  defaultSiteConfig,
  mergeConfig,
  type SiteConfig,
} from '@/constants/siteConfig';

const CONFIG_PATH = 'frontend';

export const useSiteConfigStore = defineStore(
  'siteConfig',
  () => {
    // 用户自定义配置（只存储覆盖的部分）
    const config = ref<Partial<SiteConfig>>({});

    // 合并默认值后的完整配置
    const savedConfig = computed(() => mergeConfig(config.value));

    /**
     * 从服务端加载配置
     */
    const load = async () => {
      try {
        const res = await settingControllerFindByPathV1(CONFIG_PATH);
        if (res?.value) {
          config.value = res.value as Partial<SiteConfig>;
        }
      } catch {
        // 加载失败时使用本地持久化数据
      }
    };

    /**
     * 保存配置（同步到服务端）
     */
    const save = async (newConfig: Partial<SiteConfig>) => {
      config.value = newConfig;
      try {
        await settingControllerUpsertV1(CONFIG_PATH, { value: newConfig });
      } catch {
        // 写入失败时本地已保存，不影响使用
      }
    };

    /**
     * 恢复默认配置
     */
    const reset = async () => {
      config.value = {};
      try {
        await settingControllerUpsertV1(CONFIG_PATH, { value: {} });
      } catch {
        // 同上
      }
    };

    return { config, savedConfig, load, save, reset };
  },
  { persist: true },
);
