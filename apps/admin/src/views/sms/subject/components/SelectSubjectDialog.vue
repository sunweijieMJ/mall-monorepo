<!--
  选择专题弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="选择专题"
    width="50%"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @closed="handleClosed"
  >
    <el-input
      v-model="searchKeyword"
      style="width: 250px; margin-bottom: 20px"
      placeholder="专题名称搜索"
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>
    <el-table
      :data="dialogList"
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="专题名称" align="center">
        <template #default="{ row }">{{ row.title }}</template>
      </el-table-column>
      <el-table-column label="所属分类" width="160" align="center">
        <template #default="{ row }">{{ row.categoryName }}</template>
      </el-table-column>
      <el-table-column label="添加时间" width="160" align="center">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </el-table-column>
    </el-table>
    <div class="dialog-pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        background
        layout="prev, pager, next"
        :total="dialogTotal"
        @current-change="getDialogList"
      />
    </div>
  </AppDialog>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';
import type { SubjectVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useSubjectStore } from '@/store';
import { formatDateTime } from '@/utils/format';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  confirm: [subjects: SubjectVo[]];
}>();

const subjectStore = useSubjectStore();

const searchKeyword = ref<string | null>(null);
const pageNum = ref(1);
const pageSize = ref(5);
const dialogList = ref<SubjectVo[]>([]);
const dialogTotal = ref(0);
const multipleSelection = ref<SubjectVo[]>([]);
const submitLoading = ref(false);

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      searchKeyword.value = null;
      pageNum.value = 1;
      getDialogList();
    }
  },
);

const handleSearch = () => {
  pageNum.value = 1;
  getDialogList();
};

const handleSelectionChange = (val: SubjectVo[]) => {
  multipleSelection.value = val;
};

const handleConfirm = () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }
  emit('confirm', multipleSelection.value);
};

const handleClosed = () => {
  multipleSelection.value = [];
};

const getDialogList = async () => {
  try {
    await subjectStore.getList({
      keyword: searchKeyword.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    dialogList.value = subjectStore.list;
    dialogTotal.value = subjectStore.total;
  } catch (error) {
    console.error('获取专题列表失败:', error);
    ElMessage.error('获取专题列表失败');
  }
};
</script>

<style scoped lang="scss">
.dialog-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
