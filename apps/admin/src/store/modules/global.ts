import { defineStore } from 'pinia';
import { ref } from 'vue';
import {
  settingControllerFindByPathV1,
  settingControllerUpsertV1,
} from '@/api';
import { DEFAULT_LOCALE, DEFAULT_THEME_STYLE } from '@/constants/system';
import type { LocaleKey, ThemeStyleKey } from '@/interface/system';
import type { ThemeData, ThemeVars } from '@/utils/theme';
import {
  applyThemeVarsToDOM,
  clearCustomThemeVars,
  getDefaultThemeVars,
} from '@/utils/theme';

const CONFIG_PATH = 'theme';

export const useGlobalStore = defineStore(
  'global',
  () => {
    // ==================== 语言相关 ====================
    const currentLocale = ref<LocaleKey>(DEFAULT_LOCALE as LocaleKey);

    /**
     * 切换语言
     * @param locale 语言代码
     */
    const switchLocale = (locale: LocaleKey) => {
      currentLocale.value = locale;
    };

    /**
     * 初始化语言设置
     */
    const initLocale = () => {
      // 持久化插件会自动恢复，无需手动获取
      if (!currentLocale.value) {
        currentLocale.value = DEFAULT_LOCALE as LocaleKey;
      }
    };

    // ==================== 主题相关 ====================
    const currentTheme = ref<ThemeStyleKey>(
      DEFAULT_THEME_STYLE as ThemeStyleKey,
    );

    /**
     * 切换主题
     */
    const toggleTheme = () => {
      const newTheme: ThemeStyleKey =
        currentTheme.value === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
    };

    /**
     * 设置主题
     */
    const setTheme = (theme: ThemeStyleKey) => {
      currentTheme.value = theme;
    };

    /**
     * 初始化主题
     */
    const initTheme = () => {
      // 持久化插件会自动恢复，无需手动获取
      if (!currentTheme.value) {
        currentTheme.value = DEFAULT_THEME_STYLE as ThemeStyleKey;
      }
    };

    // ==================== 自定义主题变量 ====================
    const customThemeVars = ref<ThemeData>({ light: {}, dark: {} });

    /** 应用自定义主题到 DOM（先清除所有旧 inline styles，再应用当前主题的覆盖） */
    const applyCustomTheme = () => {
      // 清除所有主题的 inline styles，避免切换主题时残留
      for (const vars of Object.values(customThemeVars.value)) {
        clearCustomThemeVars(vars);
      }
      // 应用当前主题的自定义变量
      const customVars = customThemeVars.value[currentTheme.value];
      if (Object.keys(customVars).length > 0) {
        applyThemeVarsToDOM(customVars);
      }
    };

    /** 设置单个主题变量 */
    const setThemeVar = (
      varName: string,
      value: string,
      theme?: ThemeStyleKey,
    ) => {
      const themeKey = theme ?? currentTheme.value;
      customThemeVars.value[themeKey][varName] = value;
    };

    /** 批量设置主题变量 */
    const setThemeVars = (vars: ThemeVars, theme?: ThemeStyleKey) => {
      const themeKey = theme ?? currentTheme.value;
      customThemeVars.value[themeKey] = {
        ...customThemeVars.value[themeKey],
        ...vars,
      };
    };

    /** 删除单个自定义变量（恢复为默认值） */
    const removeThemeVar = (varName: string, theme?: ThemeStyleKey) => {
      const themeKey = theme ?? currentTheme.value;
      delete customThemeVars.value[themeKey][varName];
      if (themeKey === currentTheme.value) {
        document.documentElement.style.removeProperty(`--${varName}`);
      }
    };

    /** 重置自定义主题 */
    const resetCustomTheme = (theme?: ThemeStyleKey) => {
      const themeKey = theme ?? currentTheme.value;
      const currentCustomVars = customThemeVars.value[themeKey];
      clearCustomThemeVars(currentCustomVars);
      customThemeVars.value[themeKey] = {};
    };

    /** 获取合并后的主题变量（默认 + 自定义覆盖） */
    const getMergedThemeVars = (theme?: ThemeStyleKey): ThemeVars => {
      const themeKey = theme ?? currentTheme.value;
      const defaults = getDefaultThemeVars(themeKey);
      const custom = customThemeVars.value[themeKey];
      return { ...defaults, ...custom };
    };

    // ==================== 主题配置持久化 ====================

    /** 从服务端加载自定义主题变量 */
    const loadTheme = async () => {
      try {
        const res = await settingControllerFindByPathV1(CONFIG_PATH);
        if (res?.value) {
          customThemeVars.value = res.value as ThemeData;
          applyCustomTheme();
        }
      } catch {
        // 加载失败时使用本地持久化数据
      }
    };

    /** 保存自定义主题变量到服务端 */
    const saveTheme = async () => {
      try {
        await settingControllerUpsertV1(CONFIG_PATH, {
          value: customThemeVars.value,
        });
      } catch {
        // 写入失败时本地已保存，不影响使用
      }
    };

    // ==================== 高级模式相关 ====================
    const advanceMode = ref<boolean>(false);
    const clickCount = ref<number>(0);
    const clickTimer = ref<ReturnType<typeof setTimeout> | null>(null);

    /**
     * 切换高级模式
     */
    const toggleAdvanceMode = () => {
      advanceMode.value = !advanceMode.value;
    };

    /**
     * 处理Logo连续点击逻辑
     * @param onNormalClick 正常点击时的回调
     * @param onAdvanceModeToggle 高级模式切换时的回调
     */
    const handleLogoClick = (
      onAdvanceModeToggle?: (isEnabled: boolean) => void,
    ) => {
      clickCount.value++;

      if (clickTimer.value) {
        clearTimeout(clickTimer.value);
      }

      if (clickCount.value === 5) {
        toggleAdvanceMode();
        onAdvanceModeToggle?.(advanceMode.value);
        clickCount.value = 0;
        return;
      }

      clickTimer.value = setTimeout(() => {
        clickCount.value = 0;
      }, 500);
    };

    return {
      // 语言相关
      currentLocale,
      switchLocale,
      initLocale,

      // 主题相关
      currentTheme,
      toggleTheme,
      setTheme,
      initTheme,

      // 自定义主题相关
      customThemeVars,
      applyCustomTheme,
      setThemeVar,
      setThemeVars,
      removeThemeVar,
      resetCustomTheme,
      getMergedThemeVars,

      // 主题配置持久化
      loadTheme,
      saveTheme,

      // 高级模式相关
      advanceMode,
      handleLogoClick,
    };
  },
  {
    persist: true,
  },
);
