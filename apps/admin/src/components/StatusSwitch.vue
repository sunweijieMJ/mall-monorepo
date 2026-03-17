<!--
  状态切换开关组件
-->
<template>
  <el-switch
    :model-value="modelValue"
    :active-value="1"
    :inactive-value="0"
    :before-change="handleBeforeChange"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { ElMessageBox } from 'element-plus';

defineProps<{
  modelValue: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: number];
}>();

const handleBeforeChange = async () => {
  await ElMessageBox.confirm('是否要修改该状态?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  });
  return true;
};
</script>
