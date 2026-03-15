<!--
  用户新增/编辑弹窗（编辑模式含重置密码）
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? '编辑用户' : '添加用户'"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="帐号：" prop="username">
        <el-input v-model="form.username" class="form-input" />
      </el-form-item>
      <el-form-item label="姓名：">
        <el-input v-model="form.nickName" class="form-input" />
      </el-form-item>
      <el-form-item label="邮箱：" prop="email">
        <el-input v-model="form.email" class="form-input" />
      </el-form-item>
      <el-form-item v-if="!isEdit" label="密码：" prop="password">
        <el-input v-model="form.password" type="password" class="form-input" />
      </el-form-item>
      <el-form-item label="备注：">
        <el-input
          v-model="form.note"
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

      <!-- 编辑模式：重置密码 -->
      <template v-if="isEdit">
        <el-divider content-position="left">
          <el-button link type="primary" @click="showResetPwd = !showResetPwd">
            {{ showResetPwd ? '收起' : '重置密码' }}
          </el-button>
        </el-divider>
        <template v-if="showResetPwd">
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
        </template>
      </template>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch, computed } from 'vue';
import type { AdminUserVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useAdminUserStore } from '@/store/modules/adminUser';

const props = defineProps<{
  modelValue: boolean;
  isEdit?: boolean;
  editData?: Partial<AdminUserVo> | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const adminUserStore = useAdminUserStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const showResetPwd = ref(false);

const defaultForm = {
  id: undefined as number | undefined,
  username: '',
  password: '',
  nickName: '',
  email: '',
  note: '',
  status: 1 as any,
  newPassword: '',
  confirmPassword: '',
};

const form = reactive<
  Partial<AdminUserVo> & {
    password?: string;
    newPassword?: string;
    confirmPassword?: string;
  }
>({
  ...defaultForm,
});

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const formRules = computed(() => ({
  username: [{ required: true, message: '请输入帐号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }],
  password: props.isEdit
    ? []
    : [{ required: true, message: '请输入密码', trigger: 'blur' }],
  newPassword: [
    {
      pattern: passwordPattern,
      message: '密码至少 8 位，需包含大小写字母和数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: 'blur' }],
}));

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      showResetPwd.value = false;
      if (props.isEdit && props.editData) {
        Object.assign(form, {
          ...defaultForm,
          ...props.editData,
          newPassword: '',
          confirmPassword: '',
        });
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
      await adminUserStore.update(form.id!, form as any);
      ElMessage.success('修改成功');

      // 如果填了新密码，同时重置密码
      if (showResetPwd.value && form.newPassword) {
        await adminUserStore.resetPassword(form.id!, {
          newPassword: form.newPassword,
        });
        ElMessage.success('密码已重置');
      }
    } else {
      await adminUserStore.register(form as any);
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
