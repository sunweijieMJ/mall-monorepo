<!--
  SKU 库存编辑对话框
-->
<template>
  <AppDialog
    :model-value="modelValue"
    title="编辑货品信息"
    width="60%"
    :confirm-loading="submitLoading"
    @update:model-value="emit('update:modelValue', $event)"
    @confirm="handleSubmit"
  >
    <div class="sku-header">
      <span>商品货号：{{ productSn }}</span>
      <el-input
        v-model="keyword"
        placeholder="按sku编号搜索"
        style="width: 300px; margin-left: 20px"
        @keyup.enter="handleSearch"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSearch" />
        </template>
      </el-input>
    </div>

    <el-table :data="stockList" style="width: 100%; margin-top: 20px" border>
      <el-table-column label="SKU编号" align="center">
        <template #default="{ row }">
          <el-input v-model="row.skuCode" />
        </template>
      </el-table-column>
      <el-table-column
        v-for="(item, index) in productAttr"
        :key="item.id"
        :label="item.name"
        align="center"
      >
        <template #default="{ row }">
          {{ getProductSkuSp(row, index) }}
        </template>
      </el-table-column>
      <el-table-column label="销售价格" width="100" align="center">
        <template #default="{ row }">
          <el-input v-model="row.price" />
        </template>
      </el-table-column>
      <el-table-column label="商品库存" width="100" align="center">
        <template #default="{ row }">
          <el-input v-model="row.stock" />
        </template>
      </el-table-column>
      <el-table-column label="库存预警值" width="120" align="center">
        <template #default="{ row }">
          <el-input v-model="row.lowStock" />
        </template>
      </el-table-column>
    </el-table>
  </AppDialog>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { ref, watch } from 'vue';
import AppDialog from '@/components/Dialog/AppDialog.vue';
import { useProductStore, useProductAttrStore } from '@/store';

const props = defineProps<{
  modelValue: boolean;
  productId: number | null;
  productSn: string;
  productAttributeCategoryId: number | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  success: [];
}>();

const productStore = useProductStore();
const productAttrStore = useProductAttrStore();

const submitLoading = ref(false);
const keyword = ref('');
const stockList = ref<any[]>([]);
const productAttr = ref<any[]>([]);

const getProductSkuSp = (row: any, index: number) => {
  if (!row.spData) return null;
  try {
    const spData = JSON.parse(row.spData);
    return spData?.[index]?.value || null;
  } catch (error) {
    console.warn('SKU spData 解析失败:', row.skuCode, error);
    return null;
  }
};

const loadData = async () => {
  if (!props.productId) return;

  try {
    const data = await productStore.getSkuList(props.productId, {
      keyword: keyword.value || undefined,
    });
    stockList.value = (data as any) || [];

    if (props.productAttributeCategoryId) {
      await productAttrStore.getAttrList(props.productAttributeCategoryId, {
        type: 0,
      });
      productAttr.value = productAttrStore.attrList;
    }
  } catch (error) {
    console.error('加载SKU失败:', error);
    ElMessage.error('加载SKU失败');
  }
};

const handleSearch = () => {
  loadData();
};

const handleSubmit = async () => {
  if (!stockList.value.length) {
    ElMessage.warning('暂无SKU信息');
    return;
  }
  if (!props.productId) return;

  // 数据校验
  for (const item of stockList.value) {
    if (
      item.price !== undefined &&
      (isNaN(Number(item.price)) || Number(item.price) < 0)
    ) {
      ElMessage.error('销售价格必须为有效的非负数');
      return;
    }
    if (
      item.stock !== undefined &&
      (isNaN(Number(item.stock)) || Number(item.stock) < 0)
    ) {
      ElMessage.error('商品库存必须为有效的非负整数');
      return;
    }
    if (
      item.lowStock !== undefined &&
      (isNaN(Number(item.lowStock)) || Number(item.lowStock) < 0)
    ) {
      ElMessage.error('库存预警值必须为有效的非负整数');
      return;
    }
  }

  submitLoading.value = true;
  try {
    await productStore.updateSku(props.productId, stockList.value);
    ElMessage.success('修改成功');
    emit('update:modelValue', false);
    emit('success');
  } catch (error) {
    console.error('修改失败:', error);
    ElMessage.error('修改失败');
  } finally {
    submitLoading.value = false;
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      keyword.value = '';
      loadData();
    }
  },
);
</script>

<style scoped lang="scss">
.sku-header {
  display: flex;
  align-items: center;
}
</style>
