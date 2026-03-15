<template>
  <el-tooltip :content="$t('layout.themeSwitch')" placement="bottom">
    <el-button
      link
      :icon="currentTheme === 'dark' ? Sunny : Moon"
      class="theme-switcher-btn"
      @click="toggleTheme"
    />
  </el-tooltip>
</template>

<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue';
import { toRefs } from 'vue';
import { useGlobalStore } from '@/store';

const globalStore = useGlobalStore();
const { currentTheme } = toRefs(globalStore);
const { toggleTheme } = globalStore;
</script>

<style scoped lang="scss">
.theme-switcher-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: background-color 0.2s;
  border-radius: 6px;

  &:hover {
    background-color: var(--controlItemBgHover);
  }

  :deep(.el-icon) {
    font-size: 18px;
  }
}
</style>
