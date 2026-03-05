<!--
  秒杀商品关联列表页面
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <i class="el-icon-tickets"></i>
      <span>数据列表</span>
      <el-button
        class="btn-add"
        style="margin-left: 20px"
        @click="handleSelectProduct"
      >
        添加
      </el-button>
    </el-card>
    <div class="table-container">
      <el-table
        ref="productRelationTableRef"
        v-loading="listLoading"
        :data="list"
        border
        style="width: 100%"
      >
        <el-table-column label="编号" width="100" align="center">
          <template #default="{ row }">{{ row.id }}</template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="{ row }">{{ row.product?.name }}</template>
        </el-table-column>
        <el-table-column label="货号" width="140" align="center">
          <template #default="{ row }"
            >NO.{{ row.product?.productSn }}</template
          >
        </el-table-column>
        <el-table-column label="商品价格" width="100" align="center">
          <template #default="{ row }">￥{{ row.product?.price }}</template>
        </el-table-column>
        <el-table-column label="剩余数量" width="100" align="center">
          <template #default="{ row }">{{ row.product?.stock }}</template>
        </el-table-column>
        <el-table-column label="秒杀价格" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.flashPromotionPrice !== null"
              >￥{{ row.flashPromotionPrice }}</span
            >
          </template>
        </el-table-column>
        <el-table-column label="秒杀数量" width="100" align="center">
          <template #default="{ row }">{{ row.flashPromotionCount }}</template>
        </el-table-column>
        <el-table-column label="限购数量" width="100" align="center">
          <template #default="{ row }">{{ row.flashPromotionLimit }}</template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ $index, row }">
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
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="listQuery.pageNum"
        v-model:page-size="listQuery.pageSize"
        :page-sizes="[5, 10, 15]"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 选择商品对话框 -->
    <el-dialog v-model="selectDialogVisible" title="选择商品" width="50%">
      <el-input
        v-model="dialogData.listQuery.keyword"
        placeholder="商品名称搜索"
        style="width: 250px; margin-bottom: 20px"
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
        <el-table-column label="商品名称" align="center">
          <template #default="{ row }">{{ row.name }}</template>
        </el-table-column>
        <el-table-column label="货号" width="160" align="center">
          <template #default="{ row }">NO.{{ row.productSn }}</template>
        </el-table-column>
        <el-table-column label="价格" width="120" align="center">
          <template #default="{ row }">￥{{ row.price }}</template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="dialogData.listQuery.pageNum"
          v-model:page-size="dialogData.listQuery.pageSize"
          :page-sizes="[5, 10, 15]"
          :total="dialogData.total"
          background
          layout="prev, pager, next"
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

    <!-- 编辑秒杀商品信息对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑秒杀商品信息" width="40%">
      <el-form
        ref="flashProductRelationFormRef"
        :model="flashProductRelation"
        label-width="150px"
      >
        <el-form-item label="商品名称：">
          <span>{{ flashProductRelation.product?.name }}</span>
        </el-form-item>
        <el-form-item label="货号：">
          <span>NO.{{ flashProductRelation.product?.productSn }}</span>
        </el-form-item>
        <el-form-item label="商品价格：">
          <span>￥{{ flashProductRelation.product?.price }}</span>
        </el-form-item>
        <el-form-item label="秒杀价格：">
          <el-input
            v-model.number="flashProductRelation.flashPromotionPrice"
            class="input-width"
          >
            <template #prepend>￥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="剩余数量：">
          <span>{{ flashProductRelation.product?.stock }}</span>
        </el-form-item>
        <el-form-item label="秒杀数量：">
          <el-input
            v-model.number="flashProductRelation.flashPromotionCount"
            class="input-width"
          />
        </el-form-item>
        <el-form-item label="限购数量：">
          <el-input
            v-model.number="flashProductRelation.flashPromotionLimit"
            class="input-width"
          />
        </el-form-item>
        <el-form-item label="排序：">
          <el-input
            v-model.number="flashProductRelation.sort"
            class="input-width"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleEditDialogConfirm"
          >确 定</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Search } from '@element-plus/icons-vue';
