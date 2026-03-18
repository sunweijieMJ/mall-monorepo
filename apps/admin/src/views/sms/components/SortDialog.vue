<!--
  设置排序弹窗（品牌推荐/专题推荐/新品推荐/人气推荐共用）
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="设置排序"
    width="420px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm"
  >
    <el-form label-width="100px">
      <el-form-item label="排序：">
        <el-input-number v-model="sortValue" style="width: 200px" :min="0" />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import AppDialog from '@/components/Dialog/AppDialog.vue';

const props = defineProps<{
  modelValue: boolean;
  initialSort?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  confirm: [sort: number];
}>();

const sortValue = ref(0);
const submitLoading = ref(false);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      sortValue.value = props.initialSort ?? 0;
    }
  },
);

const handleConfirm = () => {
  emit('confirm', sortValue.value);
};
</script>
