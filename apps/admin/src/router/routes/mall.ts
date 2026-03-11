/**
 * Mall 业务路由配置
 * 从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
 *
 * 路由说明：
 * - hidden: true 不在侧边栏显示
 * - alwaysShow: true 始终显示根菜单
 * - redirect: noredirect 面包屑不跳转
 * - name 用于 <keep-alive> 缓存
 * - meta.title 侧边栏和面包屑显示的标题
 * - meta.icon 侧边栏显示的图标
 */

import {
  HomeFilled,
  DataAnalysis,
  Goods,
  List,
  CirclePlus,
  Menu,
  SetUp,
  Medal,
  Document,
  Setting,
  RefreshLeft,
  ChatDotRound,
  MagicStick,
  Lightning,
  Discount,
  Star,
  TrendCharts,
  Notebook,
  PictureFilled,
  Lock,
  UserFilled,
  Avatar,
  Grid,
  Collection,
} from '@element-plus/icons-vue';
import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';

/**
 * Mall 常规路由（无需权限即可访问）
 */
export const mallConstantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404.vue'),
    meta: { title: '404', hidden: true },
  },
  {
    path: '/403',
    name: '403',
    component: () => import('@/views/403.vue'),
    meta: { title: '403', hidden: true },
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    meta: { title: '首页', icon: HomeFilled },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '仪表盘', icon: DataAnalysis },
      },
    ],
  },
  // 系统设置（前端本地功能，无需后端菜单授权，但需要登录）
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/frontend',
    name: 'Setting',
    meta: { title: '系统设置', icon: Setting, hidden: true },
    children: [
      {
        path: '',
        redirect: '/setting/frontend',
        component: () => import('@/views/setting/index.vue'),
        meta: { hidden: true },
        children: [
          {
            path: 'frontend',
            name: 'SettingFrontend',
            component: () => import('@/views/setting/frontend.vue'),
            meta: { hidden: true },
          },
          {
            path: 'theme',
            name: 'SettingTheme',
            component: () => import('@/views/setting/theme.vue'),
            meta: { hidden: true },
          },
        ],
      },
    ],
  },
];

/**
 * Mall 异步路由（需要根据后端菜单数据动态加载）
 */
