<!--
  资源分类新增/编辑弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? '编辑分类' : '添加分类'"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item label="名称：">
        <el-input v-model="form.name" class="form-input" />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch } from 'vue';
import type { AdminResourceCategoryVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useResourceStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  isEdit?: boolean;
  editData?: Partial<AdminResourceCategoryVo> | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const resourceStore = useResourceStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const defaultForm = {
  name: '',
};

const form = reactive<Partial<AdminResourceCategoryVo>>({ ...defaultForm });

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.isEdit && props.editData) {
        Object.assign(form, props.editData);
      } else {
        Object.assign(form, defaultForm);
      }
    }
  },
);

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    if (props.isEdit) {
      await resourceStore.updateCategory(form.id!, form);
      ElMessage.success('修改成功');
    } else {
      await resourceStore.createCategory(form);
      ElMessage.success('添加成功');
    }
    emit('update:modelValue', false);
    emit('success');
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  formRef.value?.clearValidate();
};
</script>

<style scoped lang="scss">
.form-input {
  width: 280px;
}
</style>
