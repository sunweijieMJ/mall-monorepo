<!--
  分配角色弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="分配角色"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
  >
    <el-form label-width="100px">
      <el-form-item label="角色：">
        <el-select
          v-model="selectedRoleIds"
          multiple
          placeholder="请选择角色"
          class="form-input"
        >
          <el-option
            v-for="item in allRoleList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';
import type { AdminRoleVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useAdminUserStore } from '@/store/modules/adminUser';
import { useRoleStore } from '@/store/modules/role';

const props = defineProps<{
  modelValue: boolean;
  adminId?: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const adminUserStore = useAdminUserStore();
const roleStore = useRoleStore();
const submitLoading = ref(false);
const selectedRoleIds = ref<number[]>([]);
const allRoleList = ref<AdminRoleVo[]>([]);

const loadData = async () => {
  if (!props.adminId) return;
  try {
    await roleStore.getAllList();
    allRoleList.value = roleStore.allRoles;

    const currentRoles = (await adminUserStore.getRoles(props.adminId)) as any;
    selectedRoleIds.value = currentRoles?.map((item: any) => item.id!) || [];
  } catch (error) {
    console.error('加载角色数据失败:', error);
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) loadData();
  },
);

const handleSubmit = async () => {
  submitLoading.value = true;
  try {
    await adminUserStore.assignRoles(props.adminId!, {
      roleIds: selectedRoleIds.value,
    });
    ElMessage.success('分配成功');
    emit('update:modelValue', false);
    emit('success');
  } catch (error) {
    console.error('分配失败:', error);
    ElMessage.error('分配失败');
  } finally {
    submitLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.form-input {
  width: 280px;
}
</style>
