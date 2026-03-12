import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(dirname, 'src') },
  },
  test: {
    name: 'admin',
    // 允许没有测试文件
    passWithNoTests: true,
    // 测试环境配置
    environment: 'jsdom',
    // 全局API支持
    globals: true,
    // 测试文件匹配模式
    include: [
      '__test__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    // 排除文件
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
    ],
    // 测试设置文件
    setupFiles: [path.resolve(dirname, '../../vitest.setup.ts')],
    // 服务器配置
    server: {
      deps: {
        // 内联以避免CSS导入问题
        inline: ['element-plus'],
      },
    },
    // 测试覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/build/**',
        'deploy/',
        'scripts/',
        '.claude/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
