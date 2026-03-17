<!--
  通用树形选择对话框
-->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSave"
    @closed="handleClosed"
  >
    <div v-loading="dataLoading" class="tree-container">
      <el-tree
        ref="treeRef"
        :data="treeData"
        show-checkbox
        default-expand-all
        :node-key="nodeKey"
        :props="treeProps"
      />
    </div>
  </AppDialog>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { ElMessage, type ElTree } from 'element-plus';
import { nextTick, ref, watch } from 'vue';
import AppDialog from './AppDialog.vue';

interface Props {
  modelValue: boolean;
  title: string;
  width?: string;
  nodeKey: string;
  treeProps?: { children: string; label: string };
  loadTreeData: () => Promise<T[]>;
  loadCheckedKeys: () => Promise<string[] | number[]>;
  onSave: (checkedNodes: T[]) => Promise<void>;
  filterCheckedNodes?: (node: T) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  width: '600px',
  treeProps: () => ({ children: 'children', label: 'name' }),
});

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const treeRef = ref<InstanceType<typeof ElTree>>();
const treeData = ref<T[]>([]);
const dataLoading = ref(false);
const submitLoading = ref(false);

const loadData = async () => {
  dataLoading.value = true;
  try {
    treeData.value = await props.loadTreeData();
    const checkedKeys = await props.loadCheckedKeys();
    await nextTick();
    treeRef.value?.setCheckedKeys(checkedKeys as any);
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    dataLoading.value = false;
  }
};

const handleSave = async () => {
  submitLoading.value = true;
  try {
    const checkedNodes = (treeRef.value?.getCheckedNodes() || []) as T[];
    const filteredNodes = props.filterCheckedNodes
      ? checkedNodes.filter(props.filterCheckedNodes)
      : checkedNodes;

    await props.onSave(filteredNodes);
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
  treeData.value = [];
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
