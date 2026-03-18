<!--
  商品列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="输入搜索：">
          <el-input
            v-model="listQuery.keyword"
            class="input-width"
            placeholder="商品名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="商品货号：">
          <el-input
            v-model="listQuery.productSn"
            class="input-width"
            placeholder="商品货号"
            clearable
          />
        </el-form-item>
        <el-form-item label="商品分类：">
          <el-cascader
            v-model="selectProductCateValue"
            :options="productCateOptions"
            class="input-width"
            clearable
          />
        </el-form-item>
        <el-form-item label="商品品牌：">
          <el-select
            v-model="listQuery.brandId"
            placeholder="请选择品牌"
            clearable
          >
            <el-option
              v-for="item in brandOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="上架状态：">
          <el-select
            v-model="listQuery.publishStatus"
            placeholder="全部"
            clearable
          >
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态：">
          <el-select
            v-model="listQuery.verifyStatus"
            placeholder="全部"
            clearable
          >
            <el-option label="审核通过" :value="1" />
            <el-option label="未审核" :value="0" />
          </el-select>
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 数据列表 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAddProduct">添加</el-button>
    </OperateContainer>

    <AppTable
      v-model:current-page="listQuery.pageNum"
      v-model:page-size="listQuery.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      :page-sizes="[5, 10, 15]"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <el-table-column type="selection" width="60" align="center" />
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="商品图片" width="120" align="center">
        <template #default="{ row }">
          <img style="height: 80px" :src="row.pic" />
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center">
        <template #default="{ row }">
          <p>{{ row.name }}</p>
          <p>品牌：{{ row.brandName }}</p>
        </template>
      </el-table-column>
      <el-table-column label="价格/货号" width="120" align="center">
        <template #default="{ row }">
          <p>价格：￥{{ row.price }}</p>
          <p>货号：{{ row.productSn }}</p>
        </template>
      </el-table-column>
      <el-table-column label="标签" width="140" align="center">
        <template #default="{ row }">
          <p>
            上架：<StatusSwitch
              v-model="row.publishStatus"
              @update:model-value="handlePublishStatusChange(row)"
            />
          </p>
          <p>
            新品：<StatusSwitch
              v-model="row.newStatus"
              @update:model-value="handleNewStatusChange(row)"
            />
          </p>
          <p>
            推荐：<StatusSwitch
              v-model="row.recommendStatus"
              @update:model-value="handleRecommendStatusChange(row)"
            />
          </p>
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="SKU库存" width="100" align="center">
        <template #default="{ row }">
          <el-button
            type="primary"
            :icon="Edit"
            circle
            @click="handleShowSkuEditDialog(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)"
          >
            编辑
          </el-button
          >
          <el-button link type="danger" @click="handleDelete(row.id!)"
          >
            删除
          </el-button
          >
        </template>
      </el-table-column>
    </AppTable>

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        v-model="operateType"
        placeholder="批量操作"
        style="width: 150px"
      >
        <el-option label="商品上架" value="publishOn" />
        <el-option label="商品下架" value="publishOff" />
        <el-option label="设为推荐" value="recommendOn" />
        <el-option label="取消推荐" value="recommendOff" />
        <el-option label="设为新品" value="newOn" />
        <el-option label="取消新品" value="newOff" />
        <el-option label="移入回收站" value="recycle" />
      </el-select>
      <el-button
        style="margin-left: 20px"
        type="primary"
        @click="handleBatchOperate"
      >
        确定
      </el-button>
    </div>

    <!-- SKU编辑对话框 -->
    <SkuEditDialog
      v-model="skuDialogVisible"
      :product-id="skuEditInfo.productId"
      :product-sn="skuEditInfo.productSn"
      :product-attribute-category-id="skuEditInfo.productAttributeCategoryId"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { Edit } from '@element-plus/icons-vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import SkuEditDialog from './components/SkuEditDialog.vue';
