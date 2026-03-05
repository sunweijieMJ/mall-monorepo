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
          查询结果
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
          <el-form-item label="输入搜索：">
            <el-input
              v-model="listQuery.keyword"
              style="width: 203px"
              placeholder="商品名称"
            />
          </el-form-item>
          <el-form-item label="商品货号：">
            <el-input
              v-model="listQuery.productSn"
              style="width: 203px"
              placeholder="商品货号"
            />
          </el-form-item>
          <el-form-item label="商品分类：">
            <el-cascader
              v-model="selectProductCateValue"
              :options="productCateOptions"
              clearable
              style="width: 203px"
            />
          </el-form-item>
          <el-form-item label="商品品牌：">
            <el-select
              v-model="listQuery.brandId"
              placeholder="请选择品牌"
              clearable
            >
              <el-option
                v-for="item in brandOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="上架状态：">
            <el-select
              v-model="listQuery.publishStatus"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in publishStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态：">
            <el-select
              v-model="listQuery.verifyStatus"
              placeholder="全部"
              clearable
            >
              <el-option
                v-for="item in verifyStatusOptions"
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
      <el-button class="btn-add" @click="handleAddProduct"> 添加 </el-button>
    </el-card>

    <div class="table-container">
      <el-table
        ref="productTableRef"
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
        <el-table-column label="商品图片" width="120" align="center">
          <template #default="{ row }">
            <img style="height: 80px" :src="row.pic" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" align="center">
          <template #default="{ row }">
            <p>{{ row.name }}</p>
            <p>品牌：{{ row.brandName }}</p>
          </template>
        </el-table-column>
        <el-table-column label="价格/货号" width="120" align="center">
          <template #default="{ row }">
            <p>价格：￥{{ row.price }}</p>
            <p>货号：{{ row.productSn }}</p>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="140" align="center">
          <template #default="{ row, $index }">
            <p>
              上架：
              <el-switch
                v-model="row.publishStatus"
                :active-value="1"
                :inactive-value="0"
                @change="handlePublishStatusChange($index, row)"
              />
            </p>
            <p>
              新品：
              <el-switch
                v-model="row.newStatus"
                :active-value="1"
                :inactive-value="0"
                @change="handleNewStatusChange($index, row)"
              />
            </p>
            <p>
              推荐：
              <el-switch
                v-model="row.recommandStatus"
                :active-value="1"
                :inactive-value="0"
                @change="handleRecommendStatusChange($index, row)"
              />
            </p>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </el-table-column>
        <el-table-column label="SKU库存" width="100" align="center">
          <template #default="{ row, $index }">
            <el-button
              type="primary"
              :icon="Edit"
              circle
              @click="handleShowSkuEditDialog($index, row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="销量" width="100" align="center">
          <template #default="{ row }">{{ row.sale }}</template>
        </el-table-column>
        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row, $index }">
            <p>{{ getVerifyStatusLabel(row.verifyStatus) }}</p>
            <p>
              <el-button
                type="primary"
                link
                @click="handleShowVerifyDetail($index, row)"
              >
                审核详情
              </el-button>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row, $index }">
            <p>
              <el-button @click="handleShowProduct($index, row)">
                查看
              </el-button>
              <el-button @click="handleUpdate($index, row)"> 编辑 </el-button>
            </p>
            <p>
              <el-button @click="handleShowLog($index, row)"> 日志 </el-button>
              <el-button type="danger" @click="handleDelete($index, row)">
                删除
              </el-button>
            </p>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operate-container">
      <el-select
        v-model="operateType"
        placeholder="批量操作"
        style="width: 150px"
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

    <!-- SKU库存管理对话框 -->
    <el-dialog
      v-model="editSkuInfo.dialogVisible"
      title="编辑货品信息"
      width="40%"
    >
      <div>
        <span>商品货号：</span>
        <span>{{ editSkuInfo.productSn }}</span>
        <el-input
          v-model="editSkuInfo.keyword"
          placeholder="按sku编号搜索"
          style="width: 50%; margin-left: 20px"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearchEditSku" />
          </template>
        </el-input>
      </div>
      <el-table
        :data="editSkuInfo.stockList"
        style="width: 100%; margin-top: 20px"
        border
      >
        <el-table-column label="SKU编号" align="center">
          <template #default="{ row }">
            <el-input v-model="row.skuCode" />
          </template>
        </el-table-column>
        <el-table-column
          v-for="(item, index) in editSkuInfo.productAttr"
          :key="item.id"
          :label="item.name"
          align="center"
        >
          <template #default="{ row }">
            {{ getProductSkuSp(row, index) }}
          </template>
        </el-table-column>
        <el-table-column label="销售价格" width="80" align="center">
          <template #default="{ row }">
            <el-input v-model="row.price" />
          </template>
        </el-table-column>
        <el-table-column label="商品库存" width="80" align="center">
          <template #default="{ row }">
            <el-input v-model="row.stock" />
          </template>
        </el-table-column>
        <el-table-column label="库存预警值" width="100" align="center">
          <template #default="{ row }">
            <el-input v-model="row.lowStock" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editSkuInfo.dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditSkuConfirm"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { Search, Tickets, Edit } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox, type ElTable } from 'element-plus';
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  ProductService,
  BrandService,
  ProductCateService,
  SkuStockService,
  ProductAttrService,
} from '@/api/modules';
import type {
  Product,
  ProductCategory,
  ProductAttribute,
  SkuStock,
} from '@/interface';

