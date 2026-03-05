<!--
  商品属性列表页面
  显示特定分类下的属性或参数
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon style="margin-top: 5px"><Tickets /></el-icon>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" @click="addProductAttr"> 添加 </el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="productAttrTableRef"
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
        <el-table-column label="属性名称" width="140" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="商品类型" width="140" align="center">
          <template #default>{{ route.query.cname }}</template>
        </el-table-column>
        <el-table-column label="属性是否可选" width="120" align="center">
          <template #default="{ row }">{{
            selectTypeFilter(row.selectType)
          }}</template>
        </el-table-column>
        <el-table-column label="属性值的录入方式" width="150" align="center">
          <template #default="{ row }">{{
            inputTypeFilter(row.inputType)
          }}</template>
        </el-table-column>
        <el-table-column label="可选值列表" align="center">
          <template #default="{ row }">{{ row.inputList }}</template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
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
import { Tickets } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ProductAttrService } from '@/api/modules';
import type { ProductAttr } from '@/interface';

// Router
const router = useRouter();
const route = useRoute();

// 表格引用
const productAttrTableRef = ref<InstanceType<typeof ElTable>>();

// 查询参数
const listQuery = reactive({
  pageNum: 1,
  pageSize: 5,
  type: Number(route.query.type),
});

// 状态
const list = ref<ProductAttr[]>([]);
const total = ref(0);
const listLoading = ref(false);
const multipleSelection = ref<ProductAttr[]>([]);
const operateType = ref<string>('');

// 批量操作选项
const operates = [
  {
    label: '删除',
    value: 'deleteProductAttr',
  },
];

// 输入方式过滤器
const inputTypeFilter = (value?: number) => {
  if (value === 1) {
    return '从列表中选取';
  }
  return '手工录入';
};

// 选择类型过滤器
const selectTypeFilter = (value?: number) => {
  if (value === 1) {
    return '单选';
  } else if (value === 2) {
    return '多选';
  }
  return '唯一';
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const cid = Number(route.query.cid);
    const response = await ProductAttrService.fetchList(cid, listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取属性列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 添加属性
const addProductAttr = () => {
  router.push({
    path: '/mall/pms/productAttr/addProductAttr',
    query: {
      cid: route.query.cid,
      type: route.query.type,
    },
  });
};

// 选择变化
const handleSelectionChange = (val: ProductAttr[]) => {
  multipleSelection.value = val;
};

// 批量操作
const handleBatchOperate = () => {
  if (multipleSelection.value.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }

  if (operateType.value !== 'deleteProductAttr') {
    ElMessage.warning('请选择批量操作类型');
    return;
  }

  const ids = multipleSelection.value.map((item) => item.id!);
  handleDeleteProductAttr(ids);
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

// 编辑属性
const handleUpdate = (_index: number, row: ProductAttr) => {
  router.push({
    path: '/mall/pms/productAttr/updateProductAttr',
    query: { id: String(row.id) },
  });
};

// 删除属性（支持批量）
const handleDeleteProductAttr = async (ids: number[]) => {
  try {
    await ElMessageBox.confirm('是否要删除该属性', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ProductAttrService.deleteProductAttr({ ids });
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

// 删除单个属性
const handleDelete = (_index: number, row: ProductAttr) => {
  handleDeleteProductAttr([row.id!]);
};

// 页面加载
onMounted(() => {
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

.batch-operate-container {
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>
