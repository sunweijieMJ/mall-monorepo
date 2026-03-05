import { baseConfig } from './base.js';
import {
  commonTypeScriptRules,
  commonEslintRules,
} from './common-rules.js';

/**
 * 后端项目的 ESLint 配置
 * 基于 baseConfig，无 Vue 规则，适配装饰器模式
 * @type {import("eslint").Linter.Config}
 */
export const config = [
  ...baseConfig,

  // ==================== TypeScript 规则 ====================
  {
    rules: {
      ...commonTypeScriptRules,
    },
  },

  // ==================== ESLint 通用规则 ====================
  {
    rules: commonEslintRules,
  },
];
