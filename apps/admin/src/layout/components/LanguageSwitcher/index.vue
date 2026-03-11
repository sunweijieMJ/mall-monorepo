<template>
  <el-dropdown
    @command="handleLanguageChange"
    @visible-change="(v: boolean) => (dropdownVisible = v)"
  >
    <div class="lang-trigger">
      <span class="lang-name">{{ currentLanguageName }}</span>
      <el-icon class="arrow-icon" :class="{ 'is-active': dropdownVisible }">
        <ArrowDown />
      </el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh-CN" :disabled="currentLocale === 'zh-CN'">
          中文
        </el-dropdown-item>
        <el-dropdown-item command="en-US" :disabled="currentLocale === 'en-US'">
          English
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue';
import { computed, ref, toRefs } from 'vue';
import type { LocaleKey } from '@/interface/system';
import { useGlobalStore } from '@/store';

const globalStore = useGlobalStore();
const { switchLocale } = globalStore;
const { currentLocale } = toRefs(globalStore);
const dropdownVisible = ref(false);

const languageNames = {
  'zh-CN': '中文',
  'en-US': 'English',
};

const currentLanguageName = computed(() => {
  return languageNames[currentLocale.value];
});

const handleLanguageChange = (locale: LocaleKey) => {
  switchLocale(locale);
};
</script>

<style scoped lang="scss">
.lang-trigger {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  transition: background-color 0.2s;
  border-radius: 6px;
  cursor: pointer;
  gap: 6px;

  &:focus-visible {
    outline: none;
  }

  &:hover {
    background-color: var(--controlItemBgHover);

    .arrow-icon {
      transform: rotate(180deg);
    }
  }
}

.lang-name {
  color: var(--colorText);
  font-size: 14px;
}

.arrow-icon {
  transition: transform 0.3s;
  color: var(--colorTextSecondary);
  font-size: 12px;

  &.is-active {
    transform: rotate(180deg);
  }
}
</style>
