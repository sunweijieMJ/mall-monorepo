<!--
  首页品牌推荐管理
-->
<template>
  <div class="app-container">
    <!-- 筛选搜索 -->
    <el-card class="filter-container" shadow="never">
      <div>
        <el-icon><Search /></el-icon>
        <span>筛选搜索</span>
        <el-button
          style="float: right"
          type="primary"
          @click="handleSearchList"
        >
          查询搜索
        </el-button>
        <el-button
          style="margin-right: 15px; float: right"
          @click="handleResetSearch"
        >
          重置
        </el-button>
      </div>
      <div style="margin-top: 15px">
        <el-form :inline="true" :model="listQuery" label-width="140px">
          <el-form-item label="品牌名称：">
            <el-input
              v-model="listQuery.brandName"
              class="input-width"
              placeholder="品牌名称"
            />
          </el-form-item>
          <el-form-item label="推荐状态：">
            <el-select
              v-model="listQuery.recommendStatus"
              placeholder="全部"
              clearable
              class="input-width"
            >
              <el-option
                v-for="item in recommendOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleSelectBrand">
        选择品牌
      </el-button>
    </el-card>

    <div class="table-container">
      <el-table
        ref="homeBrandTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="编号" width="120" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="品牌名称" align="center">
          <template #default="{ row }">{{ row.brandName }}</template>
        </el-table-column>
        <el-table-column label="是否推荐" width="200" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.recommendStatus"
              :active-value="1"
              :inactive-value="0"
              @change="handleRecommendStatusChange($index, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="排序" width="160" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </el-table-column>
        <el-table-column label="状态" width="160" align="center">
          <template #default="{ row }">{{
            formatRecommendStatus(row.recommendStatus)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row, $index }">
            <el-button @click="handleEditSort($index, row)">
              设置排序
            </el-button>
            <el-button @click="handleDelete($index, row)"> 删除 </el-button>
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
        v-model:current-page="listQuery.pageNum"
        v-model:page-size="listQuery.pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5, 10, 15]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 选择品牌对话框 -->
    <el-dialog v-model="selectDialogVisible" title="选择品牌" width="40%">
      <el-input
        v-model="dialogData.listQuery.keyword"
        style="width: 250px; margin-bottom: 20px"
        placeholder="品牌名称搜索"
      >
        <template #append>
          <el-button :icon="Search" @click="handleSelectSearch" />
        </template>
      </el-input>
      <el-table
        :data="dialogData.list"
        border
        @selection-change="handleDialogSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column label="品牌名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="相关" width="220" align="center">
          <template #default="{ row }">
            商品：<span class="color-main">{{ row.productCount }}</span>
            评价：<span class="color-main">{{ row.productCommentCount }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="dialogData.listQuery.pageNum"
          v-model:page-size="dialogData.listQuery.pageSize"
          background
          layout="prev, pager, next"
          :page-sizes="[5, 10, 15]"
          :total="dialogData.total"
          @size-change="handleDialogSizeChange"
          @current-change="handleDialogCurrentChange"
        />
      </div>
      <div style="clear: both"></div>
      <template #footer>
        <el-button @click="selectDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSelectDialogConfirm"
          >确 定</el-button
        >
      </template>
    </el-dialog>

    <!-- 设置排序对话框 -->
    <el-dialog v-model="sortDialogVisible" title="设置排序" width="40%">
      <el-form :model="sortDialogData" label-width="150px">
        <el-form-item label="排序：">
          <el-input-number
            v-model="sortDialogData.sort"
            style="width: 200px"
            :min="0"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sortDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleUpdateSort">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { HomeBrandService, BrandService } from '@/api/modules';
import type { HomeBrand, Brand } from '@/interface';

const homeBrandTableRef = ref<InstanceType<typeof ElTable>>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  brandName: null as string | null,
  recommendStatus: null as number | null,
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<HomeBrand[]>([]);
const total = ref(0);
const multipleSelection = ref<HomeBrand[]>([]);
const listLoading = ref(false);

const recommendOptions = [
  { label: '未推荐', value: 0 },
  { label: '推荐中', value: 1 },
];

const operates = [
  { label: '设为推荐', value: 0 },
  { label: '取消推荐', value: 1 },
  { label: '删除', value: 2 },
];

const operateType = ref<number | null>(null);

const selectDialogVisible = ref(false);
const dialogData = reactive({
  list: [] as Brand[],
  total: 0,
  multipleSelection: [] as Brand[],
  listQuery: {
    keyword: null as string | null,
    showStatus: 1,
    pageNum: 1,
    pageSize: 5,
  },
});

const sortDialogVisible = ref(false);
const sortDialogData = reactive({ sort: 0, id: null as number | null });

const formatRecommendStatus = (status?: number) => {
  return status === 1 ? '推荐中' : '未推荐';
};

const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery);
};

