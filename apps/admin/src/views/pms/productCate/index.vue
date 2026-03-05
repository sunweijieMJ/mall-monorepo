<!--
  商品分类列表页面
  支持多级分类查看
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon style="margin-top: 5px"><Tickets /></el-icon>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" @click="handleAddProductCate">
        添加
      </el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="productCateTableRef"
        v-loading="listLoading"
        style="width: 100%"
        :data="list"
        border
      >
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="分类名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="级别" width="100" align="center">
          <template #default="{ row }">{{ levelFilter(row.level) }}</template>
        </el-table-column>
        <el-table-column label="商品数量" width="100" align="center">
          <template #default="{ row }">{{ row.productCount }}</template>
        </el-table-column>
        <el-table-column label="数量单位" width="100" align="center">
          <template #default="{ row }">{{ row.productUnit }}</template>
        </el-table-column>
        <el-table-column label="导航栏" width="100" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.navStatus"
              :active-value="1"
              :inactive-value="0"
              @change="handleNavStatusChange($index, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="是否显示" width="100" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.showStatus"
              :active-value="1"
              :inactive-value="0"
              @change="handleShowStatusChange($index, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </el-table-column>
        <el-table-column label="设置" width="200" align="center">
          <template #default="{ row, $index }">
            <el-button
              :disabled="disableNextLevel(row.level)"
              @click="handleShowNextLevel($index, row)"
            >
              查看下级
            </el-button>
            <el-button @click="handleTransferProduct($index, row)">
              转移商品
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center">
          <template #default="{ row, $index }">
            <el-button @click="handleUpdate($index, row)"> 编辑 </el-button>
            <el-button type="danger" @click="handleDelete($index, row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:page-size="listQuery.pageSize"
        v-model:current-page="listQuery.pageNum"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 15]"
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
import { useRouter, useRoute } from 'vue-router';
import { ProductCateService } from '@/api/modules';
import type { ProductCate } from '@/interface';

// Router
const router = useRouter();
const route = useRoute();

// 表格引用
const productCateTableRef = ref<InstanceType<typeof ElTable>>();

// 查询参数
const listQuery = reactive({
  pageNum: 1,
  pageSize: 5,
});

// 状态
const list = ref<ProductCate[]>([]);
const total = ref(0);
const listLoading = ref(false);
const parentId = ref(0);

// 级别过滤器
const levelFilter = (value: number) => {
  if (value === 0) {
    return '一级';
  } else if (value === 1) {
    return '二级';
  }
  return '未知';
};

// 是否禁用查看下级按钮
const disableNextLevel = (value: number) => {
  return value !== 0;
};

// 重置 parentId
const resetParentId = () => {
  listQuery.pageNum = 1;
  const queryParentId = route.query.parentId;
  if (queryParentId != null) {
    parentId.value = Number(queryParentId);
  } else {
    parentId.value = 0;
  }
};

// 获取分类列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await ProductCateService.fetchList(
      parentId.value,
      listQuery,
    );
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取分类列表失败:', error);
    ElMessage.error('获取分类列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 添加分类
const handleAddProductCate = () => {
  router.push({ path: '/mall/pms/productCate/add' });
};

// 每页数量变化
const handleSizeChange = (val: number) => {
  listQuery.pageNum = 1;
  listQuery.pageSize = val;
  getList();
};

// 当前页变化
const handleCurrentChange = (val: number) => {
  listQuery.pageNum = val;
  getList();
};

// 修改导航栏状态
const handleNavStatusChange = async (_index: number, row: ProductCate) => {
  try {
    await ProductCateService.updateNavStatus({
      ids: [row.id!],
      navStatus: row.navStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改导航栏状态失败:', error);
    ElMessage.error('修改失败');
    // 恢复原状态
    row.navStatus = row.navStatus === 0 ? 1 : 0;
  }
};

// 修改显示状态
const handleShowStatusChange = async (_index: number, row: ProductCate) => {
  try {
    await ProductCateService.updateShowStatus({
      ids: [row.id!],
      showStatus: row.showStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改显示状态失败:', error);
    ElMessage.error('修改失败');
    // 恢复原状态
    row.showStatus = row.showStatus === 0 ? 1 : 0;
  }
};

// 查看下级分类
const handleShowNextLevel = (_index: number, row: ProductCate) => {
  router.push({
    path: '/mall/pms/productCate',
    query: { parentId: String(row.id) },
  });
};

// 转移商品（待实现）
const handleTransferProduct = (_index: number, row: ProductCate) => {
  console.log('转移商品:', row);
  ElMessage.info('此功能待实现');
};

// 编辑分类
const handleUpdate = (_index: number, row: ProductCate) => {
  router.push({
    path: '/mall/pms/productCate/update',
    query: { id: String(row.id) },
  });
};

// 删除分类
const handleDelete = async (_index: number, row: ProductCate) => {
  try {
    await ElMessageBox.confirm('是否要删除该分类', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ProductCateService.deleteProductCate(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除分类失败:', error);
    }
  }
};

// 监听路由变化
watch(
  () => route.query.parentId,
  () => {
    resetParentId();
    getList();
  },
);

// 页面加载
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
}
</style>
