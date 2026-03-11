import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  defaultSiteConfig,
  mergeConfig,
  type SiteConfig,
} from '@/constants/siteConfig';

export const useSiteConfigStore = defineStore(
  'siteConfig',
  () => {
    // 用户自定义配置（只存储覆盖的部分）
    const config = ref<Partial<SiteConfig>>({});

    // 合并默认值后的完整配置
    const savedConfig = computed(() => mergeConfig(config.value));

    /**
     * 保存配置
     */
    const save = (newConfig: Partial<SiteConfig>) => {
      config.value = newConfig;
    };

    /**
     * 恢复默认配置
     */
    const reset = () => {
      config.value = {};
    };

    return { config, savedConfig, save, reset };
  },
  { persist: true },
);
