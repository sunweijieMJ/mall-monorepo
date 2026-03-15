<!--
  角色新增/编辑弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? '编辑角色' : '添加角色'"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item label="角色名称：">
        <el-input v-model="form.name" class="form-input" />
      </el-form-item>
      <el-form-item label="描述：">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="5"
          class="form-input"
        />
      </el-form-item>
      <el-form-item label="是否启用：">
        <el-radio-group v-model="form.status">
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
import type { AdminRoleVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useRoleStore } from '@/store/modules/role';

const props = defineProps<{
  modelValue: boolean;
  isEdit?: boolean;
  editData?: Partial<AdminRoleVo> | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const roleStore = useRoleStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const defaultForm: Partial<AdminRoleVo> = {
  id: undefined,
  name: '',
  description: '',
  adminCount: 0,
  status: 1 as any,
};

const form = reactive<Partial<AdminRoleVo>>({ ...defaultForm });

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
      await roleStore.update(form.id!, form as any);
      ElMessage.success('修改成功');
    } else {
      await roleStore.create(form as any);
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
