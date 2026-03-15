<!--
  资源新增/编辑弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? '编辑资源' : '添加资源'"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item label="资源名称：">
        <el-input v-model="form.name" class="form-input" />
      </el-form-item>
      <el-form-item label="资源路径：">
        <el-input v-model="form.url" class="form-input" />
      </el-form-item>
      <el-form-item label="资源分类：">
        <el-select
          v-model="form.categoryId"
          placeholder="全部"
          clearable
          class="form-input"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="描述：">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="5"
          class="form-input"
        />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch } from 'vue';
import type { AdminResourceVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useResourceStore } from '@/store/modules/resource';

const props = defineProps<{
  modelValue: boolean;
  isEdit?: boolean;
  editData?: Partial<AdminResourceVo> | null;
  categoryOptions: Array<{ label: string; value: number }>;
  defaultCategoryId?: number | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const resourceStore = useResourceStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const defaultForm: Partial<AdminResourceVo> = {
  id: undefined,
  name: '',
  url: '',
  categoryId: undefined,
  description: '',
};

const form = reactive<Partial<AdminResourceVo>>({ ...defaultForm });

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.isEdit && props.editData) {
        Object.assign(form, props.editData);
      } else {
        Object.assign(form, defaultForm);
        form.categoryId = props.defaultCategoryId ?? undefined;
      }
    }
  },
);

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    if (props.isEdit) {
      await resourceStore.update(form.id!, form as any);
      ElMessage.success('修改成功');
    } else {
      await resourceStore.create(form as any);
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
