<!--
  菜单详情组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-form ref="menuFormRef" :model="menu" :rules="rules" label-width="150px">
      <el-form-item label="菜单名称：" prop="title">
        <el-input v-model="menu.title" />
      </el-form-item>
      <el-form-item label="上级菜单：">
        <el-select v-model="menu.parentId" placeholder="请选择菜单">
          <el-option
            v-for="item in selectMenuList"
            :key="item.id"
            :label="item.title"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="前端名称：" prop="name">
        <el-input v-model="menu.name" />
      </el-form-item>
      <el-form-item label="前端图标：" prop="icon">
        <el-input v-model="menu.icon" style="width: 80%" />
        <span style="margin-left: 8px">{{ menu.icon }}</span>
      </el-form-item>
      <el-form-item label="是否显示：">
        <el-radio-group v-model="menu.hidden">
          <el-radio :label="0">是</el-radio>
          <el-radio :label="1">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="排序：">
        <el-input v-model.number="menu.sort" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button v-if="!isEdit" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type ElForm } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuService from '@/api/modules/menu';
import type { MenuItem } from '@/interface';

interface Props {
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const route = useRoute();
const router = useRouter();
const menuFormRef = ref<InstanceType<typeof ElForm>>();

const defaultMenu = {
  title: '',
  parentId: 0,
  name: '',
  icon: '',
  hidden: 0,
  sort: 0,
};

const menu = reactive<Partial<MenuItem>>({ ...defaultMenu });
const selectMenuList = ref<MenuItem[]>([]);

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
    const response = await MenuService.fetchList(0, {
      pageSize: 100,
      pageNum: 1,
    });
    selectMenuList.value = response.data.list;
    selectMenuList.value.unshift({ id: 0, title: '无上级菜单' } as MenuItem);
  } catch (error) {
    console.error('获取菜单列表失败:', error);
  }
};

// 提交表单
const onSubmit = async () => {
  if (!menuFormRef.value) return;

  try {
    const valid = await menuFormRef.value.validate();
    if (!valid) {
      ElMessage.error('验证失败');
      return;
    }

    await ElMessageBox.confirm('是否提交数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (props.isEdit) {
      const id = Number(route.query.id);
      await MenuService.updateMenu(id, menu as MenuItem);
      ElMessage.success('修改成功');
    } else {
      await MenuService.createMenu(menu as MenuItem);
      ElMessage.success('提交成功');
    }

    router.back();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

// 重置表单
const resetForm = () => {
  menuFormRef.value?.resetFields();
  Object.assign(menu, defaultMenu);
  getSelectMenuList();
};

onMounted(async () => {
  if (props.isEdit) {
    try {
      const id = Number(route.query.id);
      const response = await MenuService.getMenu(id);
      Object.assign(menu, response.data);
    } catch (error) {
      console.error('获取菜单详情失败:', error);
      ElMessage.error('获取菜单详情失败');
    }
  } else {
    Object.assign(menu, defaultMenu);
  }
  await getSelectMenuList();
});
</script>

<style scoped lang="scss">
.form-container {
  padding: 20px;
}
</style>