const handleSearchList = () => {
  listQuery.pageNum = 1;
  getList();
};

const handleSelectionChange = (val: HomeBrand[]) => {
  multipleSelection.value = val;
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

const handleRecommendStatusChange = async (_index: number, row: HomeBrand) => {
  try {
    await ElMessageBox.confirm('是否要修改推荐状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await HomeBrandService.updateRecommendStatus({
      ids: [row.id!],
      recommendStatus: row.recommendStatus,
    });
    ElMessage.success('修改成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改推荐状态失败:', error);
      row.recommendStatus = row.recommendStatus === 0 ? 1 : 0;
      ElMessage.error('修改失败');
    } else {
      await getList();
    }
  }
};

const handleDelete = async (_index: number, row: HomeBrand) => {
  try {
    await ElMessageBox.confirm('是否要删除该推荐?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await HomeBrandService.deleteHomeBrand([row.id!]);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleBatchOperate = async () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }

  const ids = multipleSelection.value.map((item) => item.id!);

  try {
    if (operateType.value === 0) {
      // 设为推荐
      await ElMessageBox.confirm('是否要修改推荐状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await HomeBrandService.updateRecommendStatus({ ids, recommendStatus: 1 });
      ElMessage.success('修改成功');
      await getList();
    } else if (operateType.value === 1) {
      // 取消推荐
      await ElMessageBox.confirm('是否要修改推荐状态?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await HomeBrandService.updateRecommendStatus({ ids, recommendStatus: 0 });
      ElMessage.success('修改成功');
      await getList();
    } else if (operateType.value === 2) {
      // 删除
      await ElMessageBox.confirm('是否要删除选中的推荐?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      await HomeBrandService.deleteHomeBrand(ids);
      ElMessage.success('删除成功');
      await getList();
    } else {
      ElMessage.warning('请选择批量操作类型');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

const handleSelectBrand = () => {
  selectDialogVisible.value = true;
  getDialogList();
};

const handleSelectSearch = () => {
  dialogData.listQuery.pageNum = 1;
  getDialogList();
};

const handleDialogSizeChange = (val: number) => {
  dialogData.listQuery.pageNum = 1;
  dialogData.listQuery.pageSize = val;
  getDialogList();
};

const handleDialogCurrentChange = (val: number) => {
  dialogData.listQuery.pageNum = val;
  getDialogList();
};

const handleDialogSelectionChange = (val: Brand[]) => {
  dialogData.multipleSelection = val;
};

const handleSelectDialogConfirm = async () => {
  if (dialogData.multipleSelection.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }

  try {
    await ElMessageBox.confirm('是否要进行添加操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const selectBrands = dialogData.multipleSelection.map((item) => ({
      brandId: item.id!,
      brandName: item.name,
    }));

    await HomeBrandService.createHomeBrand(selectBrands);
    selectDialogVisible.value = false;
    dialogData.multipleSelection = [];
    ElMessage.success('添加成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('添加失败:', error);
      ElMessage.error('添加失败');
    }
  }
};

const handleEditSort = (_index: number, row: HomeBrand) => {
  sortDialogVisible.value = true;
  sortDialogData.sort = row.sort || 0;
  sortDialogData.id = row.id!;
};

const handleUpdateSort = async () => {
  try {
    await ElMessageBox.confirm('是否要修改排序?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await HomeBrandService.updateHomeBrandSort(sortDialogData.id!, {
      sort: sortDialogData.sort,
    });
    sortDialogVisible.value = false;
    ElMessage.success('修改成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改排序失败:', error);
      ElMessage.error('修改失败');
    }
  }
};

const getList = async () => {
  listLoading.value = true;
  try {
    const response = await HomeBrandService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

const getDialogList = async () => {
  try {
    const response = await BrandService.fetchList(dialogData.listQuery);
    dialogData.list = response.data.list;
    dialogData.total = response.data.total;
  } catch (error) {
    console.error('获取品牌列表失败:', error);
    ElMessage.error('获取品牌列表失败');
  }
};

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

.input-width {
  width: 203px;
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
  margin-bottom: 20px;
}

.color-main {
  color: #409eff;
}
</style>
