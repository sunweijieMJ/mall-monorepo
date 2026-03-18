<!--
  品牌列表页面
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
            placeholder="品牌名称"
            clearable
          />
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 数据列表 -->
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
      <el-table-column label="品牌名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="品牌首字母" width="100" align="center">
        <template #default="{ row }">{{ row.firstLetter }}</template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="品牌制造商" width="100" align="center">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.factoryStatus"
            @update:model-value="handleFactoryStatusChange(row)"
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
        <el-option label="显示品牌" value="showBrand" />
        <el-option label="隐藏品牌" value="hideBrand" />
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
    <BrandFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import BrandFormDialog from './components/BrandFormDialog.vue';
import type { BrandVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import StatusSwitch from '@/components/StatusSwitch.vue';
import { useBatchOperate } from '@/composables/useBatchOperate';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useStatusToggle } from '@/composables/useStatusToggle';
import { useBrandStore } from '@/store';

const brandStore = useBrandStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  keyword: null as string | null,
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
  (q) => brandStore.getList(q),
  computed(() => brandStore.list),
  computed(() => brandStore.total),
);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<BrandVo> | null>(null);

const {
  multipleSelection,
  operateType,
  handleSelectionChange,
  executeBatchOperate,
} = useBatchOperate<BrandVo>(getList);

const handleAdd = () => {
  isEdit.value = false;
  editData.value = null;
  dialogVisible.value = true;
};

const handleUpdate = (row: BrandVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const handleFactoryStatusChange = useStatusToggle(
  brandStore.updateFactoryStatus,
  getList,
);

const handleShowStatusChange = useStatusToggle(
  brandStore.updateShowStatus,
  getList,
);

const { handleDelete } = useDeleteConfirm(
  '品牌',
  (id: number) => brandStore.batchDelete([id]),
  getList,
);

const handleBatchOperate = () => {
  const ids = multipleSelection.value.map((item) => item.id!);
  return executeBatchOperate({
    showBrand: () => brandStore.updateShowStatus(ids, 1),
    hideBrand: () => brandStore.updateShowStatus(ids, 0),
  });
};

onMounted(() => {
  getList();
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