// 类型定义
interface SelectOption {
  label: string;
  value: number | string;
}

interface CascaderOption {
  label: string;
  value: number;
  children?: CascaderOption[];
}

interface BatchOperate {
  label: string;
  value: string;
}

interface EditSkuInfo {
  dialogVisible: boolean;
  productId: number | null;
  productSn: string;
  productAttributeCategoryId: number | null;
  stockList: SkuStock[];
  productAttr: ProductAttribute[];
  keyword: string | null;
}

const router = useRouter();
const productTableRef = ref<InstanceType<typeof ElTable>>();

// 查询参数
const defaultListQuery = {
  pageNum: 1,
  pageSize: 5,
  keyword: null as string | null,
  productSn: null as string | null,
  publishStatus: null as number | null,
  verifyStatus: null as number | null,
  productCategoryId: null as number | null,
  brandId: null as number | null,
};

const listQuery = reactive({ ...defaultListQuery });
const list = ref<Product[]>([]);
const total = ref(0);
const multipleSelection = ref<Product[]>([]);
const listLoading = ref(false);

// 筛选选项
const selectProductCateValue = ref<number[]>([]);
const productCateOptions = ref<CascaderOption[]>([]);
const brandOptions = ref<SelectOption[]>([]);

const publishStatusOptions: SelectOption[] = [
  { label: '上架', value: 1 },
  { label: '下架', value: 0 },
];

const verifyStatusOptions: SelectOption[] = [
  { label: '审核通过', value: 1 },
  { label: '未审核', value: 0 },
];

// 批量操作
const operateType = ref<string | null>(null);
const operates: BatchOperate[] = [
  { label: '商品上架', value: 'publishOn' },
  { label: '商品下架', value: 'publishOff' },
  { label: '设为推荐', value: 'recommendOn' },
  { label: '取消推荐', value: 'recommendOff' },
  { label: '设为新品', value: 'newOn' },
  { label: '取消新品', value: 'newOff' },
  { label: '转移到分类', value: 'transferCategory' },
  { label: '移入回收站', value: 'recycle' },
];

// SKU编辑
const editSkuInfo = reactive<EditSkuInfo>({
  dialogVisible: false,
  productId: null,
  productSn: '',
  productAttributeCategoryId: null,
  stockList: [],
  productAttr: [],
  keyword: null,
});

// 监听分类选择变化
watch(selectProductCateValue, (newValue) => {
  if (newValue && newValue.length === 2) {
    listQuery.productCategoryId = newValue[1];
  } else {
    listQuery.productCategoryId = null;
  }
});

// 获取审核状态标签
const getVerifyStatusLabel = (status: number) => {
  return status === 1 ? '审核通过' : '未审核';
};

// 获取SKU规格参数
const getProductSkuSp = (row: SkuStock, index: number) => {
  if (!row.spData) return null;
  try {
    const spData = JSON.parse(row.spData);
    if (spData && index < spData.length) {
      return spData[index].value;
    }
  } catch (error) {
    console.error('解析spData失败:', error);
  }
  return null;
};

// 获取商品列表
const getList = async () => {
  listLoading.value = true;
  try {
    const response = await ProductService.fetchList(listQuery);
    list.value = response.data.list;
    total.value = response.data.total;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
  } finally {
    listLoading.value = false;
  }
};

