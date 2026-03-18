<!--
  首页品牌推荐管理
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="品牌名称：">
          <el-input
            v-model="listQuery.brandName"
            class="input-width"
            placeholder="品牌名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="推荐状态：">
          <el-select
            v-model="listQuery.recommendStatus"
            placeholder="全部"
            clearable
            class="input-width"
          >
            <el-option label="未推荐" :value="0" />
            <el-option label="推荐中" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 数据列表 -->
    <OperateContainer>
      <el-button type="primary" @click="selectDialogVisible = true">
        选择品牌
      </el-button>
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
      <el-table-column label="编号" width="120" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="品牌名称" align="center">
        <template #default="{ row }">{{ row.brandName }}</template>
      </el-table-column>
      <el-table-column label="是否推荐" width="140" align="center">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.recommendStatus"
            @update:model-value="handleRecommendStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          {{ row.recommendStatus === 1 ? '推荐中' : '未推荐' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEditSort(row)">
            设置排序
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
        <el-option label="设为推荐" :value="0" />
        <el-option label="取消推荐" :value="1" />
        <el-option label="删除" :value="2" />
      </el-select>
      <el-button
        style="margin-left: 20px"
        type="primary"
        @click="handleBatchOperate"
      >
        确定
      </el-button>
    </div>

    <!-- 选择品牌弹窗 -->
    <SelectBrandDialog
      v-model="selectDialogVisible"
      @confirm="handleSelectConfirm"
    />

    <!-- 设置排序弹窗 -->
    <SortDialog
      v-model="sortDialogVisible"
      :initial-sort="currentSortItem.sort"
      @confirm="handleSortConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import SortDialog from '../components/SortDialog.vue';
import SelectBrandDialog from './components/SelectBrandDialog.vue';
import type { HomeBrandVo, BrandVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import StatusSwitch from '@/components/StatusSwitch.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useHomeBrandStore } from '@/store';

const homeBrandStore = useHomeBrandStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  brandName: null as string | null,
  recommendStatus: null as number | null,
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
  (q) => homeBrandStore.getList(q),
  computed(() => homeBrandStore.list),
  computed(() => homeBrandStore.total),
);

// 批量选择
const multipleSelection = ref<HomeBrandVo[]>([]);
const operateType = ref<number | null>(null);

const handleSelectionChange = (val: HomeBrandVo[]) => {
  multipleSelection.value = val;
};

// 推荐状态切换
const handleRecommendStatusChange = async (row: HomeBrandVo) => {
  // v-model 已先更新 row.recommendStatus，需计算旧值用于回滚
  const originalStatus = row.recommendStatus === 1 ? 0 : 1;
  try {
    await homeBrandStore.updateStatus({
      ids: [row.id!],
      recommendStatus: row.recommendStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改推荐状态失败:', error);
    row.recommendStatus = originalStatus;
    ElMessage.error('修改失败');
  }
};

// 删除
const { handleDelete } = useDeleteConfirm(
  '推荐',
  (id: number) => homeBrandStore.batchDelete([id]),
  getList,
);

// 批量操作
const handleBatchOperate = async () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }
  if (operateType.value === null) {
    ElMessage.warning('请选择批量操作类型');
    return;
  }

  const ids = multipleSelection.value.map((item) => item.id!);

  try {
    if (operateType.value === 2) {
      await ElMessageBox.confirm('是否要删除选中的推荐?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await homeBrandStore.batchDelete(ids);
    } else {
      await ElMessageBox.confirm('是否要修改推荐状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await homeBrandStore.updateStatus({
        ids,
        recommendStatus: operateType.value === 0 ? 1 : 0,
      });
    }
    ElMessage.success('操作成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

// 选择品牌弹窗
const selectDialogVisible = ref(false);

const handleSelectConfirm = async (brands: BrandVo[]) => {
  try {
    const selectBrands = brands.map((item) => ({
      brandId: item.id!,
      brandName: item.name,
    }));
    await homeBrandStore.batchCreate(selectBrands);
    selectDialogVisible.value = false;
    ElMessage.success('添加成功');
    await getList();
  } catch (error) {
    console.error('添加失败:', error);
    ElMessage.error('添加失败');
  }
};

// 排序弹窗
const sortDialogVisible = ref(false);
const currentSortItem = ref({ id: 0, sort: 0 });

const handleEditSort = (row: HomeBrandVo) => {
  currentSortItem.value = { id: row.id!, sort: row.sort || 0 };
  sortDialogVisible.value = true;
};

const handleSortConfirm = async (sort: number) => {
  try {
    await homeBrandStore.updateSort(currentSortItem.value.id, { sort });
    sortDialogVisible.value = false;
    ElMessage.success('修改成功');
    await getList();
  } catch (error) {
    console.error('修改排序失败:', error);
    ElMessage.error('修改失败');
  }
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
  margin: 16px 0;
}
</style>
