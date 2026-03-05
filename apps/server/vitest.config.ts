import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';
import swc from 'unplugin-swc';

export default defineConfig({
  plugins: [
    // 使用 SWC 转译，支持 emitDecoratorMetadata（TypeORM 装饰器元数据必需）
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { decoratorMetadata: true },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    // reflect-metadata 必须在 entity import 之前加载
    setupFiles: ['./test/setup.ts'],
    passWithNoTests: true,
    // 单元测试 + 集成测试均包含
    include: ['src/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
    // 集成测试涉及模块编译，超时时间适当延长
    testTimeout: 60000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        '**/*.module.ts',
        '**/*.dto.ts',
        '**/*.entity.ts',
        '**/index.ts',
        'src/main.ts',
        '**/*.d.ts',
      ],
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: '../coverage',
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
});