import type { ProductVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import StatusSwitch from '@/components/StatusSwitch.vue';
import { useBatchOperate } from '@/composables/useBatchOperate';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useStatusToggle } from '@/composables/useStatusToggle';
import { useProductStore, useBrandStore, useProductCateStore } from '@/store';

const router = useRouter();
const productStore = useProductStore();
const brandStore = useBrandStore();
const productCateStore = useProductCateStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  keyword: null as string | null,
  productSn: null as string | null,
  publishStatus: null as number | null,
  verifyStatus: null as number | null,
  productCategoryId: null as number | null,
  brandId: null as number | null,
};

const {
  listQuery,
  loading,
  list,
  total,
  getList,
  handleSearch,
  handleReset,
  handleSizeChange,
  handlePageChange,
} = useListPage(
  defaultListQuery,
  (q) => productStore.getList(q),
  computed(() => productStore.list),
  computed(() => productStore.total),
);

const selectProductCateValue = ref<number[]>([]);
const productCateOptions = ref<any[]>([]);
const brandOptions = ref<any[]>([]);

const {
  multipleSelection,
  operateType,
  handleSelectionChange,
  executeBatchOperate,
} = useBatchOperate<ProductVo>(getList);

const skuDialogVisible = ref(false);
const skuEditInfo = ref({
  productId: null as number | null,
  productSn: '',
  productAttributeCategoryId: null as number | null,
});

watch(selectProductCateValue, (val) => {
  listQuery.productCategoryId = val?.length === 2 ? val[1] : null;
});

const handleAddProduct = () => {
  router.push({ path: '/pms/addProduct' });
};

const handleUpdate = (row: ProductVo) => {
  router.push({ path: '/pms/updateProduct', query: { id: String(row.id) } });
};

const handlePublishStatusChange = useStatusToggle(
  productStore.updatePublishStatus,
  getList,
);
const handleNewStatusChange = useStatusToggle(
  productStore.updateNewStatus,
  getList,
);
const handleRecommendStatusChange = useStatusToggle(
  productStore.updateRecommendStatus,
  getList,
);

const { handleDelete } = useDeleteConfirm(
  '商品',
  (id: number) => productStore.batchDelete([id]),
  getList,
);

const handleShowSkuEditDialog = (row: ProductVo) => {
  skuEditInfo.value = {
    productId: row.id!,
    productSn: row.productSn || '',
    productAttributeCategoryId: row.productAttributeCategoryId || null,
  };
  skuDialogVisible.value = true;
};

const handleBatchOperate = () => {
  const ids = multipleSelection.value.map((item) => item.id!);
  return executeBatchOperate({
    publishOn: () => productStore.updatePublishStatus(ids, 1),
    publishOff: () => productStore.updatePublishStatus(ids, 0),
    recommendOn: () => productStore.updateRecommendStatus(ids, 1),
    recommendOff: () => productStore.updateRecommendStatus(ids, 0),
    newOn: () => productStore.updateNewStatus(ids, 1),
    newOff: () => productStore.updateNewStatus(ids, 0),
    recycle: () => productStore.batchDelete(ids),
  });
};

const getBrandList = async () => {
  try {
    await brandStore.getList({ pageNum: 1, pageSize: 100 });
    brandOptions.value = brandStore.list.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('获取品牌列表失败:', error);
  }
};

const getProductCateList = async () => {
  try {
    const data = await productCateStore.getListWithChildren();
    productCateOptions.value =
      (data as any[])?.map((item: any) => ({
        label: item.name,
        value: item.id,
        children:
          item.children?.map((child: any) => ({
            label: child.name,
            value: child.id,
          })) || [],
      })) || [];
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

onMounted(() => {
  getList();
  getBrandList();
  getProductCateList();
});
</script>

<style scoped lang="scss">
.input-width {
  width: 203px;
}

.batch-operate-container {
  margin-bottom: 20px;
}
</style>
