import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      // 各 app 的 defineProject 配置（include 路径相对各自目录）
      'apps/admin/vitest.config.ts',
      'apps/mobile/vitest.config.ts',
      // backend - 纯 Node 环境（待 backend 应用创建后可改为 'apps/backend/vitest.config.ts'）
      {
        test: {
          name: 'backend',
          globals: true,
          environment: 'node',
          root: path.resolve(dirname),
          include: [
            'apps/backend/src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
            'apps/backend/**/__test__/**/*.{test,spec}.?(c|m)[jt]s?(x)',
            'apps/backend/**/__tests__/**/*.{test,spec}.?(c|m)[jt]s?(x)',
            'apps/backend/**/test/**/*.{test,spec}.?(c|m)[jt]s?(x)',
            'apps/backend/**/tests/**/*.{test,spec}.?(c|m)[jt]s?(x)',
          ],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
          ],
        },
      },
    ],
  },
});
