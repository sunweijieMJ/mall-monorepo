import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    passWithNoTests: true,
    projects: [
      // Vue 应用测试（admin / mobile）- jsdom 浏览器环境
      {
        plugins: [vue()],
        test: {
          name: 'browser',
          globals: true,
          environment: 'jsdom',
          setupFiles: [path.resolve(dirname, 'vitest.setup.ts')],
          include: [
            'apps/admin/**/__test__/*.{test,spec}.?(c|m)[jt]s?(x)',
            'apps/mobile/**/__test__/*.{test,spec}.?(c|m)[jt]s?(x)',
            'packages/**/__test__/*.{test,spec}.?(c|m)[jt]s?(x)',
          ],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/coverage/**',
          ],
        },
      },
      // Node.js 后端测试（backend）- 纯 Node 环境
      {
        test: {
          name: 'node',
          globals: true,
          environment: 'node',
          include: [
            'apps/backend/**/__test__/*.{test,spec}.?(c|m)[jt]s?(x)',
            'apps/backend/**/__tests__/*.{test,spec}.?(c|m)[jt]s?(x)',
            'apps/backend/**/test/*.{test,spec}.?(c|m)[jt]s?(x)',
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
