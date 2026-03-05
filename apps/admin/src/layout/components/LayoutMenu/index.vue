<template>
  <div class="layout-menu">
    <div class="side-menu">
      <div
        v-for="item in menuItems"
        :key="item.key"
        class="menu-item"
        :class="{ active: activeMenu === item.key }"
        :title="item.title"
        @click="handleMenuClick(item.key)"
      >
        <el-icon>
          <component :is="item.icon" />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  PieChart,
  Calendar,
  UserFilled,
  Medal,
  FirstAidKit,
} from '@element-plus/icons-vue';
import { ref } from 'vue';

interface MenuItem {
  key: string;
  title: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    title: '仪表盘',
    icon: 'PieChart',
  },
  {
    key: 'labAppointment',
    title: '实验室预约',
    icon: 'Calendar',
  },
  {
    key: 'internship',
    title: '实习管理',
    icon: 'UserFilled',
  },
  {
    key: 'competition',
    title: '竞赛管理',
    icon: 'Medal',
  },
  {
    key: 'inventory',
    title: '库存管理',
    icon: 'FirstAidKit',
  },
];

const activeMenu = ref('dashboard');

const emit = defineEmits(['menuChange']);

const handleMenuClick = (menu: string) => {
  activeMenu.value = menu;
  emit('menuChange', menu);
};
</script>

<style scoped lang="scss">
.layout-menu {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.side-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 45px;
  padding: 4px;
  border-radius: 100px;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  cursor: pointer;

  .el-icon {
    color: #000;
    font-size: 18px;
  }

  &:hover {
    background-color: #f5f7fa;
  }

  &.active {
    background-color: #3dd7e3;

    .el-icon {
      color: #fff;
    }
  }
}
</style>
