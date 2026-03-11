<!--
  菜单列表页面
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <OperateContainer>
      <el-button type="primary" @click="handleAdd">添加</el-button>
    </OperateContainer>

    <!-- 数据列表 -->
    <AppTable
      v-model:current-page="listQuery.pageNum"
      v-model:page-size="listQuery.pageSize"
      :data="list"
      :loading="listLoading"
      :total="total"
      :page-sizes="[5, 10, 15]"
      @size-change="handleSizeChange"
      @page-change="handleCurrentChange"
    >
      <el-table-column label="编号" width="100" align="center">
        <template #default="{ row }">{{ row.id }}</template>
      </el-table-column>
      <el-table-column label="菜单名称" align="center">
        <template #default="{ row }">{{ row.title }}</template>
      </el-table-column>
      <el-table-column label="菜单级数" width="100" align="center">
        <template #default="{ row }">{{ formatLevel(row.level) }}</template>
      </el-table-column>
      <el-table-column label="前端名称" align="center">
        <template #default="{ row }">{{ row.name }}</template>
      </el-table-column>
      <el-table-column label="前端图标" width="100" align="center">
        <template #default="{ row }">{{ row.icon }}</template>
      </el-table-column>
      <el-table-column label="是否显示" width="100" align="center">
        <template #default="{ row, $index }">
          <el-switch
            v-model="row.hidden"
            :active-value="0"
            :inactive-value="1"
            @change="handleHiddenChange($index, row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="排序" width="100" align="center">
        <template #default="{ row }">{{ row.sort }}</template>
      </el-table-column>
      <el-table-column label="设置" width="120" align="center">
        <template #default="{ row, $index }">
          <el-button
            link
            type="primary"
            :disabled="row.level !== 0"
            @click="handleShowNextLevel($index, row)"
          >
            查看下级
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center">
        <template #default="{ row, $index }">
          <el-button link type="primary" @click="handleUpdate($index, row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete($index, row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </AppTable>

    <!-- 新增/编辑弹窗 -->
    <MenuFormDialog
      v-model="dialogVisible"
      :is-edit="isEdit"
      :edit-data="currentMenu"
      @success="getList"
    />
  </div>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuFormDialog from './components/MenuFormDialog.vue';
import type { AdminMenuVo } from '@/api';
import AppTable from '@/components/List/AppTable.vue';
import OperateContainer from '@/components/List/OperateContainer.vue';
import { useMenuStore } from '@/store/modules/menu';

const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const list = ref<AdminMenuVo[]>([]);
const total = ref(0);
const listLoading = ref(false);
const parentId = ref(0);
const dialogVisible = ref(false);
const isEdit = ref(false);
const currentMenu = ref<AdminMenuVo | null>(null);

const listQuery = reactive({
  pageNum: 1,
  pageSize: 5,
});

const formatLevel = (level?: number) => {
  if (level === 0) return '一级';
  if (level === 1) return '二级';
  return level;
};

const resetParentId = () => {
  listQuery.pageNum = 1;
  if (route.query.parentId != null) {
    parentId.value = Number(route.query.parentId);
  } else {
    parentId.value = 0;
  }
};

const getList = async () => {
  listLoading.value = true;
  try {
    await menuStore.getList({ parentId: parentId.value, ...listQuery });
    list.value = menuStore.list;
    total.value = menuStore.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

const handleAdd = () => {
  isEdit.value = false;
  currentMenu.value = null;
  dialogVisible.value = true;
};

const handleSizeChange = (val: number) => {
  listQuery.pageNum = 1;
  listQuery.pageSize = val;
  getList();
};

const handleCurrentChange = (val: number) => {
  listQuery.pageNum = val;
  getList();
};

const handleHiddenChange = async (_index: number, row: AdminMenuVo) => {
  try {
    await menuStore.updateHidden(row.id, { hidden: row.hidden });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改失败:', error);
    ElMessage.error('修改失败');
    await getList();
  }
};

const handleShowNextLevel = (_index: number, row: AdminMenuVo) => {
  router.push({ path: '/ums/menu', query: { parentId: String(row.id) } });
};

const handleUpdate = (_index: number, row: AdminMenuVo) => {
  isEdit.value = true;
  currentMenu.value = row;
  dialogVisible.value = true;
};

const handleDelete = async (_index: number, row: AdminMenuVo) => {
  try {
    await ElMessageBox.confirm('是否要删除该菜单?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await menuStore.deleteItem(row.id);
    ElMessage.success('删除成功');
    await getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

watch(
  () => route.query,
  () => {
    resetParentId();
    getList();
  },
);

onMounted(() => {
  resetParentId();
  getList();
});
</script>
