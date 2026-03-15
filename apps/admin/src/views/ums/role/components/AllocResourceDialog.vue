<!--
  分配资源弹窗 — el-tree 树形结构（分类为父节点，资源为子节点）
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="分配资源"
    width="600px"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSave"
    @closed="handleClosed"
  >
    <div v-loading="dataLoading" class="tree-container">
      <el-tree
        ref="treeRef"
        :data="resourceTree"
        show-checkbox
        default-expand-all
        node-key="treeKey"
        :props="{ children: 'children', label: 'name' }"
      />
    </div>
  </AppDialog>
</template>

<script setup lang="ts">
import { ElMessage, type ElTree } from 'element-plus';
import { nextTick, ref, watch } from 'vue';
import type { AdminResourceVo, AdminResourceCategoryVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
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
const treeRef = ref<InstanceType<typeof ElTree>>();

const resourceTree = ref<TreeNode[]>([]);
const dataLoading = ref(false);
const submitLoading = ref(false);

const loadData = async () => {
  dataLoading.value = true;
  try {
    const [cateData, resourceData, allocResource] = await Promise.all([
      resourceStore.getAllCategories(),
      resourceStore.getAllList(),
      roleStore.getResourceList(props.roleId),
    ]);

    const categories = (cateData as any) || [];
    const resources = (resourceData as any) || [];
    const allocIds = new Set(
      ((allocResource as any) || []).map((r: any) => r.id),
    );

    // 构建树：分类为父节点，资源为子节点
    resourceTree.value = categories.map((cate: AdminResourceCategoryVo) => ({
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

    // 回显已选中的资源（只勾选叶子节点）
    const checkedKeys = resources
      .filter((r: AdminResourceVo) => allocIds.has(r.id))
      .map((r: AdminResourceVo) => `res-${r.id}`);

    // nextTick 后设置选中
    await nextTick();
    treeRef.value?.setCheckedKeys(checkedKeys);
  } catch (error) {
    console.error('加载资源数据失败:', error);
    ElMessage.error('加载资源数据失败');
  } finally {
    dataLoading.value = false;
  }
};

const handleSave = async () => {
  submitLoading.value = true;
  try {
    // 获取勾选的叶子节点（资源节点，排除分类节点）
    const checkedNodes = (treeRef.value?.getCheckedNodes() || []) as TreeNode[];
    const resourceIds = checkedNodes
      .filter((node) => !node.isCategory)
      .map((node) => node.id);

    await roleStore.assignResources(props.roleId, { resourceIds });

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
  resourceTree.value = [];
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
