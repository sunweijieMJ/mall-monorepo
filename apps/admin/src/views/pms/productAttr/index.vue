<!--
  商品属性分类列表页面
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
      @size-change="handleSizeChange"
      @page-change="handlePageChange"
    >
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="类型名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="属性数量" width="200" align="center">
        <template #default="{ row }">{{ row.attributeCount || 0 }}</template>
      </el-table-column>
      <el-table-column label="参数数量" width="200" align="center">
        <template #default="{ row }">{{ row.paramCount || 0 }}</template>
      </el-table-column>
      <el-table-column label="设置" width="200" align="center">
        <template #default="{ row }">
          <el-button size="small" @click="getAttrList(row)">属性列表</el-button>
          <el-button size="small" @click="getParamList(row)"
          >
            参数列表
          </el-button
          >
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

    <!-- 添加/编辑对话框 -->
    <AttrCategoryFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="editData"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AttrCategoryFormDialog from './components/AttrCategoryFormDialog.vue';
import type { ProductAttributeCategoryVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useListPage } from '@/composables/useListPage';
import { useProductAttrStore } from '@/store';

const router = useRouter();
const productAttrStore = useProductAttrStore();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
};

const {
  listQuery,
  loading,
  list,
  total,
  getList,
  handleSizeChange,
  handlePageChange,
} = useListPage(
  defaultListQuery,
  (q) => productAttrStore.getAttrCateList(q),
  computed(() => productAttrStore.cateList),
  computed(() => productAttrStore.cateTotal),
);

const dialogVisible = ref(false);
const isEdit = ref(false);
const editData = ref<Partial<ProductAttributeCategoryVo> | null>(null);

const handleAdd = () => {
  isEdit.value = false;
  editData.value = null;
  dialogVisible.value = true;
};

const handleUpdate = (row: ProductAttributeCategoryVo) => {
  isEdit.value = true;
  editData.value = row;
  dialogVisible.value = true;
};

const { handleDelete } = useDeleteConfirm(
  '属性分类',
  (id: number) => productAttrStore.deleteAttrCate(id),
  getList,
);

const getAttrList = (row: ProductAttributeCategoryVo) => {
  router.push({
    path: '/pms/productAttrList',
    query: { cid: String(row.id), type: '0' },
  });
};

const getParamList = (row: ProductAttributeCategoryVo) => {
  router.push({
    path: '/pms/productAttrList',
    query: { cid: String(row.id), type: '1' },
  });
};

onMounted(() => {
  getList();
});
</script>
