<template>
  <div class="theme-toolbar">
    <div class="toolbar-left">
      <el-radio-group v-model="editMode" size="small">
        <el-radio-button value="visual"> 可视化 </el-radio-button>
        <el-radio-button value="code"> 代码 </el-radio-button>
      </el-radio-group>

      <el-divider direction="vertical" />

      <el-radio-group v-model="editTheme" size="small">
        <el-radio-button value="light"> Light </el-radio-button>
        <el-radio-button value="dark"> Dark </el-radio-button>
      </el-radio-group>

      <el-tag
        v-if="modifiedCount > 0"
        type="warning"
        size="small"
        effect="plain"
      >
        {{ modifiedCount }} 项已修改
      </el-tag>
    </div>

    <div class="toolbar-right">
      <el-button size="small" @click="$emit('apply')"> 应用 </el-button>
      <el-button size="small" @click="$emit('export')"> 导出 CSS </el-button>
      <el-popconfirm
        title="确定重置所有自定义修改？"
        confirm-button-text="重置"
        cancel-button-text="取消"
        @confirm="$emit('reset')"
      >
        <template #reference>
          <el-button
            size="small"
            type="danger"
            plain
            :disabled="modifiedCount === 0"
          >
            重置
          </el-button>
        </template>
      </el-popconfirm>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeStyleKey } from '@/interface/system';

defineProps<{
  modifiedCount: number;
}>();

defineEmits<{
  (e: 'apply'): void;
  (e: 'export'): void;
  (e: 'reset'): void;
}>();

const editMode = defineModel<'visual' | 'code'>('editMode', {
  required: true,
});
const editTheme = defineModel<ThemeStyleKey>('editTheme', { required: true });
</script>

<style lang="scss" scoped>
.theme-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--colorBorderSecondary);
  border-radius: 8px 8px 0 0;
  background-color: var(--colorBgContainer);
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
