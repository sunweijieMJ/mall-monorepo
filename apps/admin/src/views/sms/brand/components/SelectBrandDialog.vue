<!--
  选择品牌弹窗
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="选择品牌"
    width="40%"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @closed="handleClosed"
  >
    <el-input
      v-model="searchKeyword"
      style="width: 250px; margin-bottom: 20px"
      placeholder="品牌名称搜索"
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
      <el-table-column label="品牌名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="相关" width="220" align="center">
        <template #default="{ row }">
          商品：<span class="color-main">{{ row.productCount }}</span>
          评价：<span class="color-main">{{ row.productCommentCount }}</span>
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
import type { BrandVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useBrandStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  confirm: [brands: BrandVo[]];
}>();

const brandStore = useBrandStore();

const searchKeyword = ref<string | null>(null);
const pageNum = ref(1);
const pageSize = ref(5);
const dialogList = ref<BrandVo[]>([]);
const dialogTotal = ref(0);
const multipleSelection = ref<BrandVo[]>([]);
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

const handleSelectionChange = (val: BrandVo[]) => {
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
    await brandStore.getList({
      keyword: searchKeyword.value,
      showStatus: 1,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    dialogList.value = brandStore.list;
    dialogTotal.value = brandStore.total;
  } catch (error) {
    console.error('获取品牌列表失败:', error);
    ElMessage.error('获取品牌列表失败');
  }
};
</script>

<style scoped lang="scss">
.dialog-pagination {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.color-main {
  color: var(--colorPrimary);
}
</style>
