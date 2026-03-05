<!--
  菜单列表页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAddMenu">添加</el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="menuTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
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
              type="text"
              :disabled="row.level !== 0"
              @click="handleShowNextLevel($index, row)"
            >
              查看下级
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row, $index }">
            <el-button type="text" @click="handleUpdate($index, row)">
              编辑
            </el-button>
            <el-button type="text" @click="handleDelete($index, row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.pageNum"
        v-model:page-size="listQuery.pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 15, 20]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import MenuService from '@/api/modules/menu';
import type { MenuItem } from '@/interface';

const route = useRoute();
const router = useRouter();
const menuTableRef = ref<InstanceType<typeof ElTable>>();

const list = ref<MenuItem[]>([]);
const total = ref(0);
const listLoading = ref(false);
const parentId = ref(0);

const listQuery = reactive({
  pageNum: 1,
  pageSize: 5,
});

// 格式化菜单级数
const formatLevel = (level?: number) => {
  if (level === 0) return '一级';
  if (level === 1) return '二级';
  return level;
};

// 重置父菜单ID
const resetParentId = () => {
  listQuery.pageNum = 1;
  if (route.query.parentId != null) {
    parentId.value = Number(route.query.parentId);
  } else {
    parentId.value = 0;
  }
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await MenuService.fetchList(parentId.value, listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 添加菜单
const handleAddMenu = () => {
  router.push({ path: '/ums/addMenu' });
};

// 分页
const handleSizeChange = (val: number) => {
  listQuery.pageNum = 1;
  listQuery.pageSize = val;
  getList();
};

const handleCurrentChange = (val: number) => {
  listQuery.pageNum = val;
  getList();
};

// 切换隐藏状态
const handleHiddenChange = async (_index: number, row: MenuItem) => {
  try {
    await MenuService.updateHidden(row.id, { hidden: row.hidden });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改失败:', error);
    ElMessage.error('修改失败');
    // 恢复原状态
    await getList();
  }
};

// 查看下级
const handleShowNextLevel = (_index: number, row: MenuItem) => {
  router.push({ path: '/ums/menu', query: { parentId: String(row.id) } });
};

// 编辑
const handleUpdate = (_index: number, row: MenuItem) => {
  router.push({ path: '/ums/updateMenu', query: { id: String(row.id) } });
};

// 删除
const handleDelete = async (_index: number, row: MenuItem) => {
  try {
    await ElMessageBox.confirm('是否要删除该菜单?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await MenuService.deleteMenu(row.id);
    ElMessage.success('删除成功');
    await getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 监听路由变化
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

<style scoped lang="scss">
.operate-container {
  margin-bottom: 10px;

  .btn-add {
    float: right;
  }

  .el-icon {
    margin-right: 5px;
    vertical-align: middle;
  }
}

.table-container {
  margin-bottom: 10px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
