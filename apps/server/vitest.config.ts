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
    // 限制并发 worker 数，避免 E2E 测试并发创建过多 NestJS 实例导致 socket hang up
    maxWorkers: 5,
    // reflect-metadata 必须在 entity import 之前加载
    setupFiles: ['./test/setup.ts'],
    passWithNoTests: true,
    // 单元测试（test/unit/）+ E2E 测试（test/e2e/）统一放在 test/ 目录下
    include: ['test/**/*.spec.ts', 'test/**/*.e2e-spec.ts'],
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
        // 纯配置/种子/类型文件 — 无可测逻辑
        'src/infrastructure/database/seeds/**',
        'src/infrastructure/database/data-source.ts',
        'src/infrastructure/database/config/*.ts',
        'src/infrastructure/database/typeorm-config.service.ts',
        'src/infrastructure/redis/config/*.ts',
        'src/infrastructure/logger/config/*.ts',
        'src/infrastructure/throttler/*.ts',
        'src/infrastructure/metrics/metrics.config.ts',
        'src/infrastructure/metrics/metrics-config.type.ts',
        'src/config/*.ts',
        'src/core/auth/config/*-config.type.ts',
        'src/core/auth/types/*.ts',
        'src/modules/portal/payment/config/*.ts',
        'src/common/validate-config.ts',
      ],
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: '../coverage',
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
