<template>
  <el-dialog
    :model-value="modelValue"
    title="关闭订单"
    width="500px"
    @close="handleClose"
  >
    <el-form :model="form" label-width="80px">
      <el-form-item label="备注">
        <el-input
          v-model="form.note"
          type="textarea"
          :rows="5"
          placeholder="请输入关闭原因"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleConfirm">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, reactive } from 'vue';
import { useOrderStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  orderIds: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const orderStore = useOrderStore();
const loading = ref(false);
const form = reactive({
  note: '',
});

const handleClose = () => {
  emit('update:modelValue', false);
  form.note = '';
};

const handleConfirm = async () => {
  if (!form.note.trim()) {
    ElMessage.warning('请输入关闭原因');
    return;
  }

  loading.value = true;
  try {
    await orderStore.close({
      ids: props.orderIds,
      note: form.note,
    });
    ElMessage.success('关闭成功');
    handleClose();
    emit('success');
  } catch {
    ElMessage.error('关闭失败');
  } finally {
    loading.value = false;
  }
};
</script>
