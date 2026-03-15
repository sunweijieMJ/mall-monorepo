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
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, onMounted } from 'vue';
import MenuFormDialog from './components/MenuFormDialog.vue';
import type { AdminMenuVo, AdminMenuTreeNodeVo } from '@/api';
import FilterContainer from '@/components/List/FilterContainer.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useMenuStore } from '@/store/modules/menu';

const menuStore = useMenuStore();

const listLoading = ref(false);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentMenu = ref<AdminMenuVo | null>(null);

// 懒加载模式数据
const rootList = ref<(AdminMenuVo & { hasChildren: boolean })[]>([]);

// 搜索模式数据
const isSearchMode = ref(false);
const fullTreeList = ref<AdminMenuTreeNodeVo[]>([]);
const filteredTreeList = ref<AdminMenuTreeNodeVo[]>([]);

const searchForm = ref({
  keyword: '',
});

// 获取顶层菜单列表（懒加载根节点）
const getRootList = async () => {
  listLoading.value = true;
  try {
    await menuStore.getList({ parentId: 0, pageSize: 100, pageNum: 1 });
    rootList.value = menuStore.list.map((item) => ({
      ...item,
      hasChildren: item.level === 0,
    }));
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 懒加载子菜单
const loadChildren = async (
  row: AdminMenuVo,
  _treeNode: any,
  resolve: (data: any[]) => void,
) => {
  try {
    await menuStore.getList({ parentId: row.id, pageSize: 100, pageNum: 1 });
    const children = menuStore.list.map((item) => ({
      ...item,
      hasChildren: item.level === 0, // 只有一级菜单才有子节点
    }));
    resolve(children);
  } catch (error) {
    console.error('加载子菜单失败:', error);
    resolve([]);
  }
};

// 搜索：加载全量树并过滤
const handleSearch = async () => {
  const keyword = searchForm.value.keyword?.trim();
  if (!keyword) {
    isSearchMode.value = false;
    await getRootList();
    return;
  }

  isSearchMode.value = true;
  listLoading.value = true;
  try {
    await menuStore.getTreeList();
    fullTreeList.value = menuStore.treeList as AdminMenuTreeNodeVo[];
    filteredTreeList.value = filterTree(fullTreeList.value, keyword);
  } catch (error) {
    console.error('搜索失败:', error);
    ElMessage.error('搜索失败');
  } finally {
    listLoading.value = false;
  }
};

// 树过滤：保留匹配节点及其父链
const filterTree = (
  tree: AdminMenuTreeNodeVo[],
  keyword: string,
): AdminMenuTreeNodeVo[] => {
  const result: AdminMenuTreeNodeVo[] = [];
  for (const node of tree) {
    const matchedChildren = node.children
      ? filterTree(node.children, keyword)
      : [];
    const selfMatch =
      node.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      node.name?.toLowerCase().includes(keyword.toLowerCase());

    if (selfMatch || matchedChildren.length > 0) {
      result.push({
        ...node,
        children: matchedChildren.length > 0 ? matchedChildren : node.children,
      });
    }
  }
  return result;
};

const handleReset = () => {
  searchForm.value.keyword = '';
  isSearchMode.value = false;
  getRootList();
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
    // 失败时回滚开关状态
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
  try {
    await ElMessageBox.confirm('是否要删除该菜单?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await menuStore.deleteItem(row.id);
    ElMessage.success('删除成功');
    // 删除后刷新
    if (isSearchMode.value) {
      await handleSearch();
    } else {
      await getRootList();
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleFormSuccess = () => {
  if (isSearchMode.value) {
    handleSearch();
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
