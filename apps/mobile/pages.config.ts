import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages';

/**
 * 页面配置（替代 src/pages.json）
 * 插件自动扫描 src/pages/ 目录下的 .vue 文件，
 * 页面样式通过各页面 <script setup> 中的 definePage() 宏声明。
 *
 * 文档：https://github.com/uni-helper/vite-plugin-uni-pages
 */
export default defineUniPages({
  easycom: {
    autoscan: true,
    custom: {
      // 自定义组件（大写 U 前缀）
      '^U(.*)': '@/components/U$1/index.vue',
    },
  },

  pages: [],

  /**
   * 分包配置（微信小程序主包限制 2MB，总包限制 20MB）
   * 分包原则：TabBar 页面 / 启动页面必须在主包，其余按业务模块划分
   */
  subPackages: [
    {
      root: 'pages-sub/order',
      pages: [],
    },
    {
      root: 'pages-sub/user',
      pages: [],
    },
    {
      root: 'pages-sub/product',
      pages: [],
    },
  ],

  globalStyle: {
    navigationBarTextStyle: 'black',
    navigationBarTitleText: '商城',
    navigationBarBackgroundColor: '#F8F8F8',
    backgroundColor: '#F8F8F8',
  },

  tabBar: {
    color: '#7A7E83',
    selectedColor: '#3cc51f',
    borderStyle: 'black',
    backgroundColor: '#ffffff',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: 'static/tab-home.png',
        selectedIconPath: 'static/tab-home-current.png',
        text: '首页',
      },
      {
        pagePath: 'pages/category/category',
        iconPath: 'static/tab-cate.png',
        selectedIconPath: 'static/tab-cate-current.png',
        text: '分类',
      },
      {
        pagePath: 'pages/cart/cart',
        iconPath: 'static/tab-cart.png',
        selectedIconPath: 'static/tab-cart-current.png',
        text: '购物车',
      },
      {
        pagePath: 'pages/user/user',
        iconPath: 'static/tab-my.png',
        selectedIconPath: 'static/tab-my-current.png',
        text: '我的',
      },
    ],
  },
});
