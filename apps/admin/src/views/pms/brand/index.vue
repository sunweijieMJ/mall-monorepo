<!--
  品牌列表页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <el-icon><Search /></el-icon>
        <span>筛选搜索</span>
        <el-button style="float: right" type="primary" @click="searchBrandList">
          查询结果
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" label-width="140px">
          <el-form-item label="输入搜索：">
            <el-input
              v-model="listQuery.keyword"
              style="width: 203px"
              placeholder="品牌名称/关键字"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="addBrand"> 添加 </el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="brandTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
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
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.factoryStatus"
              :active-value="1"
              :inactive-value="0"
              @change="handleFactoryStatusChange($index, row)"
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
        <el-table-column label="相关" width="220" align="center">
          <template #default="{ row, $index }">
            <span>商品：</span>
            <el-button type="primary" link @click="getProductList($index, row)">
              {{ row.productCount || 100 }}
            </el-button>
            <span>评价：</span>
            <el-button
              type="primary"
              link
              @click="getProductCommentList($index, row)"
            >
              {{ row.productCommentCount || 1000 }}
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

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        v-model="operateType"
        placeholder="批量操作"
        style="width: 200px"
      >
        <el-option
          v-for="item in operates"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        style="margin-left: 20px"
        type="primary"
        @click="handleBatchOperate"
      >
        确定
      </el-button>
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
import { Search, Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BrandService } from '@/api/modules';
import type { Brand } from '@/interface';

// Router
const router = useRouter();

// 表格引用
const brandTableRef = ref<InstanceType<typeof ElTable>>();

// 批量操作选项
const operates = [
  {
    label: '显示品牌',
    value: 'showBrand',
  },
  {
    label: '隐藏品牌',
    value: 'hideBrand',
  },
];

// 列表查询参数
const listQuery = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10,
});

// 状态
const list = ref<Brand[]>([]);
const total = ref(0);
const listLoading = ref(false);
const multipleSelection = ref<Brand[]>([]);
const operateType = ref<string>('');

// 获取品牌列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await BrandService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取品牌列表失败:', error);
    ElMessage.error('获取品牌列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 处理选择变化
const handleSelectionChange = (val: Brand[]) => {
  multipleSelection.value = val;
};

// 编辑品牌
const handleUpdate = (_index: number, row: Brand) => {
  router.push({
    path: '/mall/pms/brand/update',
    query: { id: String(row.id) },
  });
};

// 删除品牌
const handleDelete = async (_index: number, row: Brand) => {
  try {
    await ElMessageBox.confirm('是否要删除该品牌', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await BrandService.deleteBrand(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除品牌失败:', error);
    }
  }
};

// 查看商品列表（待实现）
const getProductList = (_index: number, row: Brand) => {
  console.log('查看品牌商品列表:', row);
  ElMessage.info('此功能待实现');
};

// 查看评价列表（待实现）
const getProductCommentList = (_index: number, row: Brand) => {
  console.log('查看品牌评价列表:', row);
  ElMessage.info('此功能待实现');
};

// 修改制造商状态
const handleFactoryStatusChange = async (_index: number, row: Brand) => {
  try {
    await BrandService.updateFactoryStatus({
      ids: [row.id!],
      factoryStatus: row.factoryStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改制造商状态失败:', error);
    // 恢复原状态
    row.factoryStatus = row.factoryStatus === 0 ? 1 : 0;
    ElMessage.error('修改失败');
  }
};

// 修改显示状态
const handleShowStatusChange = async (_index: number, row: Brand) => {
  try {
    await BrandService.updateShowStatus({
      ids: [row.id!],
      showStatus: row.showStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改显示状态失败:', error);
    // 恢复原状态
    row.showStatus = row.showStatus === 0 ? 1 : 0;
    ElMessage.error('修改失败');
  }
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

// 搜索品牌
const searchBrandList = () => {
  listQuery.pageNum = 1;
  getList();
};

// 批量操作
const handleBatchOperate = async () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }

  if (!operateType.value) {
    ElMessage.warning('请选择批量操作类型');
    return;
  }

  let showStatus = 0;
  if (operateType.value === 'showBrand') {
    showStatus = 1;
  } else if (operateType.value === 'hideBrand') {
    showStatus = 0;
  }

  const ids = multipleSelection.value.map((item) => item.id!);

  try {
    await BrandService.updateShowStatus({
      ids,
      showStatus,
    });
    await getList();
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('批量操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 添加品牌
const addBrand = () => {
  router.push({ path: '/mall/pms/brand/add' });
};

// 页面加载
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.filter-container {
  margin-bottom: 10px;

  .el-icon {
    margin-right: 5px;
    vertical-align: middle;
  }
}

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

.batch-operate-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>
