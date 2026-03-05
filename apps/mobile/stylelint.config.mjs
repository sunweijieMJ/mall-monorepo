import vueAppConfig from '@kit/stylelint-config/vue-app';

export default {
  ...vueAppConfig,
  rules: {
    ...vueAppConfig.rules,
    // UniApp 兼容：关闭颜色函数语法检查，保持 rgba() 格式
    'color-function-notation': null,
    'color-function-alias-notation': null,
    'alpha-value-notation': null,
    // v-bind 变量名可能含大写，关闭关键字大小写检查
    'value-keyword-case': null,
    // UniApp 图标字体
    'font-family-no-missing-generic-family-keyword': [
      true,
      { ignoreFontFamilies: ['iconfont', 'yticon'] },
    ],
    // UniApp 允许 rpx/upx 单位
    'unit-no-unknown': [true, { ignoreUnits: ['rpx', 'upx'] }],
    // 关闭属性值语法检查：rpx/upx 单位及 SCSS 变量会被误报，已有 unit-no-unknown 兜底
    'declaration-property-value-no-unknown': null,
    // UniApp / 小程序自定义元素
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: [
          'page',
          'swiper',
          'scroll-view',
          'swiper-item',
          'cover-view',
          'cover-image',
          'icon',
          'rich-text',
          'checkbox',
          'radio',
          'slider',
          'navigator',
          'camera',
          'movable-view',
          'checkbox-group',
          'picker',
          'picker-view',
          'picker-view-column',
          'radio-group',
          'live-player',
          'live-pusher',
          'open-data',
          'web-view',
          'ad',
          'official-account',
        ],
      },
    ],
  },
};
