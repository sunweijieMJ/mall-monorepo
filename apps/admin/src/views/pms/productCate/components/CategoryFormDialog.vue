<!--
  商品分类新增/编辑弹窗
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
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="分类名称：" prop="name">
        <el-input v-model="form.name" class="form-input" />
      </el-form-item>
      <el-form-item label="数量单位：" prop="productUnit">
        <el-input v-model="form.productUnit" class="form-input" />
      </el-form-item>
      <el-form-item label="排序：" prop="sort">
        <el-input v-model.number="form.sort" class="form-input" type="number" />
      </el-form-item>
      <el-form-item label="是否显示：">
        <el-radio-group v-model="form.showStatus">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="显示在导航：">
        <el-radio-group v-model="form.navStatus">
          <el-radio :value="1">是</el-radio>
          <el-radio :value="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch } from 'vue';
import type { ProductCategoryVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useProductCateStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  isEdit?: boolean;
  editData?: Partial<ProductCategoryVo> | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const productCateStore = useProductCateStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const defaultForm: Partial<ProductCategoryVo> = {
  id: undefined,
  parentId: 0,
  level: 0,
  name: '',
  productUnit: '',
  sort: 0,
  showStatus: 1,
  navStatus: 1,
};

const form = reactive<Partial<ProductCategoryVo>>({ ...defaultForm });

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  productUnit: [{ required: true, message: '请输入数量单位', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
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
      await productCateStore.update(form.id!, form as any);
      ElMessage.success('修改成功');
    } else {
      await productCateStore.create(form as any);
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
