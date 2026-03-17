<!--
  菜单列表页面 — 懒加载树形表格 + 搜索
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <FilterContainer @search="handleSearch" @reset="handleReset">
      <el-form :inline="true" :model="searchForm" label-width="140px">
        <el-form-item label="菜单名称：">
          <el-input
            v-model="searchForm.keyword"
            class="input-width"
            placeholder="菜单名称"
            clearable
          />
        </el-form-item>
      </el-form>
    </FilterContainer>

    <!-- 操作按钮 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAdd">添加</el-button>
    </OperateContainer>

    <!-- 搜索模式：全量树过滤 -->
    <el-table
      v-if="isSearchMode"
      v-loading="listLoading"
      :data="filteredTreeList"
      row-key="id"
      :tree-props="{ children: 'children' }"
      border
      default-expand-all
    >
      <el-table-column label="菜单名称" min-width="180">
        <template #default="{ row }">{{ row.title }}</template>
      </el-table-column>
      <el-table-column label="前端名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="前端图标" width="100" align="center">
        <template #default="{ row }">{{ row.icon }}</template>
      </el-table-column>
      <el-table-column label="是否显示" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.hidden"
            :active-value="0"
            :inactive-value="1"
            @change="handleHiddenChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 默认模式：懒加载 -->
    <el-table
      v-else
      ref="tableRef"
      v-loading="listLoading"
      :data="rootList"
      row-key="id"
      lazy
      :load="loadChildren"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      border
    >
      <el-table-column label="菜单名称" min-width="180">
        <template #default="{ row }">{{ row.title }}</template>
      </el-table-column>
      <el-table-column label="前端名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="前端图标" width="100" align="center">
        <template #default="{ row }">{{ row.icon }}</template>
      </el-table-column>
      <el-table-column label="是否显示" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.hidden"
            :active-value="0"
            :inactive-value="1"
            @change="handleHiddenChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="操作" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑弹窗 -->
    <MenuFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="currentMenu"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, onMounted } from 'vue';
import MenuFormDialog from './components/MenuFormDialog.vue';
import type { AdminMenuVo } from '@/api';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useDeleteConfirm } from '@/composables/useDeleteConfirm';
import { useMenuTree } from '@/composables/useMenuTree';
import { useMenuStore } from '@/store/modules/menu';

const menuStore = useMenuStore();

const {
  listLoading,
  isSearchMode,
  rootList,
  filteredTreeList,
  getRootList,
  loadChildren,
  handleSearch: searchMenuTree,
  handleReset: resetMenuTree,
} = useMenuTree();

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentMenu = ref<AdminMenuVo | null>(null);

const searchForm = ref({
  keyword: '',
});

const handleSearch = () => {
  searchMenuTree(searchForm.value.keyword);
};

const handleReset = () => {
  searchForm.value.keyword = '';
  resetMenuTree();
};

const handleAdd = () => {
  isEdit.value = false;
  currentMenu.value = null;
  dialogVisible.value = true;
};

const handleHiddenChange = async (row: AdminMenuVo) => {
  const originHidden = row.hidden === 0 ? 1 : 0;
  try {
    await menuStore.updateHidden(row.id, { hidden: row.hidden });
    ElMessage.success('修改成功');
  } catch (error) {
    row.hidden = originHidden;
    console.error('修改失败:', error);
    ElMessage.error('修改失败');
  }
};

const handleUpdate = (row: AdminMenuVo) => {
  isEdit.value = true;
  currentMenu.value = row;
  dialogVisible.value = true;
};

const handleDelete = async (row: AdminMenuVo) => {
  await useDeleteConfirm(
    '菜单',
    () => menuStore.deleteItem(row.id),
    async () => {
      if (isSearchMode.value) {
        await searchMenuTree(searchForm.value.keyword);
      } else {
        await getRootList();
      }
    },
  ).handleDelete(row.id);
};

const handleFormSuccess = () => {
  if (isSearchMode.value) {
    searchMenuTree(searchForm.value.keyword);
  } else {
    getRootList();
  }
};

onMounted(() => {
  getRootList();
});
</script>

<style scoped lang="scss">
.input-width {
  width: 203px;
}
</style>
