<!--
  分配菜单弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="分配菜单"
    width="600px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSave"
    @closed="handleClosed"
  >
    <div v-loading="treeLoading" class="tree-container">
      <el-tree
        ref="treeRef"
        :data="menuTreeList"
        show-checkbox
        default-expand-all
        node-key="id"
        highlight-current
        :props="{ children: 'children', label: 'title' }"
      />
    </div>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type ElTree } from 'element-plus';
import { ref, watch } from 'vue';
import type { AdminMenuTreeNodeVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
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
const treeRef = ref<InstanceType<typeof ElTree>>();

const menuTreeList = ref<AdminMenuTreeNodeVo[]>([]);
const treeLoading = ref(false);
const submitLoading = ref(false);

const loadData = async () => {
  treeLoading.value = true;
  try {
    await menuStore.getTreeList();
    menuTreeList.value = menuStore.treeList as AdminMenuTreeNodeVo[];

    const menuList = await roleStore.getMenuList(props.roleId);
    const checkedMenuIds: number[] = [];
    if (menuList && (menuList as any).length > 0) {
      for (const menu of menuList as any) {
        // 只选中叶子节点，避免父节点被自动选中导致问题
        if (menu.parentId !== 0) {
          checkedMenuIds.push(menu.id);
        }
      }
    }
    treeRef.value?.setCheckedKeys(checkedMenuIds);
  } catch (error) {
    console.error('加载菜单数据失败:', error);
    ElMessage.error('加载菜单数据失败');
  } finally {
    treeLoading.value = false;
  }
};

const handleSave = async () => {
  submitLoading.value = true;
  try {
    const checkedNodes = treeRef.value?.getCheckedNodes() || [];
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

const handleClosed = () => {
  menuTreeList.value = [];
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) loadData();
  },
);
</script>

<style scoped lang="scss">
.tree-container {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
