import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      // 各 app 的 defineProject 配置（include 路径相对各自目录）
      'apps/admin/vitest.config.ts',
      'apps/mobile/vitest.config.ts',
      // server - 纯 Node 环境
      'apps/server/vitest.config.ts',
    ],
  },
});
