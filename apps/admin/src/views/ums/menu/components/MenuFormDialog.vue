<!--
  菜单新增/编辑弹窗
  将原 MenuDetail.vue 逻辑内联到此弹窗中
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? '编辑菜单' : '添加菜单'"
    width="520px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
    @closed="resetForm"
  >
    <el-form ref="menuFormRef" :model="menu" :rules="rules" label-width="100px">
      <el-form-item label="菜单名称：" prop="title">
        <el-input v-model="menu.title" class="form-input" />
      </el-form-item>
      <el-form-item label="上级菜单：">
        <el-select
          v-model="menu.parentId"
          placeholder="请选择菜单"
          class="form-input"
        >
          <el-option
            v-for="item in selectMenuList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="前端名称：" prop="name">
        <el-input v-model="menu.name" class="form-input" />
      </el-form-item>
      <el-form-item label="前端图标：" prop="icon">
        <el-input v-model="menu.icon" class="form-input" />
        <span style="margin-left: 8px">{{ menu.icon }}</span>
      </el-form-item>
      <el-form-item label="是否显示：">
        <el-radio-group v-model="menu.hidden">
          <el-radio :value="0">是</el-radio>
          <el-radio :value="1">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序：">
        <el-input v-model.number="menu.sort" class="form-input" />
      </el-form-item>
    </el-form>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance } from 'element-plus';
import { ref, reactive, watch } from 'vue';
import type { AdminMenuVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useMenuStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  editData?: AdminMenuVo | null;
  isEdit?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const menuStore = useMenuStore();
const menuFormRef = ref<FormInstance>();
const submitLoading = ref(false);

const defaultMenu = {
  title: '',
  parentId: 0,
  name: '',
  icon: '',
  hidden: 0 as const,
  sort: 0,
};

const menu = reactive<Partial<AdminMenuVo>>({ ...defaultMenu });
const selectMenuList = ref<AdminMenuVo[]>([]);

const rules = {
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
  name: [
    { required: true, message: '请输入前端名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
  icon: [
    { required: true, message: '请输入前端图标', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
};

// 获取上级菜单列表
const getSelectMenuList = async () => {
  try {
    await menuStore.getList({ parentId: 0, pageSize: 100, pageNum: 1 });
    selectMenuList.value = [
      { id: 0, title: '无上级菜单' } as AdminMenuVo,
      ...menuStore.list,
    ];
  } catch (error) {
    console.error('获取菜单列表失败:', error);
  }
};

// 弹窗打开时初始化数据
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (props.isEdit && props.editData) {
        Object.assign(menu, props.editData);
      } else {
        Object.assign(menu, defaultMenu);
      }
      getSelectMenuList();
    }
  },
);

const handleSubmit = async () => {
  const valid = await menuFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitLoading.value = true;
  try {
    if (props.isEdit && props.editData) {
      await menuStore.update(props.editData.id, menu);
      ElMessage.success('修改成功');
    } else {
      await menuStore.create(menu);
      ElMessage.success('添加成功');
    }
    emit('update:modelValue', false);
    emit('success');
  } catch (error: any) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  } finally {
    submitLoading.value = false;
  }
};

const resetForm = () => {
  menuFormRef.value?.clearValidate();
};
</script>

<style scoped lang="scss">
.form-input {
  width: 280px;
}
</style>
