<!--
  商品分类列表页面
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAdd">添加</el-button>
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
      <el-table-column label="分类名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="级别" width="100" align="center">
        <template #default="{ row }">
          {{
            row.level === 0 ? '一级' : '二级'
          }}
        </template>
      </el-table-column>
      <el-table-column label="商品数量" width="100" align="center">
        <template #default="{ row }">{{ row.productCount }}</template>
      </el-table-column>
      <el-table-column label="数量单位" width="100" align="center">
        <template #default="{ row }">{{ row.productUnit }}</template>
      </el-table-column>
      <el-table-column label="导航栏" width="100" align="center">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.navStatus"
            @update:model-value="handleNavStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="是否显示" width="100" align="center">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.showStatus"
            @update:model-value="handleShowStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="设置" width="120" align="center">
        <template #default="{ row }">
          <el-button
            size="small"
            :disabled="row.level !== 0"
            @click="handleShowNextLevel(row)"
          >
            查看下级
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id!)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </AppTable>

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        v-model="operateType"
        placeholder="批量操作"
        style="width: 200px"
      >
        <el-option label="显示分类" value="showCategory" />
        <el-option label="隐藏分类" value="hideCategory" />
        <el-option label="显示在导航" value="showNav" />
        <el-option label="隐藏导航" value="hideNav" />
      </el-select>
      <el-button
        style="margin-left: 20px"
        type="primary"
        @click="handleBatchOperate"
      >
        确定
      </el-button>
    </div>

    <!-- 添加/编辑对话框 -->
    <CategoryFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryFormDialog from './components/CategoryFormDialog.vue';
import type { ProductCategoryVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import StatusSwitch from '@/components/StatusSwitch.vue';
import { useBatchOperate } from '@/composables/useBatchOperate';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useStatusToggle } from '@/composables/useStatusToggle';
import { useProductCateStore } from '@/store';

const route = useRoute();
const router = useRouter();
const productCateStore = useProductCateStore();

const parentId = ref(0);

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
};

const {
  listQuery,
  loading,
  list,
  total,
  getList: fetchList,
  handleSizeChange,
  handlePageChange,
} = useListPage(
  defaultListQuery,
  (q) => productCateStore.getList(parentId.value, q),
  computed(() => productCateStore.list),
  computed(() => productCateStore.total),
);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<ProductCategoryVo> | null>(null);

const {
  multipleSelection,
  operateType,
  handleSelectionChange,
  executeBatchOperate,
} = useBatchOperate<ProductCategoryVo>(getList);

const getList = () => {
  listQuery.pageNum = 1;
  fetchList();
};

const handleAdd = () => {
  isEdit.value = false;
  editData.value = {
    parentId: parentId.value,
    level: parentId.value === 0 ? 0 : 1,
  };
  dialogVisible.value = true;
};

const handleUpdate = (row: ProductCategoryVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const handleNavStatusChange = useStatusToggle(
  productCateStore.updateNavStatus,
  getList,
);

const handleShowStatusChange = useStatusToggle(
  productCateStore.updateShowStatus,
  getList,
);

const { handleDelete } = useDeleteConfirm(
  '分类',
  (id: number) => productCateStore.deleteItem(id),
  getList,
);

const handleShowNextLevel = (row: ProductCategoryVo) => {
  router.push({
    path: '/pms/productCate',
    query: { parentId: String(row.id) },
  });
};

const handleBatchOperate = () => {
  const ids = multipleSelection.value.map((item) => item.id!);
  return executeBatchOperate({
    showCategory: () => productCateStore.updateShowStatus(ids, 1),
    hideCategory: () => productCateStore.updateShowStatus(ids, 0),
    showNav: () => productCateStore.updateNavStatus(ids, 1),
    hideNav: () => productCateStore.updateNavStatus(ids, 0),
  });
};

watch(
  () => route.query.parentId,
  (val) => {
    parentId.value = val ? Number(val) : 0;
    getList();
  },
);

onMounted(() => {
  parentId.value = route.query.parentId ? Number(route.query.parentId) : 0;
  fetchList();
});
</script>

<style scoped lang="scss">
.batch-operate-container {
  margin-bottom: 20px;
}
</style>
