<template>
  <div class="theme-setting-page">
    <ThemeToolbar
      v-model:edit-mode="editMode"
      v-model:edit-theme="editTheme"
      :modified-count="modifiedCount"
      @apply="handleApply"
      @export="handleExport"
      @reset="handleReset"
    />

    <div class="theme-editor-container">
      <ThemeVisualEditor
        v-if="editMode === 'visual'"
        :edit-theme="editTheme"
        :merged-vars="mergedVars"
        :custom-vars="customVars"
        @change="handleVarChange"
        @reset="handleVarReset"
      />
      <ThemeCodeEditor
        v-else
        :edit-theme="editTheme"
        :merged-vars="mergedVars"
        @update="handleCodeUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import ThemeCodeEditor from './components/ThemeCodeEditor.vue';
import ThemeToolbar from './components/ThemeToolbar.vue';
import ThemeVisualEditor from './components/ThemeVisualEditor.vue';
import type { ThemeStyleKey } from '@/interface/system';
import { useGlobalStore } from '@/store';
import type { ThemeVars } from '@/utils/theme';
import {
  applyThemeVarsToDOM,
  generateThemeCSS,
  getDefaultThemeVars,
} from '@/utils/theme';

const globalStore = useGlobalStore();

const editMode = ref<'visual' | 'code'>('visual');
const editTheme = ref<ThemeStyleKey>(globalStore.currentTheme);

const customVars = computed(() => globalStore.customThemeVars[editTheme.value]);
const mergedVars = computed(() =>
  globalStore.getMergedThemeVars(editTheme.value),
);
const modifiedCount = computed(() => Object.keys(customVars.value).length);

function handleVarChange(varName: string, value: string) {
  globalStore.setThemeVar(varName, value, editTheme.value);
  // 如果编辑的是当前生效的主题，实时预览
  if (editTheme.value === globalStore.currentTheme) {
    applyThemeVarsToDOM({ [varName]: value });
  }
}

function handleVarReset(varName: string) {
  globalStore.removeThemeVar(varName, editTheme.value);
}

function handleCodeUpdate(vars: ThemeVars) {
  const defaults = getDefaultThemeVars(editTheme.value);
  const customChanges: ThemeVars = {};

  for (const [key, value] of Object.entries(vars)) {
    if (defaults[key] !== undefined && defaults[key] !== value) {
      customChanges[key] = value;
    }
  }

  globalStore.resetCustomTheme(editTheme.value);
  if (Object.keys(customChanges).length > 0) {
    globalStore.setThemeVars(customChanges, editTheme.value);
  }

  if (editTheme.value === globalStore.currentTheme) {
    globalStore.applyCustomTheme();
  }
}

function handleApply() {
  if (editTheme.value === globalStore.currentTheme) {
    globalStore.applyCustomTheme();
    ElMessage.success('自定义颜色已应用');
  } else {
    globalStore.setTheme(editTheme.value);
    ElMessage.success(
      `已切换到 ${editTheme.value === 'dark' ? '深色' : '浅色'} 主题`,
    );
  }
}

function handleExport() {
  const css = generateThemeCSS(mergedVars.value, editTheme.value);
  const blob = new Blob([css], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `theme-${editTheme.value}.css`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
  ElMessage.success('CSS 文件已导出');
}

function handleReset() {
  globalStore.resetCustomTheme(editTheme.value);
  if (editTheme.value === globalStore.currentTheme) {
    globalStore.applyCustomTheme();
  }
  ElMessage.success('已重置为默认主题');
}
</script>

<style lang="scss" scoped>
.theme-setting-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: var(--colorBgContainer);
}

.theme-editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
