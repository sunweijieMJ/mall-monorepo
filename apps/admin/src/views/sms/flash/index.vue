<!--
  秒杀活动列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="活动名称：">
          <el-input
            v-model="listQuery.keyword"
            class="input-width"
            placeholder="活动名称"
            clearable
          />
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 数据列表 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAdd">添加活动</el-button>
      <el-button @click="handleShowSessionList">秒杀时间段列表</el-button>
    </OperateContainer>

    <AppTable
      v-model:current-page="listQuery.pageNum"
      v-model:page-size="listQuery.pageSize"
      :data="list"
      :loading="loading"
      :total="total"
      :page-sizes="[5, 10, 15]"
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="活动标题" align="center">
        <template #default="{ row }">{{ row.title }}</template>
      </el-table-column>
      <el-table-column label="活动状态" width="140" align="center">
        <template #default="{ row }">{{ formatActiveStatus(row) }}</template>
      </el-table-column>
      <el-table-column label="开始时间" width="140" align="center">
        <template #default="{ row }">{{ formatDate(row.startDate) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" width="140" align="center">
        <template #default="{ row }">{{ formatDate(row.endDate) }}</template>
      </el-table-column>
      <el-table-column label="上线/下线" width="140" align="center">
        <template #default="{ row }">
          <StatusSwitch
            v-model="row.status"
            @update:model-value="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleSelectSession(row)">
            设置商品
          </el-button>
          <el-button link type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row.id!)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </AppTable>

    <!-- 添加/编辑对话框 -->
    <FlashPromotionFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FlashPromotionFormDialog from './components/FlashPromotionFormDialog.vue';
import type { FlashPromotionVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import StatusSwitch from '@/components/StatusSwitch.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useFlashPromotionStore } from '@/store';

const router = useRouter();
const flashPromotionStore = useFlashPromotionStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
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
  (q) => flashPromotionStore.getList(q),
  computed(() => flashPromotionStore.list),
  computed(() => flashPromotionStore.total),
);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<FlashPromotionVo> | null>(null);

const formatActiveStatus = (row: FlashPromotionVo) => {
  const nowDate = new Date().getTime();
  const startDate = new Date(row.startDate!).getTime();
  const endDate = new Date(row.endDate!).getTime();

  if (nowDate >= startDate && nowDate <= endDate) {
    return '活动进行中';
  } else if (nowDate > endDate) {
    return '活动已结束';
  }
  return '活动未开始';
};

const formatDate = (time?: string) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return date.toLocaleDateString('zh-CN');
};

const handleAdd = () => {
  isEdit.value = false;
  editData.value = null;
  dialogVisible.value = true;
};

const handleUpdate = (row: FlashPromotionVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const handleStatusChange = async (row: FlashPromotionVo) => {
  const originalStatus = row.status;
  try {
    await flashPromotionStore.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改状态失败:', error);
    row.status = originalStatus;
    ElMessage.error('修改失败');
  }
};

const { handleDelete } = useDeleteConfirm(
  '活动',
  (id: number) => flashPromotionStore.deleteItem(id),
  getList,
);

const handleShowSessionList = () => {
  router.push({ path: '/mall/sms/flash/sessionList' });
};

const handleSelectSession = (row: FlashPromotionVo) => {
  router.push({
    path: '/mall/sms/flash/selectSessionList',
    query: { flashPromotionId: String(row.id) },
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
</style>
