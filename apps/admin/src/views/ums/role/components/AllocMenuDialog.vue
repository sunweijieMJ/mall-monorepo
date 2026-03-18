<!--
  分配菜单弹窗
-->
<template>
  <TreeSelectDialog
    :model-value="modelValue"
    title="分配菜单"
    node-key="id"
    :tree-props="{ children: 'children', label: 'title' }"
    :load-tree-data="loadTreeData"
    :load-checked-keys="loadCheckedKeys"
    :on-save="handleSave"
    @update:model-value="emit('update:modelValue', $event)"
    @success="emit('success')"
  />
</template>

<script setup lang="ts">
import type { AdminMenuTreeNodeVo } from '@/api';
import TreeSelectDialog from '@/components/Dialog/TreeSelectDialog.vue';
import { useMenuStore, useRoleStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  roleId: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const menuStore = useMenuStore();
const roleStore = useRoleStore();

const loadTreeData = async () => {
  await menuStore.getTreeList();
  return menuStore.treeList as AdminMenuTreeNodeVo[];
};

const loadCheckedKeys = async () => {
  const menuList = (await roleStore.getMenuList(props.roleId)) as any;
  const checkedMenuIds: number[] = [];
  if (menuList?.length > 0) {
    // 只选中叶子节点，el-tree 会自动处理父节点半选状态
    const allMenuIds = new Set(menuList.map((m: any) => m.id));
    for (const menu of menuList) {
      const hasChildren = menuList.some((m: any) => m.parentId === menu.id);
      if (!hasChildren) {
        checkedMenuIds.push(menu.id);
      }
    }
  }
  return checkedMenuIds;
};

const handleSave = async (checkedNodes: AdminMenuTreeNodeVo[]) => {
  const checkedMenuIds = new Set<number>();
  for (const node of checkedNodes) {
    checkedMenuIds.add(node.id);
    if (node.parentId !== 0) {
      checkedMenuIds.add(node.parentId);
    }
  }
  await roleStore.assignMenus(props.roleId, {
    menuIds: Array.from(checkedMenuIds),
  });
};
</script>
