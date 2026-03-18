<!--
  选择商品弹窗（新品推荐/人气推荐共用）
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="选择商品"
    width="50%"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleConfirm"
    @closed="handleClosed"
  >
    <el-input
      v-model="searchKeyword"
      style="width: 250px; margin-bottom: 20px"
      placeholder="商品名称搜索"
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
      <el-table-column label="商品名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="货号" width="160" align="center">
        <template #default="{ row }">NO.{{ row.productSn }}</template>
      </el-table-column>
      <el-table-column label="价格" width="120" align="center">
        <template #default="{ row }">￥{{ row.price }}</template>
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
import type { ProductVo } from '@/api';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useProductStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  confirm: [products: ProductVo[]];
}>();

const productStore = useProductStore();

const searchKeyword = ref<string | null>(null);
const pageNum = ref(1);
const pageSize = ref(5);
const dialogList = ref<ProductVo[]>([]);
const dialogTotal = ref(0);
const multipleSelection = ref<ProductVo[]>([]);
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

const handleSelectionChange = (val: ProductVo[]) => {
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
    await productStore.getList({
      keyword: searchKeyword.value,
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    });
    dialogList.value = productStore.list;
    dialogTotal.value = productStore.total;
  } catch (error) {
    console.error('获取商品列表失败:', error);
    ElMessage.error('获取商品列表失败');
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
