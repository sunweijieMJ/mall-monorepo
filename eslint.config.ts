import { baseConfig } from '@kit/eslint-config/base';
import type { Linter } from 'eslint';

const eslintConfig: Linter.Config[] = [
  ...(Array.isArray(baseConfig) ? baseConfig : [baseConfig]),
  {
    ignores: [
      '**/node_modules/**/*',
      '**/dist/**/*',
      '**/*.log',
    ],
  },
];

export default eslintConfig;
