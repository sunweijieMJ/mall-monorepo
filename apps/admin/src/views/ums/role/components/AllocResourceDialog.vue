<!--
  分配资源弹窗 — el-tree 树形结构（分类为父节点，资源为子节点）
-->
<template>
  <TreeSelectDialog
    :model-value="modelValue"
    title="分配资源"
    node-key="treeKey"
    :load-tree-data="loadTreeData"
    :load-checked-keys="loadCheckedKeys"
    :on-save="handleSave"
    :filter-checked-nodes="(node) => !node.isCategory"
    @update:model-value="emit('update:modelValue', $event)"
    @success="emit('success')"
  />
</template>

<script setup lang="ts">
import type { AdminResourceVo, AdminResourceCategoryVo } from '@/api';
import TreeSelectDialog from '@/components/Dialog/TreeSelectDialog.vue';
import { useResourceStore } from '@/store/modules/resource';
import { useRoleStore } from '@/store/modules/role';

interface TreeNode {
  treeKey: string;
  name: string;
  id: number;
  isCategory?: boolean;
  children?: TreeNode[];
}

const props = defineProps<{
  modelValue: boolean;
  roleId: number;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const resourceStore = useResourceStore();
const roleStore = useRoleStore();

const loadTreeData = async () => {
  const [categories, resources] = await Promise.all([
    resourceStore.getAllCategories(),
    resourceStore.getAllList(),
  ]);

  // 构建树：分类为父节点，资源为子节点
  return categories.map((cate: AdminResourceCategoryVo) => ({
    treeKey: `cate-${cate.id}`,
    name: cate.name,
    id: cate.id,
    isCategory: true,
    children: resources
      .filter((r: AdminResourceVo) => r.categoryId === cate.id)
      .map((r: AdminResourceVo) => ({
        treeKey: `res-${r.id}`,
        name: r.name,
        id: r.id,
      })),
  }));
};

const loadCheckedKeys = async () => {
  const [resources, allocResources] = await Promise.all([
    resourceStore.getAllList(),
    roleStore.getResourceList(props.roleId),
  ]);

  const allocIds = new Set(allocResources.map((r: AdminResourceVo) => r.id));

  // 回显已选中的资源（只勾选叶子节点）
  return resources
    .filter((r: AdminResourceVo) => allocIds.has(r.id))
    .map((r: AdminResourceVo) => `res-${r.id}`);
};

const handleSave = async (checkedNodes: TreeNode[]) => {
  const resourceIds = checkedNodes.map((node) => node.id);
  await roleStore.assignResources(props.roleId, { resourceIds });
};
</script>
