<!--
  重置密码弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="重置密码"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="新密码：" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          class="form-input"
        />
      </el-form-item>
      <el-form-item label="确认密码：" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          class="form-input"
        />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch } from 'vue';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useAdminUserStore } from '@/store/modules/adminUser';

const props = defineProps<{
  modelValue: boolean;
  adminId?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const adminUserStore = useAdminUserStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const form = reactive({
  newPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const formRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      pattern: passwordPattern,
      message: '密码至少 8 位，需包含大小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.newPassword = '';
      form.confirmPassword = '';
    }
  },
);

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    await adminUserStore.resetPassword(props.adminId!, {
      newPassword: form.newPassword,
    });
    ElMessage.success('重置密码成功');
    emit('update:modelValue', false);
    emit('success');
  } catch (error) {
    console.error('重置密码失败:', error);
    ElMessage.error('重置密码失败');
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
