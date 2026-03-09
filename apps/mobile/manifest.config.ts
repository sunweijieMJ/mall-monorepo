import { defineManifestConfig } from '@uni-helper/vite-plugin-uni-manifest';

/**
 * Manifest 配置（替代 src/manifest.json）
 * 文档：https://github.com/uni-helper/vite-plugin-uni-manifest
 */
export default defineManifestConfig({
  name: 'Mall商城',
  appid: '__UNI__MALL001',
  description: 'Vue3+TypeScript商城应用',
  versionName: '1.0.0',
  versionCode: '100',
  transformPx: false,

  /* 微信小程序配置 */
  'mp-weixin': {
    appid: '',
    darkmode: true,
    themeLocation: 'theme.json',
    setting: {
      urlCheck: false,
      es6: true,
      postcss: true,
      minified: true,
    },
    usingComponents: true,
    // 按需注入组件，优化启动性能
    lazyCodeLoading: 'requiredComponents',
    // 分包优化
    optimization: {
      subPackages: true,
    },
  },

  /* 支付宝小程序配置 */
  'mp-alipay': {
    appid: '',
    usingComponents: true,
    // 启用 component2 编译模式
    component2: true,
  },

  /* 百度小程序配置 */
  'mp-baidu': {
    usingComponents: true,
  },

  /* 抖音小程序配置 */
  'mp-toutiao': {
    usingComponents: true,
  },

  /* H5 配置 */
  h5: {
    title: 'Mall商城',
    darkmode: true,
    themeLocation: 'theme.json',
    router: {
      mode: 'history',
      base: '/',
    },
    optimization: {
      treeShaking: {
        enable: true,
      },
    },
  },

  /* App 配置 */
  'app-plus': {
    usingComponents: true,
    nvueStyleCompiler: 'uni-app',
    compilerVersion: 3,
    darkmode: true,
    themeLocation: 'theme.json',
    splashscreen: {
      alwaysShowBeforeRender: true,
      waiting: true,
      autoclose: true,
      delay: 0,
    },
    modules: {},
    distribute: {
      android: {
        permissions: [],
      },
      ios: {},
      sdkConfigs: {},
    },
  },

  uniStatistics: {
    enable: false,
  },

  vueVersion: '3',
});