// 获取品牌列表
const getBrandList = async () => {
  try {
    const response = await BrandService.fetchList({
      pageNum: 1,
      pageSize: 100,
    });
    brandOptions.value = response.data.list.map((item) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('获取品牌列表失败:', error);
  }
};

// 获取商品分类列表（含子分类）
const getProductCateList = async () => {
  try {
    const response = await ProductCateService.fetchListWithChildren();
    const list = response.data;
    productCateOptions.value = list.map(
      (item: ProductCategory & { children?: ProductCategory[] }) => ({
        label: item.name,
        value: item.id,
        children:
          item.children?.map((child: ProductCategory) => ({
            label: child.name,
            value: child.id,
          })) || [],
      }),
    );
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 搜索
const handleSearchList = () => {
  listQuery.pageNum = 1;
  getList();
};

// 重置搜索
const handleResetSearch = () => {
  selectProductCateValue.value = [];
  Object.assign(listQuery, defaultListQuery);
};

// 表格选择变化
const handleSelectionChange = (val: Product[]) => {
  multipleSelection.value = val;
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

// 上架状态切换
const handlePublishStatusChange = async (_index: number, row: Product) => {
  try {
    await ProductService.updatePublishStatus({
      ids: [row.id!],
      publishStatus: row.publishStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改失败:', error);
    row.publishStatus = row.publishStatus === 0 ? 1 : 0;
    ElMessage.error('修改失败');
  }
};

// 新品状态切换
const handleNewStatusChange = async (_index: number, row: Product) => {
  try {
    await ProductService.updateNewStatus({
      ids: [row.id!],
      newStatus: row.newStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改失败:', error);
    row.newStatus = row.newStatus === 0 ? 1 : 0;
    ElMessage.error('修改失败');
  }
};

// 推荐状态切换
const handleRecommendStatusChange = async (_index: number, row: Product) => {
  try {
    await ProductService.updateRecommendStatus({
      ids: [row.id!],
      recommendStatus: row.recommandStatus,
    });
    ElMessage.success('修改成功');
  } catch (error) {
    console.error('修改失败:', error);
    row.recommandStatus = row.recommandStatus === 0 ? 1 : 0;
    ElMessage.error('修改失败');
  }
};

// 批量操作
const handleBatchOperate = async () => {
  if (!operateType.value) {
    ElMessage.warning('请选择操作类型');
    return;
  }

  if (!multipleSelection.value || multipleSelection.value.length < 1) {
    ElMessage.warning('请选择要操作的商品');
    return;
  }

  try {
    await ElMessageBox.confirm('是否要进行该批量操作?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    const ids = multipleSelection.value.map((item) => item.id!);

    // 根据操作类型执行对应操作
    switch (operateType.value) {
      case 'publishOn':
        await ProductService.updatePublishStatus({ ids, publishStatus: 1 });
        break;
      case 'publishOff':
        await ProductService.updatePublishStatus({ ids, publishStatus: 0 });
        break;
      case 'recommendOn':
        await ProductService.updateRecommendStatus({ ids, recommendStatus: 1 });
        break;
      case 'recommendOff':
        await ProductService.updateRecommendStatus({ ids, recommendStatus: 0 });
        break;
      case 'newOn':
        await ProductService.updateNewStatus({ ids, newStatus: 1 });
        break;
      case 'newOff':
        await ProductService.updateNewStatus({ ids, newStatus: 0 });
        break;
      case 'transferCategory':
        ElMessage.info('转移到分类功能开发中');
        return;
      case 'recycle':
        await ProductService.deleteProduct(ids);
        break;
      default:
        break;
    }

    ElMessage.success('操作成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

// SKU库存管理
const handleShowSkuEditDialog = async (_index: number, row: Product) => {
  editSkuInfo.dialogVisible = true;
  editSkuInfo.productId = row.id;
  editSkuInfo.productSn = row.productSn;
  editSkuInfo.productAttributeCategoryId = row.productAttributeCategoryId;
  editSkuInfo.keyword = null;

  try {
    // 获取SKU库存列表
    const stockResponse = await SkuStockService.fetchList(row.id, {
      keyword: editSkuInfo.keyword || undefined,
    });
    editSkuInfo.stockList = stockResponse.result;

    // 获取商品属性列表
    if (row.productAttributeCategoryId) {
      const attrResponse = await ProductAttrService.fetchList(
        row.productAttributeCategoryId,
        { type: 0 },
      );
      editSkuInfo.productAttr = attrResponse.result.list;
    }
  } catch (error) {
    console.error('获取SKU信息失败:', error);
    ElMessage.error('获取SKU信息失败');
  }
};

const handleSearchEditSku = async () => {
  if (!editSkuInfo.productId) return;

  try {
    const response = await SkuStockService.fetchList(editSkuInfo.productId, {
      keyword: editSkuInfo.keyword || undefined,
    });
    editSkuInfo.stockList = response.data;
  } catch (error) {
    console.error('搜索SKU失败:', error);
    ElMessage.error('搜索失败');
  }
};

const handleEditSkuConfirm = async () => {
  if (!editSkuInfo.stockList || editSkuInfo.stockList.length <= 0) {
    ElMessage.warning('暂无sku信息');
    return;
  }

  if (!editSkuInfo.productId) return;

  try {
    await ElMessageBox.confirm('是否要进行修改', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await SkuStockService.update(editSkuInfo.productId, editSkuInfo.stockList);
    ElMessage.success('修改成功');
    editSkuInfo.dialogVisible = false;
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改SKU失败:', error);
      ElMessage.error('修改失败');
    }
  }
};

// 商品操作
const handleAddProduct = () => {
  router.push({ path: '/pms/addProduct' });
};

const handleUpdate = (_index: number, row: Product) => {
  router.push({
    path: '/pms/updateProduct',
    query: { id: String(row.id) },
  });
};

const handleShowProduct = (_index: number, row: Product) => {
  console.log('查看商品:', row);
  ElMessage.info('查看商品功能开发中');
};

const handleShowVerifyDetail = (_index: number, row: Product) => {
  console.log('审核详情:', row);
  ElMessage.info('审核详情功能开发中');
};

const handleShowLog = (_index: number, row: Product) => {
  console.log('操作日志:', row);
  ElMessage.info('操作日志功能开发中');
};

const handleDelete = async (_index: number, row: Product) => {
  try {
    await ElMessageBox.confirm('是否要删除该商品?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    await ProductService.deleteProduct([row.id!]);
    ElMessage.success('删除成功');
    await getList();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

// 初始化
onMounted(() => {
  getList();
  getBrandList();
  getProductCateList();
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
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
