<!--
  商品属性类型列表页面
  包含内联编辑对话框
-->
<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <el-card class="operate-container" shadow="never">
      <el-icon style="margin-top: 5px"><Tickets /></el-icon>
      <span style="margin-top: 5px">数据列表</span>
      <el-button class="btn-add" @click="addProductAttrCate"> 添加 </el-button>
    </el-card>

    <!-- 数据列表 -->
    <div class="table-container">
      <el-table
        ref="productAttrCateTableRef"
        v-loading="listLoading"
        style="width: 100%"
        :data="list"
        border
      >
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="类型名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="属性数量" width="200" align="center">
          <template #default="{ row }">
            {{ row.attributeCount == null ? 0 : row.attributeCount }}
          </template>
        </el-table-column>
        <el-table-column label="参数数量" width="200" align="center">
          <template #default="{ row }">
            {{ row.paramCount == null ? 0 : row.paramCount }}
          </template>
        </el-table-column>
        <el-table-column label="设置" width="200" align="center">
          <template #default="{ row, $index }">
            <el-button @click="getAttrList($index, row)"> 属性列表 </el-button>
            <el-button @click="getParamList($index, row)"> 参数列表 </el-button>
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="30%"
      @close="handleClose"
    >
      <el-form
        ref="productAttrCatFormRef"
        :model="productAttrCate"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="productAttrCate.name" auto-complete="off" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="handleConfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Tickets } from '@element-plus/icons-vue';
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
  type ElTable,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ProductAttrCateService } from '@/api/modules';
import type { ProductAttrCate } from '@/interface';

// Router
const router = useRouter();

// 表格引用
const productAttrCateTableRef = ref<InstanceType<typeof ElTable>>();
const productAttrCatFormRef = ref<FormInstance>();

// 查询参数
const listQuery = reactive({
  pageNum: 1,
  pageSize: 5,
});

// 状态
const list = ref<ProductAttrCate[]>([]);
const total = ref(0);
const listLoading = ref(false);
const dialogVisible = ref(false);
const dialogTitle = ref('');

// 属性类型数据
const productAttrCate = reactive({
  name: '',
  id: null as number | null,
});

// 表单验证规则
const rules: FormRules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await ProductAttrCateService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取属性类型列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 添加属性类型
const addProductAttrCate = () => {
  dialogVisible.value = true;
  dialogTitle.value = '添加类型';
  productAttrCate.name = '';
  productAttrCate.id = null;
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

// 删除
const handleDelete = async (_index: number, row: ProductAttrCate) => {
  try {
    await ElMessageBox.confirm('是否要删除该属性类型', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ProductAttrCateService.deleteProductAttrCate(row.id!);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
};

// 编辑
const handleUpdate = (_index: number, row: ProductAttrCate) => {
  dialogVisible.value = true;
  dialogTitle.value = '编辑类型';
  productAttrCate.name = row.name!;
  productAttrCate.id = row.id!;
};

// 查看属性列表
const getAttrList = (_index: number, row: ProductAttrCate) => {
  router.push({
    path: '/mall/pms/productAttr/productAttrList',
    query: { cid: String(row.id), cname: row.name, type: '0' },
  });
};

// 查看参数列表
const getParamList = (_index: number, row: ProductAttrCate) => {
  router.push({
    path: '/mall/pms/productAttr/productAttrList',
    query: { cid: String(row.id), cname: row.name, type: '1' },
  });
};

// 确认添加/编辑
const handleConfirm = async () => {
  if (!productAttrCatFormRef.value) return;

  try {
    const valid = await productAttrCatFormRef.value.validate();
    if (!valid) return false;

    if (dialogTitle.value === '添加类型') {
      await ProductAttrCateService.createProductAttrCate({
        name: productAttrCate.name,
      });
      ElMessage.success('添加成功');
    } else {
      await ProductAttrCateService.updateProductAttrCate(productAttrCate.id!, {
        name: productAttrCate.name,
      });
      ElMessage.success('修改成功');
    }

    dialogVisible.value = false;
    await getList();
  } catch (error) {
    console.error('操作失败:', error);
    ElMessage.error('操作失败');
  }
};

// 关闭对话框
const handleClose = () => {
  if (productAttrCatFormRef.value) {
    productAttrCatFormRef.value.clearValidate();
  }
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

.pagination-container {
  display: flex;
  justify-content: center;
}
</style>
