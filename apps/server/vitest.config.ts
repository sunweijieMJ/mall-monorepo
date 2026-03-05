import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['src/**/*.spec.ts'],
    testTimeout: 30000,
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
