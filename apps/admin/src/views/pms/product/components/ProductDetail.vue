<template>
  <el-card class="form-container" shadow="never">
    <el-steps :active="active" finish-status="success" align-center>
      <el-step title="填写商品信息" />
      <el-step title="填写商品促销" />
      <el-step title="填写商品属性" />
      <el-step title="选择商品关联" />
    </el-steps>

    <ProductInfoDetail
      v-show="showStatus[0]"
      :model-value="productParam"
      :is-edit="isEdit"
      @next-step="nextStep"
    />
    <ProductSaleDetail
      v-show="showStatus[1]"
      :model-value="productParam"
      :is-edit="isEdit"
      @next-step="nextStep"
      @prev-step="prevStep"
    />
    <ProductAttrDetail
      v-show="showStatus[2]"
      :model-value="productParam"
      :is-edit="isEdit"
      @next-step="nextStep"
      @prev-step="prevStep"
    />
    <ProductRelationDetail
      v-show="showStatus[3]"
      :model-value="productParam"
      :is-edit="isEdit"
      @prev-step="prevStep"
      @finish-commit="finishCommit"
    />
  </el-card>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ProductAttrDetail from './ProductAttrDetail.vue';
import ProductInfoDetail from './ProductInfoDetail.vue';
import ProductRelationDetail from './ProductRelationDetail.vue';
import ProductSaleDetail from './ProductSaleDetail.vue';
import { ProductService } from '@/api/modules';
import type { ProductParam } from '@/interface';

interface Props {
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const route = useRoute();
const router = useRouter();

// 当前激活的步骤
const active = ref(0);

// 各步骤显示状态
const showStatus = reactive([true, false, false, false]);

// 默认商品参数
const defaultProductParam: ProductParam = {
  albumPics: '',
  brandId: null,
  brandName: '',
  deleteStatus: 0,
  description: '',
  detailDesc: '',
  detailHtml: '',
  detailMobileHtml: '',
  detailTitle: '',
  freightTemplateId: 0,
  giftGrowth: 0,
  giftPoint: 0,
  keywords: '',
  lowStock: 0,
  name: '',
  newStatus: 0,
  note: '',
  originalPrice: null,
  pic: '',
  previewStatus: 0,
  price: 0,
  productAttributeCategoryId: null,
  productCategoryId: null,
  productCategoryName: '',
  cateParentId: null,
  productSn: '',
  promotionEndTime: null,
  promotionPerLimit: null,
  promotionPrice: null,
  promotionStartTime: null,
  promotionType: 0,
  publishStatus: 0,
  recommendStatus: 0,
  sale: 0,
  serviceIds: '',
  sort: 0,
  stock: 0,
  subTitle: '',
  unit: '',
  usePointLimit: null,
  verifyStatus: 0,
  weight: null,
  memberPriceList: [],
  productFullReductionList: [{ fullPrice: 0, reducePrice: 0 }],
  productLadderList: [{ count: 0, discount: 0, price: 0 }],
  productAttributeValueList: [],
  skuStockList: [],
  subjectProductRelationList: [],
  prefrenceAreaProductRelationList: [],
};

// 商品参数
const productParam = reactive<ProductParam>({ ...defaultProductParam });

// 下一步
const nextStep = () => {
  if (active.value < 3) {
    showStatus[active.value] = false;
    active.value++;
    showStatus[active.value] = true;
  }
};

// 上一步
const prevStep = () => {
  if (active.value > 0) {
    showStatus[active.value] = false;
    active.value--;
    showStatus[active.value] = true;
  }
};

// 完成提交
const finishCommit = async (isEditMode: boolean) => {
  try {
    let result;
    if (isEditMode) {
      // 编辑商品
      result = await ProductService.updateProduct(
        productParam.id!,
        productParam,
      );
      ElMessage.success('修改成功');
    } else {
      // 创建商品
      result = await ProductService.createProduct(productParam);
      ElMessage.success('创建成功');
    }
    // 返回商品列表页
    router.push({ path: '/mall/pms/product/list' });
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error(isEditMode ? '修改失败' : '创建失败');
  }
};

// 获取商品详情
const getProduct = async (id: number) => {
  try {
    const response = await ProductService.getProduct(id);
    Object.assign(productParam, response.data);
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败');
  }
};

// 初始化
onMounted(() => {
  if (props.isEdit) {
    const id = route.query.id;
    if (id) {
      getProduct(Number(id));
    }
  }
});
</script>
<style scoped lang="scss">
.form-container {
  :deep(.el-steps) {
    margin-bottom: 30px;
  }
}
</style>
