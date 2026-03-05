import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineProject } from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineProject({
  resolve: {
    alias: { '@': path.resolve(dirname, 'src') },
  },
  test: {
    name: 'mobile',
    globals: true,
    environment: 'jsdom',
    setupFiles: [path.resolve(dirname, '../../vitest.setup.ts')],
    include: [
      'src/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      '__test__/**/*.{test,spec}.?(c|m)[jt]s?(x)',
      'tests/**/*.{test,spec}.?(c|m)[jt]s?(x)',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
    ],
  },
});
