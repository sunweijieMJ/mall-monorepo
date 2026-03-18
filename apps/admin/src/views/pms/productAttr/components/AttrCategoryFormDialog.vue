<!--
  属性分类新增/编辑弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? '编辑属性分类' : '添加属性分类'"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="分类名称：" prop="name">
        <el-input v-model="form.name" class="form-input" />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch } from 'vue';
import type { ProductAttributeCategoryVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useProductAttrStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  isEdit?: boolean;
  editData?: Partial<ProductAttributeCategoryVo> | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const productAttrStore = useProductAttrStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const defaultForm: Partial<ProductAttributeCategoryVo> = {
  id: undefined,
  name: '',
};

const form = reactive<Partial<ProductAttributeCategoryVo>>({ ...defaultForm });

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
};

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
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    if (props.isEdit) {
      await productAttrStore.updateAttrCate(form.id!, form as any);
      ElMessage.success('修改成功');
    } else {
      await productAttrStore.createAttrCate(form as any);
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
  Object.assign(form, defaultForm);
  formRef.value?.clearValidate();
};
</script>

<style scoped lang="scss">
.form-input {
  width: 280px;
}
</style>
