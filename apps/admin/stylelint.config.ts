import vueAppConfig from '@kit/stylelint-config/vue-app';
import type { Config } from 'stylelint';

const config: Config = {
  ...vueAppConfig,
  ignoreFiles: [...(vueAppConfig.ignoreFiles as string[])],
};

export default config;
