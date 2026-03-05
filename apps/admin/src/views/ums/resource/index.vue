<!--
  资源列表页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
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
          <el-form-item label="资源名称：">
            <el-input
              v-model="listQuery.nameKeyword"
              class="input-width"
              placeholder="资源名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="资源路径：">
            <el-input
              v-model="listQuery.urlKeyword"
              class="input-width"
              placeholder="资源路径"
              clearable
            />
          </el-form-item>
          <el-form-item label="资源分类：">
            <el-select
              v-model="listQuery.categoryId"
              placeholder="全部"
              clearable
              class="input-width"
            >
              <el-option
                v-for="item in categoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon><Tickets /></el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" style="margin-left: 20px" @click="handleAdd">
        添加
      </el-button>
      <el-button class="btn-add" @click="handleShowCategory">
        资源分类
      </el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="resourceTableRef"
        v-loading="listLoading"
        :data="list"
        style="width: 100%"
        border
      >
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="资源名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="资源路径" align="center">
          <template #default="{ row }">{{ row.url }}</template>
        </el-table-column>
        <el-table-column label="描述" align="center">
          <template #default="{ row }">{{ row.description }}</template>
        </el-table-column>
        <el-table-column label="添加时间" width="160" align="center">
          <template #default="{ row }">{{
            formatDateTime(row.createTime)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑资源' : '添加资源'"
      width="40%"
    >
      <el-form ref="resourceFormRef" :model="resource" label-width="150px">
        <el-form-item label="资源名称：">
          <el-input v-model="resource.name" style="width: 250px" />
        </el-form-item>
        <el-form-item label="资源路径：">
          <el-input v-model="resource.url" style="width: 250px" />
        </el-form-item>
        <el-form-item label="资源分类：">
          <el-select
            v-model="resource.categoryId"
            placeholder="全部"
            clearable
            style="width: 250px"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述：">
          <el-input
            v-model="resource.description"
            type="textarea"
            :rows="5"
            style="width: 250px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleDialogConfirm"
            >确 定</el-button
          >
        </span>
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
  type ElForm,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ResourceService, ResourceCategoryService } from '@/api/modules';
import type { Resource } from '@/interface';
import { formatDate } from '@/utils/date';

const router = useRouter();
const resourceTableRef = ref<InstanceType<typeof ElTable>>();
const resourceFormRef = ref<InstanceType<typeof ElForm>>();

const defaultListQuery = {
  pageNum: 1,
  pageSize: 10,
  nameKeyword: null as string | null,
  urlKeyword: null as string | null,
  categoryId: null as number | null,
};

const defaultResource = {
  id: null,
  name: '',
  url: '',
  categoryId: null as number | null,
  description: '',
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<Resource[]>([]);
const total = ref(0);
const listLoading = ref(false);
const dialogVisible = ref(false);
const resource = reactive<Partial<Resource>>({ ...defaultResource });
const isEdit = ref(false);
const categoryOptions = ref<Array<{ label: string; value: number }>>([]);
const defaultCategoryId = ref<number | null>(null);

// 格式化时间
const formatDateTime = (time?: string | number) => {
  if (!time) return 'N/A';
  const date = new Date(time);
  return formatDate(date, 'yyyy-MM-dd hh:mm:ss');
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await ResourceService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 获取分类列表
const getCateList = async () => {
  try {
    const response = await ResourceCategoryService.listAllCate();
    const cateList = response.data;
    categoryOptions.value = cateList.map((cate: any) => ({
      label: cate.name,
      value: cate.id,
    }));
    if (cateList.length > 0) {
      defaultCategoryId.value = cateList[0].id;
    }
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
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
  Object.assign(resource, defaultResource);
  resource.categoryId = defaultCategoryId.value;
};

const handleDelete = async (_index: number, row: Resource) => {
  try {
    await ElMessageBox.confirm('是否要删除该资源?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ResourceService.deleteResource(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleUpdate = (_index: number, row: Resource) => {
  dialogVisible.value = true;
  isEdit.value = true;
  Object.assign(resource, row);
};

const handleDialogConfirm = async () => {
  try {
    await ElMessageBox.confirm('是否要确认?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (isEdit.value) {
      await ResourceService.updateResource(resource.id!, resource as Resource);
      ElMessage.success('修改成功');
    } else {
      await ResourceService.createResource(resource as Resource);
      ElMessage.success('添加成功');
    }

    dialogVisible.value = false;
    await getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

const handleShowCategory = () => {
  router.push({ path: '/ums/resourceCategory' });
};

onMounted(() => {
  getList();
  getCateList();
});
</script>
<style scoped lang="scss">
.filter-container {
  margin-bottom: 10px;

  .el-icon {
    margin-right: 5px;
    vertical-align: middle;
  }

  .input-width {
    width: 203px;
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

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