export const mallAsyncRoutes: RouteRecordRaw[] = [
  // 商品管理 (PMS)
  {
    path: '/pms',
    component: Layout,
    redirect: '/pms/product',
    name: 'PMS',
    meta: { title: '商品', icon: Goods },
    children: [
      {
        path: 'product',
        name: 'Product',
        component: () => import('@/views/pms/product/index.vue'),
        meta: { title: '商品列表', icon: List },
      },
      {
        path: 'addProduct',
        name: 'AddProduct',
        component: () => import('@/views/pms/product/add.vue'),
        meta: { title: '添加商品', icon: CirclePlus },
      },
      {
        path: 'updateProduct',
        name: 'UpdateProduct',
        component: () => import('@/views/pms/product/update.vue'),
        meta: { title: '修改商品', icon: CirclePlus, hidden: true },
      },
      {
        path: 'productCate',
        name: 'ProductCate',
        component: () => import('@/views/pms/productCate/index.vue'),
        meta: { title: '商品分类', icon: Menu },
      },
      {
        path: 'addProductCate',
        name: 'AddProductCate',
        component: () => import('@/views/pms/productCate/add.vue'),
        meta: { title: '添加商品分类', hidden: true },
      },
      {
        path: 'updateProductCate',
        name: 'UpdateProductCate',
        component: () => import('@/views/pms/productCate/update.vue'),
        meta: { title: '修改商品分类', hidden: true },
      },
      {
        path: 'productAttr',
        name: 'ProductAttr',
        component: () => import('@/views/pms/productAttr/index.vue'),
        meta: { title: '商品类型', icon: SetUp },
      },
      {
        path: 'productAttrList',
        name: 'ProductAttrList',
        component: () => import('@/views/pms/productAttr/productAttrList.vue'),
        meta: { title: '商品属性列表', hidden: true },
      },
      {
        path: 'addProductAttr',
        name: 'AddProductAttr',
        component: () => import('@/views/pms/productAttr/addProductAttr.vue'),
        meta: { title: '添加商品属性', hidden: true },
      },
      {
        path: 'updateProductAttr',
        name: 'UpdateProductAttr',
        component: () =>
          import('@/views/pms/productAttr/updateProductAttr.vue'),
        meta: { title: '修改商品属性', hidden: true },
      },
      {
        path: 'brand',
        name: 'Brand',
        component: () => import('@/views/pms/brand/index.vue'),
        meta: { title: '品牌管理', icon: Medal },
      },
      {
        path: 'addBrand',
        name: 'AddBrand',
        component: () => import('@/views/pms/brand/add.vue'),
        meta: { title: '添加品牌', hidden: true },
      },
      {
        path: 'updateBrand',
        name: 'UpdateBrand',
        component: () => import('@/views/pms/brand/update.vue'),
        meta: { title: '编辑品牌', hidden: true },
      },
    ],
  },

  // 订单管理 (OMS)
  {
    path: '/oms',
    component: Layout,
    redirect: '/oms/order',
    name: 'OMS',
    meta: { title: '订单', icon: Document },
    children: [
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/oms/order/index.vue'),
        meta: { title: '订单列表', icon: List },
      },
      {
        path: 'orderDetail',
        name: 'OrderDetail',
        component: () => import('@/views/oms/order/orderDetail.vue'),
        meta: { title: '订单详情', hidden: true },
      },
      {
        path: 'deliverOrderList',
        name: 'DeliverOrderList',
        component: () => import('@/views/oms/order/deliverOrderList.vue'),
        meta: { title: '发货列表', hidden: true },
      },
      {
        path: 'orderSetting',
        name: 'OrderSetting',
        component: () => import('@/views/oms/order/setting.vue'),
        meta: { title: '订单设置', icon: Setting },
      },
      {
        path: 'returnApply',
        name: 'ReturnApply',
        component: () => import('@/views/oms/apply/index.vue'),
        meta: { title: '退货申请处理', icon: RefreshLeft },
      },
      {
        path: 'returnReason',
        name: 'ReturnReason',
        component: () => import('@/views/oms/apply/reason.vue'),
        meta: { title: '退货原因设置', icon: ChatDotRound },
      },
      {
        path: 'returnApplyDetail',
        name: 'ReturnApplyDetail',
        component: () => import('@/views/oms/apply/applyDetail.vue'),
        meta: { title: '退货原因详情', hidden: true },
      },
    ],
  },

  // 营销管理 (SMS)
  {
    path: '/sms',
    component: Layout,
    redirect: '/sms/coupon',
    name: 'SMS',
    meta: { title: '营销', icon: MagicStick },
    children: [
      {
        path: 'flash',
        name: 'Flash',
        component: () => import('@/views/sms/flash/index.vue'),
        meta: { title: '秒杀活动列表', icon: Lightning },
      },
      {
        path: 'flashSession',
        name: 'FlashSession',
        component: () => import('@/views/sms/flash/sessionList.vue'),
        meta: { title: '秒杀时间段列表', hidden: true },
      },
      {
        path: 'selectSession',
        name: 'SelectSession',
        component: () => import('@/views/sms/flash/selectSessionList.vue'),
        meta: { title: '秒杀时间段选择', hidden: true },
      },
      {
        path: 'flashProductRelation',
        name: 'FlashProductRelation',
        component: () => import('@/views/sms/flash/productRelationList.vue'),
        meta: { title: '秒杀商品列表', hidden: true },
      },
      {
        path: 'coupon',
        name: 'Coupon',
        component: () => import('@/views/sms/coupon/index.vue'),
        meta: { title: '优惠券列表', icon: Discount },
      },
      {
        path: 'addCoupon',
        name: 'AddCoupon',
        component: () => import('@/views/sms/coupon/add.vue'),
        meta: { title: '添加优惠券', hidden: true },
      },
      {
        path: 'updateCoupon',
        name: 'UpdateCoupon',
        component: () => import('@/views/sms/coupon/update.vue'),
        meta: { title: '修改优惠券', hidden: true },
      },
      {
        path: 'couponHistory',
        name: 'CouponHistory',
        component: () => import('@/views/sms/coupon/history.vue'),
        meta: { title: '优惠券领取详情', hidden: true },
      },
      {
        path: 'brand',
        name: 'HomeBrand',
        component: () => import('@/views/sms/brand/index.vue'),
        meta: { title: '品牌推荐', icon: Medal },
      },
      {
        path: 'new',
        name: 'HomeNew',
        component: () => import('@/views/sms/new/index.vue'),
        meta: { title: '新品推荐', icon: Star },
      },
      {
        path: 'hot',
        name: 'HomeHot',
        component: () => import('@/views/sms/hot/index.vue'),
        meta: { title: '人气推荐', icon: TrendCharts },
      },
      {
        path: 'subject',
        name: 'HomeSubject',
        component: () => import('@/views/sms/subject/index.vue'),
        meta: { title: '专题推荐', icon: Notebook },
      },
      {
        path: 'advertise',
        name: 'HomeAdvertise',
        component: () => import('@/views/sms/advertise/index.vue'),
        meta: { title: '广告列表', icon: PictureFilled },
      },
      {
        path: 'addAdvertise',
        name: 'AddHomeAdvertise',
        component: () => import('@/views/sms/advertise/add.vue'),
        meta: { title: '添加广告', hidden: true },
      },
      {
        path: 'updateAdvertise',
        name: 'UpdateHomeAdvertise',
        component: () => import('@/views/sms/advertise/update.vue'),
        meta: { title: '编辑广告', hidden: true },
      },
    ],
  },

  // 权限管理 (UMS)
  {
    path: '/ums',
    component: Layout,
    redirect: '/ums/admin',
    name: 'UMS',
    meta: { title: '权限', icon: Lock },
    children: [
      {
        path: 'admin',
        name: 'Admin',
        component: () => import('@/views/ums/admin/index.vue'),
        meta: { title: '用户列表', icon: UserFilled },
      },
      {
        path: 'role',
        name: 'Role',
        component: () => import('@/views/ums/role/index.vue'),
        meta: { title: '角色列表', icon: Avatar },
      },
      {
        path: 'allocMenu',
        name: 'AllocMenu',
        component: () => import('@/views/ums/role/allocMenu.vue'),
        meta: { title: '分配菜单', hidden: true },
      },
      {
        path: 'allocResource',
        name: 'AllocResource',
        component: () => import('@/views/ums/role/allocResource.vue'),
        meta: { title: '分配资源', hidden: true },
      },
      {
        path: 'menu',
        name: 'Menu',
        component: () => import('@/views/ums/menu/index.vue'),
        meta: { title: '菜单列表', icon: Grid },
      },
      {
        path: 'addMenu',
        name: 'AddMenu',
        component: () => import('@/views/ums/menu/add.vue'),
        meta: { title: '添加菜单', hidden: true },
      },
      {
        path: 'updateMenu',
        name: 'UpdateMenu',
        component: () => import('@/views/ums/menu/update.vue'),
        meta: { title: '修改菜单', hidden: true },
      },
      {
        path: 'resource',
        name: 'Resource',
        component: () => import('@/views/ums/resource/index.vue'),
        meta: { title: '资源列表', icon: Collection },
      },
      {
        path: 'resourceCategory',
        name: 'ResourceCategory',
        component: () => import('@/views/ums/resource/categoryList.vue'),
        meta: { title: '资源分类', hidden: true },
      },
    ],
  },
];

export default {
  mallConstantRoutes,
  mallAsyncRoutes,
};
