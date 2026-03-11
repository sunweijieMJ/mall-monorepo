<!--
  配置编辑器：支持可视化表单模式和 JSON 代码编辑模式
-->
<template>
  <div class="config-editor">
    <!-- 模式切换 -->
    <div class="editor-toolbar">
      <el-radio-group v-model="editMode" @change="handleModeChange">
        <el-radio-button value="visual">可视化</el-radio-button>
        <el-radio-button value="code">代码</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 可视化模式 -->
    <div v-if="editMode === 'visual'" class="editor-visual">
      <SchemaForm
        :schema="schema"
        :model-value="modelValue"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>

    <!-- 代码模式 -->
    <div v-else class="editor-code">
      <Codemirror
        v-model="jsonText"
        :extensions="codeExtensions"
        :style="{ height: 'calc(100vh - 280px)' }"
        @change="handleCodeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { json } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { ElMessage } from 'element-plus';
import { ref, computed, watch } from 'vue';
import { Codemirror } from 'vue-codemirror';
import SchemaForm from '@/components/SchemaForm/index.vue';
import type { SiteSchema } from '@/constants/siteConfig';
import { useGlobalStore } from '@/store';

const props = defineProps<{
  schema: SiteSchema;
  modelValue: Record<string, Record<string, unknown>>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, Record<string, unknown>>];
}>();

const globalStore = useGlobalStore();

// 当前编辑模式
const editMode = ref<'visual' | 'code'>('visual');

// code 模式草稿文本
const jsonText = ref('');

// 防止 value 变化时覆盖正在编辑的 jsonText
const skipSync = ref(false);

// 代码编辑器扩展
const codeExtensions = computed(() => {
  const exts = [json()];
  if (globalStore.currentTheme === 'dark') {
    exts.push(oneDark as never);
  }
  return exts;
});

// 当外部 modelValue 变化时同步 jsonText（code 模式下且非自身触发时）
watch(
  () => props.modelValue,
  (val) => {
    if (editMode.value === 'code' && !skipSync.value) {
      jsonText.value = JSON.stringify(val, null, 2);
    }
  },
  { deep: true },
);

/**
 * 切换编辑模式
 */
function handleModeChange(mode: string | number | boolean | undefined) {
  if (mode === 'code') {
    // 切换到代码模式：将当前配置序列化为 JSON
    jsonText.value = JSON.stringify(props.modelValue, null, 2);
  } else if (mode === 'visual') {
    // 切换到可视化模式：先校验 JSON
    try {
      const parsed = JSON.parse(jsonText.value);
      emit('update:modelValue', parsed);
    } catch {
      ElMessage.error('JSON 格式错误，无法切换到可视化模式，请检查代码');
      // 阻止切换，恢复到 code 模式
      editMode.value = 'code';
    }
  }
}

/**
 * 代码变化时实时解析并同步
 */
function handleCodeChange(val: string) {
  try {
    const parsed = JSON.parse(val);
    skipSync.value = true;
    emit('update:modelValue', parsed);
    // 下一个 tick 后恢复同步
    setTimeout(() => {
      skipSync.value = false;
    }, 50);
  } catch {
    // JSON 不合法时不更新，等待用户继续输入
  }
}
</script>

<style lang="scss" scoped>
.config-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 4px;
}

.editor-visual,
.editor-code {
  flex: 1;
}
</style>