import {
  ElMessage,
  ElMessageBox,
  type ElTable,
  type ElForm,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import FlashProductRelationService from '@/api/modules/flashProductRelation';
import ProductService from '@/api/modules/product';
import type { Product } from '@/interface';

interface FlashProductRelationWithProduct {
  id: number;
  flashPromotionId: number;
  flashPromotionSessionId: number;
  productId: number;
  flashPromotionPrice: number | null;
  flashPromotionCount: number;
  flashPromotionLimit: number;
  sort: number;
  product?: Product;
}

const route = useRoute();
const productRelationTableRef = ref<InstanceType<typeof ElTable>>();
const flashProductRelationFormRef = ref<InstanceType<typeof ElForm>>();

const listQuery = reactive({
  pageNum: 1,
  pageSize: 5,
  flashPromotionId: null as number | null,
  flashPromotionSessionId: null as number | null,
});

const list = ref<FlashProductRelationWithProduct[]>([]);
const total = ref(0);
const listLoading = ref(false);
const selectDialogVisible = ref(false);
const editDialogVisible = ref(false);

const dialogData = reactive({
  list: [] as Product[],
  total: 0,
  multipleSelection: [] as Product[],
  listQuery: {
    keyword: null as string | null,
    pageNum: 1,
    pageSize: 5,
  },
});

const flashProductRelation = reactive<Partial<FlashProductRelationWithProduct>>(
  {
    product: {} as Product,
  },
);

// 分页变化
const handleSizeChange = (val: number) => {
  listQuery.pageNum = 1;
  listQuery.pageSize = val;
  getList();
};

const handleCurrentChange = (val: number) => {
  listQuery.pageNum = val;
  getList();
};

// 选择商品
const handleSelectProduct = () => {
  selectDialogVisible.value = true;
  getDialogList();
};

// 编辑
const handleUpdate = (index: number, row: FlashProductRelationWithProduct) => {
  editDialogVisible.value = true;
  Object.assign(flashProductRelation, row);
};

// 删除
const handleDelete = async (
  index: number,
  row: FlashProductRelationWithProduct,
) => {
  try {
    await ElMessageBox.confirm('是否要删除该商品?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await FlashProductRelationService.deleteFlashProductRelation(row.id);
    ElMessage.success('删除成功!');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 对话框搜索
const handleSelectSearch = () => {
  getDialogList();
};

// 对话框分页
const handleDialogSizeChange = (val: number) => {
  dialogData.listQuery.pageNum = 1;
  dialogData.listQuery.pageSize = val;
  getDialogList();
};

const handleDialogCurrentChange = (val: number) => {
  dialogData.listQuery.pageNum = val;
  getDialogList();
};

// 对话框选择变化
const handleDialogSelectionChange = (val: Product[]) => {
  dialogData.multipleSelection = val;
};

// 确认选择商品
const handleSelectDialogConfirm = async () => {
  if (dialogData.multipleSelection.length < 1) {
    ElMessage.warning('请选择一条记录');
    return;
  }

  const selectProducts = dialogData.multipleSelection.map((item) => ({
    productId: item.id,
    flashPromotionId: listQuery.flashPromotionId,
    flashPromotionSessionId: listQuery.flashPromotionSessionId,
  }));

  try {
    await ElMessageBox.confirm('是否要进行添加操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await FlashProductRelationService.createFlashProductRelation(
      selectProducts,
    );
    selectDialogVisible.value = false;
    dialogData.multipleSelection = [];
    getList();
    ElMessage.success('添加成功!');
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('添加失败:', error);
      ElMessage.error('添加失败');
    }
  }
};

// 确认编辑
const handleEditDialogConfirm = async () => {
  try {
    await ElMessageBox.confirm('是否要确认?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await FlashProductRelationService.updateFlashProductRelation(
      flashProductRelation.id!,
      flashProductRelation,
    );
    ElMessage.success('修改成功！');
    editDialogVisible.value = false;
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('修改失败:', error);
      ElMessage.error('修改失败');
    }
  }
};

// 获取列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await FlashProductRelationService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
  } finally {
    listLoading.value = false;
  }
};

// 获取对话框列表
const getDialogList = async () => {
  try {
    const response = await ProductService.fetchList(dialogData.listQuery);
    dialogData.list = response.data.list;
    dialogData.total = response.data.total;
  } catch (error) {
    console.error('获取商品列表失败:', error);
  }
};

onMounted(() => {
  listQuery.flashPromotionId = Number(route.query.flashPromotionId);
  listQuery.flashPromotionSessionId = Number(
    route.query.flashPromotionSessionId,
  );
  getList();
});
</script>

<style scoped lang="scss">
.operate-container {
  margin-top: 0;
}

.input-width {
  width: 200px;
}
</style>
