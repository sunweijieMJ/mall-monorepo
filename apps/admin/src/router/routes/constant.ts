/**
 * 常量路由（无需后端菜单授权，直接注册）
 * 包括公共页面和需要登录的本地功能页
 */

import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/index.vue';
import { resolveIcon } from '@/utils/iconMap';

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
    meta: { title: '首页', icon: resolveIcon('HomeFilled') },
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '仪表盘',
          icon: resolveIcon('DataAnalysis'),
          affix: true,
        },
      },
    ],
  },
  // 系统设置（前端本地功能，无需后端菜单授权，但需要登录）
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/frontend',
    name: 'Setting',
    meta: { title: '系统设置', icon: resolveIcon('Setting'), hidden: true },
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
