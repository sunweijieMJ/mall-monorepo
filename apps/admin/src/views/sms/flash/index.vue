<!--
  秒杀活动列表页面
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
          <el-form-item label="活动名称：">
            <el-input
              v-model="listQuery.keyword"
              class="input-width"
              placeholder="活动名称"
              clearable
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 数据列表 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" style="margin-left: 20px" @click="handleAdd">
        添加活动
      </el-button>
      <el-button class="btn-add" @click="handleShowSessionList">
        秒杀时间段列表
      </el-button>
    </el-card>

    <div class="table-container">
      <el-table
        ref="flashTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column type="selection" width="60" align="center" />
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
          <template #default="{ row }">{{
            formatDate(row.startDate)
          }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="140" align="center">
          <template #default="{ row }">{{ formatDate(row.endDate) }}</template>
        </el-table-column>
        <el-table-column label="上线/下线" width="200" align="center">
          <template #default="{ row, $index }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange($index, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row, $index }">
            <el-button @click="handleSelectSession($index, row)">
              设置商品
            </el-button>
            <el-button @click="handleUpdate($index, row)"> 编辑 </el-button>
            <el-button @click="handleDelete($index, row)"> 删除 </el-button>
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
        :page-sizes="[5, 10, 15]"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="活动信息" width="40%">
      <el-form
        ref="flashPromotionFormRef"
        :model="flashPromotion"
        label-width="150px"
      >
        <el-form-item label="活动标题：">
          <el-input v-model="flashPromotion.title" style="width: 250px" />
        </el-form-item>
        <el-form-item label="开始时间：">
          <el-date-picker
            v-model="flashPromotion.startDate"
            type="date"
            placeholder="请选择时间"
          />
        </el-form-item>
        <el-form-item label="结束时间：">
          <el-date-picker
            v-model="flashPromotion.endDate"
            type="date"
            placeholder="请选择时间"
          />
        </el-form-item>
        <el-form-item label="上线/下线">
          <el-radio-group v-model="flashPromotion.status">
            <el-radio :value="1">上线</el-radio>
            <el-radio :value="0">下线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search, Tickets } from '@element-plus/icons-vue';
import {
  ElMessage,
  ElMessageBox,
  type ElTable,
  type FormInstance,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { FlashPromotionService } from '@/api/modules';
import type { FlashPromotion } from '@/interface';

const router = useRouter();
const flashTableRef = ref<InstanceType<typeof ElTable>>();
const flashPromotionFormRef = ref<FormInstance>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  keyword: null as string | null,
};

const defaultFlashPromotion: Partial<FlashPromotion> = {
  id: undefined,
  title: '',
  startDate: '',
  endDate: '',
  status: 0,
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<FlashPromotion[]>([]);
const total = ref(0);
const listLoading = ref(false);
const dialogVisible = ref(false);
const flashPromotion = reactive<Partial<FlashPromotion>>({
  ...defaultFlashPromotion,
});
const isEdit = ref(false);

const formatActiveStatus = (row: FlashPromotion) => {
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

const handleResetSearch = () => {
  Object.assign(listQuery, defaultListQuery);
};

const handleSearchList = () => {
  listQuery.pageNum = 1;
  getList();
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

const handleAdd = () => {
  dialogVisible.value = true;
  isEdit.value = false;
  Object.assign(flashPromotion, defaultFlashPromotion);
};

const handleShowSessionList = () => {
  router.push({ path: '/mall/sms/flash/sessionList' });
};

const handleStatusChange = async (_index: number, row: FlashPromotion) => {
  try {
    await ElMessageBox.confirm('是否要修改该状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await FlashPromotionService.updateStatus(row.id!, { status: row.status });
    ElMessage.success('修改成功');
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改状态失败:', error);
      row.status = row.status === 0 ? 1 : 0;
      ElMessage.error('修改失败');
    } else {
      await getList();
    }
  }
};

const handleDelete = async (_index: number, row: FlashPromotion) => {
  try {
    await ElMessageBox.confirm('是否要删除该活动?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await FlashPromotionService.deleteFlash(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleUpdate = (_index: number, row: FlashPromotion) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(flashPromotion, row);
};

const handleDialogConfirm = async () => {
  try {
    await ElMessageBox.confirm('是否要确认?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (isEdit.value) {
      await FlashPromotionService.updateFlash(
        flashPromotion.id!,
        flashPromotion as FlashPromotion,
      );
      ElMessage.success('修改成功');
    } else {
      await FlashPromotionService.createFlash(flashPromotion as FlashPromotion);
      ElMessage.success('添加成功');
    }

    dialogVisible.value = false;
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

const handleSelectSession = (_index: number, row: FlashPromotion) => {
  router.push({
    path: '/mall/sms/flash/selectSessionList',
    query: { flashPromotionId: String(row.id) },
  });
};

const getList = async () => {
  listLoading.value = true;
  try {
    const response = await FlashPromotionService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
