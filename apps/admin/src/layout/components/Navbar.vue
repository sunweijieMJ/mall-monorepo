<!--
  顶部导航栏组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <el-menu class="navbar" mode="horizontal">
    <!-- 汉堡菜单 -->
    <Hamburger
      class="hamburger-container"
      :is-active="sidebar.opened"
      @toggle-click="toggleSideBar"
    />

    <!-- 面包屑 -->
    <Breadcrumb class="breadcrumb-container" />

    <!-- 右侧用户下拉菜单 -->
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <img class="user-avatar" :src="avatar" />
        <el-icon class="el-icon-caret-bottom">
          <CaretBottom />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="user-dropdown">
          <router-link to="/" class="inline-block">
            <el-dropdown-item>首页</el-dropdown-item>
          </router-link>
          <el-dropdown-item divided @click="logout">
            <span style="display: block">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<script setup lang="ts">
import { CaretBottom } from '@element-plus/icons-vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import Breadcrumb from './Breadcrumb.vue';
import Hamburger from './Hamburger.vue';
import { useMallAppStore } from '@/store/modules/mallApp';
import { useMallUserStore } from '@/store/modules/mallUser';

const appStore = useMallAppStore();
const userStore = useMallUserStore();
const router = useRouter();

// 侧边栏状态
const sidebar = computed(() => appStore.sidebar);

// 用户头像
const avatar = computed(
  () =>
    userStore.avatar ||
    'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
);

// 切换侧边栏
const toggleSideBar = () => {
  appStore.toggleSidebar();
};

// 退出登录
const logout = async () => {
  await userStore.logoutAction();
  // 刷新页面以重新实例化vue-router对象，避免bug
  location.reload();
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  border-radius: 0 !important;
  box-shadow: 0 1px 4px rgb(0 21 41 / 0.08);
  line-height: 50px;

  .hamburger-container {
    height: 50px;
    padding: 0 10px;
    float: left;
    transition: background 0.3s;
    line-height: 58px;
    cursor: pointer;

    &:hover {
      background: rgb(0 0 0 / 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
    line-height: 50px;
  }

  .avatar-container {
    display: inline-block;
    position: absolute;
    right: 35px;
    height: 50px;

    .avatar-wrapper {
      display: flex;
      position: relative;
      align-items: center;
      margin-top: 5px;
      cursor: pointer;

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }

      .el-icon-caret-bottom {
        margin-left: 8px;
        font-size: 12px;
      }
    }
  }
}

.inline-block {
  display: inline-block;
}
</style>
