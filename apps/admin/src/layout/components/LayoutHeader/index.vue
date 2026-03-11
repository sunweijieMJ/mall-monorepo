<template>
  <header class="layout-header">
    <!-- 左侧 Logo -->
    <div class="header-left">
      <div class="logo" @click="handleLogoClick">
        <AppLogo
          :show-icon="headerVisible.logoIcon"
          :show-title="headerVisible.logoTitle"
          :title="logoTitle"
        />
      </div>
    </div>

    <!-- 中间面包屑 -->
    <div class="header-center">
      <LayoutBreadcrumb />
    </div>

    <!-- 右侧工具栏 -->
    <div class="header-right">
      <ThemeSwitcher v-if="headerVisible.themeSwitch" />
      <LanguageSwitcher v-if="headerVisible.localeSwitch" />
      <SettingButton v-if="headerVisible.setting && globalStore.advanceMode" />
      <HeaderAvatar v-if="headerVisible.avatar" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { useHeaderControl } from '../../useLayoutContext';
import AppLogo from '../AppLogo/index.vue';
import HeaderAvatar from '../HeaderAvatar/index.vue';
import LanguageSwitcher from '../LanguageSwitcher/index.vue';
import LayoutBreadcrumb from '../LayoutBreadcrumb/index.vue';
import SettingButton from '../SettingButton/index.vue';
import ThemeSwitcher from '../ThemeSwitcher/index.vue';
import { useGlobalStore } from '@/store';

const router = useRouter();
const globalStore = useGlobalStore();
const { headerVisible } = useHeaderControl();

interface Props {
  logoTitle?: string;
}

withDefaults(defineProps<Props>(), {
  logoTitle: '',
});

const handleLogoClick = () => {
  router.push('/');
  globalStore.handleLogoClick((isEnabled: boolean) => {
    if (isEnabled) {
      ElMessage.success('高级模式已开启');
    } else {
      ElMessage.info('高级模式已关闭');
    }
  });
};
</script>

<style scoped lang="scss">
.layout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
  border-bottom: 1px solid var(--colorBorderSecondary);
  background-color: var(--colorBgContainer);
}

.header-left {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  transition: opacity 0.3s ease;
  cursor: pointer;
  gap: 8px;

  &:hover {
    opacity: 0.8;
  }
}

.header-center {
  flex: 1;
  padding: 0 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
