<!--
  优惠券详情组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-form
      ref="couponFormRef"
      :model="coupon"
      :rules="rules"
      label-width="150px"
    >
      <el-form-item label="优惠券类型：">
        <el-select v-model="coupon.type">
          <el-option
            v-for="type in typeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠券名称：" prop="name">
        <el-input v-model="coupon.name" class="input-width" />
      </el-form-item>
      <el-form-item label="适用平台：">
        <el-select v-model="coupon.platform">
          <el-option
            v-for="item in platformOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="总发行量：" prop="publishCount">
        <el-input
          v-model.number="coupon.publishCount"
          placeholder="只能输入正整数"
          class="input-width"
        />
      </el-form-item>
      <el-form-item label="面额：" prop="amount">
        <el-input
          v-model.number="coupon.amount"
          placeholder="面值只能是数值，限2位小数"
          class="input-width"
        >
          <template #append>元</template>
        </el-input>
      </el-form-item>
      <el-form-item label="每人限领：">
        <el-input
          v-model.number="coupon.perLimit"
          placeholder="只能输入正整数"
          class="input-width"
        >
          <template #append>张</template>
        </el-input>
      </el-form-item>
      <el-form-item label="使用门槛：" prop="minPoint">
        <el-input
          v-model.number="coupon.minPoint"
          placeholder="只能输入正整数"
          class="input-width"
        >
          <template #prepend>满</template>
          <template #append>元可用</template>
        </el-input>
      </el-form-item>
      <el-form-item label="领取日期：" prop="enableTime">
        <el-date-picker
          v-model="coupon.enableTime"
          type="date"
          placeholder="选择日期"
          class="input-width"
        />
      </el-form-item>
      <el-form-item label="有效期：">
        <el-date-picker
          v-model="coupon.startTime"
          type="date"
          placeholder="选择日期"
          style="width: 150px"
        />
        <span style="margin-right: 20px; margin-left: 20px">至</span>
        <el-date-picker
          v-model="coupon.endTime"
          type="date"
          placeholder="选择日期"
          style="width: 150px"
        />
      </el-form-item>
      <el-form-item label="可使用商品：">
        <el-radio-group v-model="coupon.useType">
          <el-radio-button :label="0">全场通用</el-radio-button>
          <el-radio-button :label="1">指定分类</el-radio-button>
          <el-radio-button :label="2">指定商品</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-show="coupon.useType === 1">
        <el-cascader
          v-model="selectProductCate"
          clearable
          placeholder="请选择分类名称"
          :options="productCateOptions"
        />
        <el-button @click="handleAddProductCategoryRelation">添加</el-button>
        <el-table
          ref="productCateRelationTableRef"
          :data="coupon.productCategoryRelationList"
          style="width: 100%; margin-top: 20px"
          border
        >
          <el-table-column label="分类名称" align="center">
            <template #default="{ row }">
              {{ row.parentCategoryName }} > {{ row.productCategoryName }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template #default="{ $index, row }">
              <el-button
                type="text"
                @click="handleDeleteProductCateRelation($index, row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item v-show="coupon.useType === 2">
        <el-select
          v-model="selectProduct"
          filterable
          remote
          reserve-keyword
          placeholder="商品名称/商品货号"
          :remote-method="searchProductMethod"
          :loading="selectProductLoading"
        >
          <el-option
            v-for="item in selectProductOptions"
            :key="item.productId"
            :label="item.productName"
            :value="item.productId"
          >
            <span style="float: left">{{ item.productName }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px"
              >NO.{{ item.productSn }}</span
            >
          </el-option>
        </el-select>
        <el-button @click="handleAddProductRelation">添加</el-button>
        <el-table
          ref="productRelationTableRef"
          :data="coupon.productRelationList"
          style="width: 100%; margin-top: 20px"
          border
        >
          <el-table-column label="商品名称" align="center">
            <template #default="{ row }">{{ row.productName }}</template>
          </el-table-column>
          <el-table-column label="货号" align="center" width="120">
            <template #default="{ row }">NO.{{ row.productSn }}</template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template #default="{ $index, row }">
              <el-button
                type="text"
                @click="handleDeleteProductRelation($index, row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="备注：">
        <el-input
          v-model="coupon.note"
          class="input-width"
          type="textarea"
          :rows="5"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button v-if="!isEdit" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import {
  ElMessage,
  ElMessageBox,
  type ElForm,
  type ElTable,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CouponService from '@/api/modules/coupon';
import ProductService from '@/api/modules/product';
import ProductCateService from '@/api/modules/productCate';
import type { Coupon } from '@/interface';

interface Props {
  isEdit?: boolean;
}

interface ProductRelation {
  productId: number;
  productName: string;
  productSn: string;
}

interface ProductCategoryRelation {
  productCategoryId: number;
  productCategoryName: string;
  parentCategoryName: string;
}

interface CouponWithRelations extends Partial<Coupon> {
  productRelationList: ProductRelation[];
  productCategoryRelationList: ProductCategoryRelation[];
}

interface CascaderOption {
  label: string;
  value: number;
  children?: CascaderOption[];
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const route = useRoute();
const router = useRouter();
const couponFormRef = ref<InstanceType<typeof ElForm>>();
const productCateRelationTableRef = ref<InstanceType<typeof ElTable>>();
const productRelationTableRef = ref<InstanceType<typeof ElTable>>();

const defaultCoupon: CouponWithRelations = {
  type: 0,
  name: '',
  platform: 0,
  amount: undefined,
  perLimit: 1,
  minPoint: undefined,
  startTime: null,
  endTime: null,
  useType: 0,
  note: null,
  publishCount: undefined,
  productRelationList: [],
  productCategoryRelationList: [],
};

const coupon = reactive<CouponWithRelations>({ ...defaultCoupon });

const typeOptions = [
  { label: '全场赠券', value: 0 },
  { label: '会员赠券', value: 1 },
  { label: '购物赠券', value: 2 },
  { label: '注册赠券', value: 3 },
];

const platformOptions = [
  { label: '全平台', value: 0 },
  { label: '移动平台', value: 1 },
  { label: 'PC平台', value: 2 },
];

const rules = {
  name: [
    { required: true, message: '请输入优惠券名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
  publishCount: [
    {
      type: 'number',
      required: true,
      message: '只能输入正整数',
      trigger: 'blur',
    },
  ],
  amount: [
    {
      type: 'number',
      required: true,
      message: '面值只能是数值，0.01-10000，限2位小数',
      trigger: 'blur',
    },
  ],
  minPoint: [
    {
      type: 'number',
      required: true,
      message: '只能输入正整数',
      trigger: 'blur',
    },
  ],
};

const selectProduct = ref<number | null>(null);
const selectProductLoading = ref(false);
const selectProductOptions = ref<ProductRelation[]>([]);
const selectProductCate = ref<number[]>([]);
const productCateOptions = ref<CascaderOption[]>([]);

// 获取商品分类列表
const getProductCateList = async () => {
  try {
    const response = await ProductCateService.fetchListWithChildren();
    const list = response.data;
    productCateOptions.value = [];

    for (const item of list) {
      const children: CascaderOption[] = [];
      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          children.push({ label: child.name, value: child.id });
        }
      }
      productCateOptions.value.push({
        label: item.name,
        value: item.id,
        children,
      });
    }
  } catch (error) {
    console.error('获取商品分类列表失败:', error);
  }
};

// 搜索商品
const searchProductMethod = async (query: string) => {
  if (query !== '') {
    selectProductLoading.value = true;
    try {
      const response = await ProductService.fetchSimpleList({ keyword: query });
      const productList = response.data;
      selectProductOptions.value = productList.map((item) => ({
        productId: item.id,
        productName: item.name,
        productSn: item.productSn || '',
      }));
    } catch (error) {
      console.error('搜索商品失败:', error);
    } finally {
      selectProductLoading.value = false;
    }
  } else {
    selectProductOptions.value = [];
  }
};

// 添加商品关联
const handleAddProductRelation = () => {
  if (selectProduct.value === null) {
    ElMessage.warning('请先选择商品');
    return;
  }

  const product = getProductById(selectProduct.value);
  if (product) {
    coupon.productRelationList.push(product);
    selectProduct.value = null;
  }
};

// 删除商品关联
const handleDeleteProductRelation = (index: number) => {
  coupon.productRelationList.splice(index, 1);
};

// 添加商品分类关联
const handleAddProductCategoryRelation = () => {
  if (!selectProductCate.value || selectProductCate.value.length === 0) {
    ElMessage.warning('请先选择商品分类');
    return;
  }

  const category = getProductCateByIds(selectProductCate.value);
  if (category) {
    coupon.productCategoryRelationList.push(category);
    selectProductCate.value = [];
  }
};

// 删除商品分类关联
const handleDeleteProductCateRelation = (index: number) => {
  coupon.productCategoryRelationList.splice(index, 1);
};

// 根据ID获取商品
const getProductById = (id: number): ProductRelation | null => {
  for (const product of selectProductOptions.value) {
    if (id === product.productId) {
      return product;
    }
  }
  return null;
};

// 根据ID数组获取商品分类
const getProductCateByIds = (ids: number[]): ProductCategoryRelation | null => {
  let name = '';
  let parentName = '';

  for (const option of productCateOptions.value) {
    if (option.value === ids[0]) {
      parentName = option.label;
      if (option.children) {
        for (const child of option.children) {
          if (child.value === ids[1]) {
            name = child.label;
          }
        }
      }
    }
  }

  return {
    productCategoryId: ids[1],
    productCategoryName: name,
    parentCategoryName: parentName,
  };
};

// 提交表单
const onSubmit = async () => {
  if (!couponFormRef.value) return;

  try {
    const valid = await couponFormRef.value.validate();
    if (!valid) {
      ElMessage.error('验证失败');
      return;
    }

    await ElMessageBox.confirm('是否提交数据?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (props.isEdit) {
      const id = Number(route.query.id);
      await CouponService.updateCoupon(id, coupon as Coupon);
      ElMessage.success('修改成功');
    } else {
      await CouponService.createCoupon(coupon as Coupon);
      ElMessage.success('提交成功');
    }

    router.back();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败');
    }
  }
};

// 重置表单
const resetForm = () => {
  couponFormRef.value?.resetFields();
  Object.assign(coupon, defaultCoupon);
};

onMounted(async () => {
  if (props.isEdit) {
    try {
      const id = Number(route.query.id);
      const response = await CouponService.getCoupon(id);
      Object.assign(coupon, response.data);
    } catch (error) {
      console.error('获取优惠券详情失败:', error);
      ElMessage.error('获取优惠券详情失败');
    }
  }
  await getProductCateList();
});
</script>

<style scoped lang="scss">
.form-container {
  padding: 20px;
}

.input-width {
  width: 60%;
}
</style>
