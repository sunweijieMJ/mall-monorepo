<template>
  <div class="theme-code-editor">
    <div class="editor-header">
      <span class="editor-title">CSS 代码编辑器</span>
      <el-button size="small" @click="handleFormat"> 格式化 </el-button>
    </div>
    <div class="editor-wrapper">
      <Codemirror
        v-model="code"
        :extensions="extensions"
        :style="{ height: '100%' }"
        @update:model-value="handleCodeInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { css } from '@codemirror/lang-css';
import { oneDark } from '@codemirror/theme-one-dark';
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import { Codemirror } from 'vue-codemirror';
import type { ThemeStyleKey } from '@/interface/system';
import { useGlobalStore } from '@/store';
import type { ThemeVars } from '@/utils/theme';
import { extractVarsFromCSS, generateThemeCSS } from '@/utils/theme';

interface Props {
  editTheme: ThemeStyleKey;
  mergedVars: ThemeVars;
}

interface Emits {
  (e: 'update', vars: ThemeVars): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const globalStore = useGlobalStore();

const extensions = computed(() => {
  const exts = [
    css(),
    ...(globalStore.currentTheme === 'dark' ? [oneDark] : []),
  ];
  return exts;
});

const code = ref('');

// 是否正在从 props 写入 code（防止 CodeMirror 触发 update:modelValue 时产生循环）
let isApplyingFromProps = false;
// 标记本次 mergedVars 变化是由自身 emit 引起的，跳过覆盖
let pendingUserEdit = false;

watch(
  () => [props.mergedVars, props.editTheme],
  () => {
    if (pendingUserEdit) {
      pendingUserEdit = false;
      return;
    }
    isApplyingFromProps = true;
    code.value = generateThemeCSS(props.mergedVars, props.editTheme);
    nextTick(() => {
      isApplyingFromProps = false;
    });
  },
  { immediate: true, deep: true },
);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function handleCodeInput() {
  if (isApplyingFromProps) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const parsed = extractVarsFromCSS(code.value);
    if (Object.keys(parsed).length > 0) {
      pendingUserEdit = true;
      emit('update', parsed);
    }
  }, 500);
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});

function handleFormat() {
  const parsed = extractVarsFromCSS(code.value);
  if (Object.keys(parsed).length > 0) {
    isApplyingFromProps = true;
    code.value = generateThemeCSS(parsed, props.editTheme);
    nextTick(() => {
      isApplyingFromProps = false;
    });
  }
}
</script>

<style lang="scss" scoped>
.theme-code-editor {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.editor-title {
  color: var(--colorTextHeading);
  font-size: 14px;
  font-weight: 600;
}

.editor-wrapper {
  flex: 1;
  overflow: hidden;
  border: 1px solid var(--colorBorderSecondary);
  border-radius: 6px;

  :deep(.v-codemirror) {
    height: 100%;
  }

  :deep(.cm-editor) {
    height: 100%;
  }

  :deep(.cm-scroller) {
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
