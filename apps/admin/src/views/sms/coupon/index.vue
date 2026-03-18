<!--
  优惠券列表页面
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="listQuery" label-width="140px">
        <el-form-item label="优惠券名称：">
          <el-input
            v-model="listQuery.name"
            class="input-width"
            placeholder="优惠券名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="优惠券类型：">
          <el-select
            v-model="listQuery.type"
            placeholder="全部"
            clearable
            class="input-width"
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="优惠劵名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="优惠券类型" width="100" align="center">
        <template #default="{ row }">{{ formatType(row.type) }}</template>
      </el-table-column>
      <el-table-column label="可使用商品" width="100" align="center">
        <template #default="{ row }">{{ formatUseType(row.useType) }}</template>
      </el-table-column>
      <el-table-column label="使用门槛" width="140" align="center">
        <template #default="{ row }">满{{ row.minPoint }}元可用</template>
      </el-table-column>
      <el-table-column label="面值" width="100" align="center">
        <template #default="{ row }">{{ row.amount }}元</template>
      </el-table-column>
      <el-table-column label="适用平台" width="100" align="center">
        <template #default="{ row }">
          {{
            formatPlatform(row.platform)
          }}
        </template>
      </el-table-column>
      <el-table-column label="有效期" width="180" align="center">
        <template #default="{ row }">
          {{ formatDate(row.startTime) }}至{{ formatDate(row.endTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">{{ formatStatus(row.endTime) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">
            查看
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { CouponVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useCouponStore } from '@/store';

const router = useRouter();
const couponStore = useCouponStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  name: null as string | null,
  type: null as number | null,
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
  (q) => couponStore.getList(q),
  computed(() => couponStore.list),
  computed(() => couponStore.total),
);

const typeOptions = [
  { label: '全场赠券', value: 0 },
  { label: '会员赠券', value: 1 },
  { label: '购物赠券', value: 2 },
  { label: '注册赠券', value: 3 },
];

const formatType = (type?: number) => {
  return typeOptions.find((item) => item.value === type)?.label || '';
};

const formatUseType = (useType?: number) => {
  if (useType === 0) return '全场通用';
  if (useType === 1) return '指定分类';
  return '指定商品';
};

const formatPlatform = (platform?: number) => {
  if (platform === 1) return '移动平台';
  if (platform === 2) return 'PC平台';
  return '全平台';
};

const formatDate = (time?: string) => {
  if (!time) return 'N/A';
  return new Date(time).toLocaleDateString('zh-CN');
};

const formatStatus = (endTime?: string) => {
  if (!endTime) return '未知';
  return new Date(endTime).getTime() > Date.now() ? '未过期' : '已过期';
};

const handleAdd = () => {
  router.push({ path: '/mall/sms/coupon/add' });
};

const handleView = (row: CouponVo) => {
  router.push({
    path: '/mall/sms/coupon/history',
    query: { id: String(row.id) },
  });
};

const handleUpdate = (row: CouponVo) => {
  router.push({
    path: '/mall/sms/coupon/update',
    query: { id: String(row.id) },
  });
};

const { handleDelete } = useDeleteConfirm(
  '优惠券',
  (id: number) => couponStore.deleteItem(id),
  getList,
);

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.input-width {
  width: 203px;
}
</style>
