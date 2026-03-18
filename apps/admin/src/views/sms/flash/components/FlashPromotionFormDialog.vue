<!--
  秒杀活动新增/编辑弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? '编辑活动' : '添加活动'"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" label-width="100px">
      <el-form-item label="活动标题：">
        <el-input v-model="form.title" class="form-input" />
      </el-form-item>
      <el-form-item label="开始时间：">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="请选择时间"
          class="form-input"
        />
      </el-form-item>
      <el-form-item label="结束时间：">
        <el-date-picker
          v-model="form.endDate"
          type="date"
          placeholder="请选择时间"
          class="form-input"
        />
      </el-form-item>
      <el-form-item label="上线/下线：">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">上线</el-radio>
          <el-radio :value="0">下线</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch } from 'vue';
import type { FlashPromotionVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useFlashPromotionStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  isEdit?: boolean;
  editData?: Partial<FlashPromotionVo> | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const flashPromotionStore = useFlashPromotionStore();
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

const defaultForm: Partial<FlashPromotionVo> = {
  id: undefined,
  title: '',
  startDate: '',
  endDate: '',
  status: 0,
};

const form = reactive<Partial<FlashPromotionVo>>({ ...defaultForm });

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
      await flashPromotionStore.update(form.id!, form as any);
      ElMessage.success('修改成功');
    } else {
      await flashPromotionStore.create(form as any);
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
