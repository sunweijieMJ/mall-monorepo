declare module '@kit/eslint-config/base' {
  import type { Linter } from 'eslint';
  export const baseConfig: Linter.Config[];
}

declare module '@kit/eslint-config/admin' {
  import type { Linter } from 'eslint';
  export const config: Linter.Config[];
}

declare module '@kit/eslint-config/mobile' {
  import type { Linter } from 'eslint';
  export const config: Linter.Config[];
}

declare module '@kit/eslint-config/backend' {
  import type { Linter } from 'eslint';
  export const config: Linter.Config[];
}
