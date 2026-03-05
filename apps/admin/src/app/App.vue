<template>
  <el-config-provider :locale="elementPlusLocale">
    <ErrorBoundary @error="handleError">
      <SentryProvider ref="sentryProviderRef">
        <router-view />
      </SentryProvider>
    </ErrorBoundary>
  </el-config-provider>
</template>
<script setup lang="ts">
import { ElConfigProvider } from 'element-plus';
import { computed, watchEffect, onMounted, toRefs, ref } from 'vue';
import ErrorBoundary from '@/components/ErrorBoundary/index.vue';
import SentryProvider from '@/components/SentryProvider/index.vue';
import { provideLayoutContext } from '@/layout/useLayoutContext';
import dayjs from '@/plugins/dayjs';
import { loadLocaleMessages } from '@/plugins/locale';
import { useGlobalStore } from '@/store';
import { getElementPlusLocale } from '@/utils/locale';

const globalStore = useGlobalStore();
const { currentLocale, currentTheme } = toRefs(globalStore);
const { initLocale, initTheme } = globalStore;

// SentryProvider 引用
const sentryProviderRef = ref<InstanceType<typeof SentryProvider>>();

// 提供布局上下文给整个应用
provideLayoutContext();

// 处理 ErrorBoundary 捕获的错误
const handleError = (error: Error, errorInfo: any) => {
  // 将错误上报到 Sentry
  if (sentryProviderRef.value) {
    sentryProviderRef.value.captureError(error, {
      errorInfo,
      component: 'App',
    });
  }
};

onMounted(() => {
  initLocale();
  initTheme();
});

// 根据当前语言自动获取 Element Plus 语言包
const elementPlusLocale = computed(() => {
  return getElementPlusLocale(globalStore.currentLocale);
});

// 监听语言变化并重新加载语言包
watchEffect(async () => {
  const locale = currentLocale.value;
  await loadLocaleMessages(locale);
  // 设置网站语言
  document.documentElement.setAttribute('lang', currentLocale.value);
  // 设置日期国际化
  dayjs.locale(currentLocale.value);
});

// 监听主题变化
watchEffect(() => {
  const html = document.documentElement;
  const theme = currentTheme.value;
  // 切换主题
  html.setAttribute('theme', theme);
  html.classList.remove('light', 'dark');
  html.classList.add(theme);
});
</script>
<style lang="scss">
@use './index';

html,
body,
#main-app {
  min-width: 1280px;
  background-color: var(--colorBgLayout);
  color: var(--colorTextBase);
  font-family:
    'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
}
</style>
