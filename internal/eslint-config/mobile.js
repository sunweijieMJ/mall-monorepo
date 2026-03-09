import globals from 'globals';
import { config as adminConfig } from './admin.js';

/**
 * UniApp 移动端项目的 ESLint 配置
 * 基于 adminConfig，额外注入 UniApp 全局变量
 * @type {import("eslint").Linter.Config}
 */
export const config = [
  ...adminConfig,

  // ==================== UniApp 全局变量 ====================
  {
    languageOptions: {
      globals: {
        // UniApp 全局变量
        uni: 'readonly',
        UniApp: 'readonly',
        UniHelper: 'readonly',
        Page: 'readonly',
        getCurrentPages: 'readonly',
        getApp: 'readonly',
        plus: 'readonly',
        wx: 'readonly',
        my: 'readonly',
        // 自定义全局类型 (定义在 typings/uni.d.ts)
        UniIconsType: 'readonly',
        UniDataPickerValueArray: 'readonly',
        // UniApp 页面配置宏（类似 Vue 的 defineProps）
        definePage: 'readonly',
      },
    },
    rules: {
      // UniApp 模板使用 view/text 等非标准 HTML 标签，关闭相关检查
      'vue/no-deprecated-html-element-is': 'off',
    },
  },
];
