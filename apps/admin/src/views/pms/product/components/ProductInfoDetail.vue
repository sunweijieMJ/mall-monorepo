<template>
  <div style="margin-top: 50px">
    <el-form
      ref="productInfoFormRef"
      :model="localValue"
      :rules="rules"
      label-width="120px"
      class="form-inner-container"
    >
      <el-form-item label="商品分类：" prop="productCategoryId">
        <el-cascader
          v-model="selectProductCateValue"
          :options="productCateOptions"
          placeholder="请选择商品分类"
        />
      </el-form-item>
      <el-form-item label="商品名称：" prop="name">
        <el-input v-model="localValue.name" />
      </el-form-item>
      <el-form-item label="副标题：" prop="subTitle">
        <el-input v-model="localValue.subTitle" />
      </el-form-item>
      <el-form-item label="商品品牌：" prop="brandId">
        <el-select
          v-model="localValue.brandId"
          placeholder="请选择品牌"
          @change="handleBrandChange"
        >
          <el-option
            v-for="item in brandOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="商品介绍：">
        <el-input
          v-model="localValue.description"
          type="textarea"
          :autosize="{ minRows: 2 }"
          placeholder="请输入内容"
        />
      </el-form-item>
      <el-form-item label="商品货号：">
        <el-input v-model="localValue.productSn" />
      </el-form-item>
      <el-form-item label="商品售价：">
        <el-input v-model.number="localValue.price" type="number" />
      </el-form-item>
      <el-form-item label="市场价：">
        <el-input v-model.number="localValue.originalPrice" type="number" />
      </el-form-item>
      <el-form-item label="商品库存：">
        <el-input v-model.number="localValue.stock" type="number" />
      </el-form-item>
      <el-form-item label="计量单位：">
        <el-input v-model="localValue.unit" />
      </el-form-item>
      <el-form-item label="商品重量：">
        <el-input
          v-model.number="localValue.weight"
          type="number"
          style="width: 300px"
        />
        <span style="margin-left: 20px">克</span>
      </el-form-item>
      <el-form-item label="排序">
        <el-input v-model.number="localValue.sort" type="number" />
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary" size="medium" @click="handleNext">
          下一步，填写商品促销
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { ref, computed, watch, onMounted } from 'vue';
import { ProductCateService, BrandService } from '@/api/modules';
import type { ProductParam, ProductCategory, Brand } from '@/interface';

interface Props {
  modelValue: ProductParam;
  isEdit?: boolean;
}

interface SelectOption {
  label: string;
  value: number;
}

interface CascaderOption {
  label: string;
  value: number;
  children?: CascaderOption[];
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProductParam): void;
  (e: 'nextStep'): void;
}>();

const productInfoFormRef = ref<FormInstance>();
const hasEditCreated = ref(false);
const selectProductCateValue = ref<number[]>([]);
const productCateOptions = ref<CascaderOption[]>([]);
const brandOptions = ref<SelectOption[]>([]);

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
  subTitle: [{ required: true, message: '请输入商品副标题', trigger: 'blur' }],
  productCategoryId: [
    { required: true, message: '请选择商品分类', trigger: 'blur' },
  ],
  brandId: [{ required: true, message: '请选择商品品牌', trigger: 'blur' }],
  description: [{ required: true, message: '请输入商品介绍', trigger: 'blur' }],
};

// ==================== 本地数据副本 ====================
// 创建本地响应式副本，避免直接修改 props
const localValue = ref({ ...props.modelValue });

// 商品ID
const productId = computed(() => localValue.value.id);

// 监听商品ID变化（编辑模式）
watch(productId, (newValue) => {
  if (!props.isEdit) return;
  if (hasEditCreated.value) return;
  if (newValue === undefined || newValue == null || newValue === 0) return;
  handleEditCreated();
});

// Props → Local: 监听 props 变化，同步到本地副本
watch(
  () => props.modelValue,
  (newVal) => {
    localValue.value = { ...newVal };
  },
  { deep: true, immediate: false },
);

// Local → Parent: 监听本地副本变化，emit 更新到父组件
watch(
  localValue,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true },
);
// ====================================================

// 监听分类选择变化
watch(selectProductCateValue, (newValue) => {
  if (newValue != null && newValue.length === 2) {
    localValue.value.productCategoryId = newValue[1];
    localValue.value.productCategoryName = getCateNameById(newValue[1]);
  } else {
    localValue.value.productCategoryId = null;
    localValue.value.productCategoryName = '';
  }
});

// 处理编辑模式初始化
const handleEditCreated = () => {
  if (
    localValue.value.productCategoryId != null &&
    localValue.value.cateParentId != null
  ) {
    selectProductCateValue.value = [
      localValue.value.cateParentId,
      localValue.value.productCategoryId,
    ];
  }
  hasEditCreated.value = true;
};

// 获取商品分类列表
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

// 获取品牌列表
const getBrandList = async () => {
  try {
    const response = await BrandService.fetchList({
      pageNum: 1,
      pageSize: 100,
    });
    brandOptions.value = response.data.list.map((item: Brand) => ({
      label: item.name,
      value: item.id,
    }));
  } catch (error) {
    console.error('获取品牌列表失败:', error);
  }
};

// 根据ID获取分类名称
const getCateNameById = (id: number): string => {
  for (const cate of productCateOptions.value) {
    if (cate.children) {
      for (const child of cate.children) {
        if (child.value === id) {
          return child.label;
        }
      }
    }
  }
  return '';
};

// 下一步
const handleNext = async () => {
  if (!productInfoFormRef.value) return;

  try {
    await productInfoFormRef.value.validate();
    emit('nextStep');
  } catch (error) {
    ElMessage.error('验证失败');
  }
};

// 品牌变化
const handleBrandChange = (val: number) => {
  const brand = brandOptions.value.find((item) => item.value === val);
  if (brand) {
    localValue.value.brandName = brand.label;
  }
};

onMounted(() => {
  getProductCateList();
  getBrandList();
});
</script>

<style scoped>
.form-inner-container {
  max-width: 800px;
}
</style>
