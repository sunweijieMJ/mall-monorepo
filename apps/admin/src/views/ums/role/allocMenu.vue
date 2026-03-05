<!--
  角色菜单分配页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-tree
      ref="treeRef"
      :data="menuTreeList"
      show-checkbox
      default-expand-all
      node-key="id"
      highlight-current
      :props="defaultProps"
    />
    <div style="margin-top: 20px" align="center">
      <el-button type="primary" @click="handleSave">保存</el-button>
      <el-button @click="handleClear">清空</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type ElTree } from 'element-plus';
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuService from '@/api/modules/menu';
import RoleService from '@/api/modules/role';
import type { MenuItem } from '@/interface';

const route = useRoute();
const router = useRouter();
const treeRef = ref<InstanceType<typeof ElTree>>();

const menuTreeList = ref<MenuItem[]>([]);
const roleId = ref<number>(0);

const defaultProps = {
  children: 'children',
  label: 'title',
};

// 获取菜单树列表
const getTreeList = async () => {
  try {
    const response = await MenuService.fetchTreeList();
    menuTreeList.value = response.data;
  } catch (error) {
    console.error('获取菜单树失败:', error);
    ElMessage.error('获取菜单树失败');
  }
};

// 获取角色已分配的菜单
const getRoleMenu = async (id: number) => {
  try {
    const response = await RoleService.listMenuByRole(id);
    const menuList = response.data;
    const checkedMenuIds: number[] = [];

    if (menuList && menuList.length > 0) {
      for (const menu of menuList) {
        // 只选中叶子节点，避免父节点被自动选中导致问题
        if (menu.parentId !== 0) {
          checkedMenuIds.push(menu.id);
        }
      }
    }

    treeRef.value?.setCheckedKeys(checkedMenuIds);
  } catch (error) {
    console.error('获取角色菜单失败:', error);
    ElMessage.error('获取角色菜单失败');
  }
};

// 保存菜单分配
const handleSave = async () => {
  try {
    const checkedNodes = treeRef.value?.getCheckedNodes() || [];
    const checkedMenuIds = new Set<number>();

    if (checkedNodes.length > 0) {
      for (const node of checkedNodes) {
        checkedMenuIds.add(node.id);
        // 如果是子节点，也要添加父节点ID
        if (node.parentId !== 0) {
          checkedMenuIds.add(node.parentId);
        }
      }
    }

    await ElMessageBox.confirm('是否分配菜单?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await RoleService.allocMenu({
      roleId: roleId.value,
      menuIds: Array.from(checkedMenuIds),
    });

    ElMessage.success('分配成功');
    router.back();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('分配失败:', error);
      ElMessage.error('分配失败');
    }
  }
};

// 清空选择
const handleClear = () => {
  treeRef.value?.setCheckedKeys([]);
};

onMounted(async () => {
  roleId.value = Number(route.query.roleId);
  await getTreeList();
  await getRoleMenu(roleId.value);
});
</script>

<style scoped lang="scss">
.form-container {
  padding: 20px;
}
</style>
