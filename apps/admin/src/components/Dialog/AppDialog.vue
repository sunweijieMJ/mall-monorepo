<!--
  公共 Dialog 容器
  统一弹窗样式的唯一入口，修改此处可影响所有弹窗
-->
<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    @update:model-value="emit('update:modelValue', $event)"
    @closed="emit('closed')"
  >
    <slot />

    <template v-if="showFooter" #footer>
      <slot name="footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button
          type="primary"
          :loading="confirmLoading"
          @click="emit('confirm')"
        >
          确 定
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    width?: string;
    confirmLoading?: boolean;
    showFooter?: boolean;
  }>(),
  {
    width: '500px',
    confirmLoading: false,
    showFooter: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  confirm: [];
  cancel: [];
  closed: [];
}>();

const handleCancel = () => {
  emit('update:modelValue', false);
  emit('cancel');
};
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  border-radius: 12px;

  .el-dialog__header {
    margin-right: 0;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .el-dialog__title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: 24px;
  }

  .el-dialog__footer {
    padding: 12px 24px 20px;
    border-top: 1px solid var(--el-border-color-lighter);

    .el-button + .el-button {
      margin-left: 12px;
    }
  }
}
</style>
