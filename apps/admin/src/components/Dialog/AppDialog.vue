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
