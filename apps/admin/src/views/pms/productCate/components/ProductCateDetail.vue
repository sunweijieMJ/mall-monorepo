<!--
  商品分类详情表单组件
  支持添加和编辑两种模式
  包含筛选属性的动态配置
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-form
      ref="productCateFormRef"
      :model="productCate"
      :rules="rules"
      label-width="150px"
    >
      <el-form-item label="分类名称：" prop="name">
        <el-input v-model="productCate.name" placeholder="请输入分类名称" />
      </el-form-item>

      <el-form-item label="上级分类：">
        <el-select v-model="productCate.parentId" placeholder="请选择分类">
          <el-option
            v-for="item in selectProductCateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="数量单位：">
        <el-input
          v-model="productCate.productUnit"
          placeholder="例如：件、台"
        />
      </el-form-item>

      <el-form-item label="排序：">
        <el-input-number
          v-model="productCate.sort"
          :min="0"
          controls-position="right"
        />
      </el-form-item>

      <el-form-item label="是否显示：">
        <el-radio-group v-model="productCate.showStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="是否显示在导航栏：">
        <el-radio-group v-model="productCate.navStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="分类图标：">
        <SingleUpload v-model="productCate.icon" />
      </el-form-item>

      <!-- 动态筛选属性 -->
      <el-form-item
        v-for="(filterProductAttr, index) in filterProductAttrList"
        :key="filterProductAttr.key"
        :label="filterLabelFilter(index)"
      >
        <el-cascader
          v-model="filterProductAttr.value"
          clearable
          :options="filterAttrs"
          style="width: 300px"
        />
        <el-button
          style="margin-left: 20px"
          @click.prevent="removeFilterAttr(filterProductAttr)"
        >
          删除
        </el-button>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleAddFilterAttr">
          新增筛选属性
        </el-button>
      </el-form-item>

      <el-form-item label="关键词：">
        <el-input v-model="productCate.keywords" placeholder="用于SEO优化" />
      </el-form-item>

      <el-form-item label="分类描述：">
        <el-input
          v-model="productCate.description"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 8 }"
          placeholder="请输入分类描述"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button v-if="!isEdit" @click="resetForm">重置</el-button>
        <el-button @click="goBack">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  ProductCateService,
  ProductAttrCateService,
  ProductAttrService,
} from '@/api/modules';
import { SingleUpload } from '@/components';
import type { ProductCate } from '@/interface';

// Props
interface Props {
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEdit: false,
});

// Router
const router = useRouter();
const route = useRoute();

// 表单引用
const productCateFormRef = ref<FormInstance>();

// 默认分类数据
const defaultProductCate: Partial<ProductCate> = {
  description: '',
  icon: '',
  keywords: '',
  name: '',
  navStatus: 0,
  parentId: 0,
  productUnit: '',
  showStatus: 0,
  sort: 0,
  productAttributeIdList: [],
};

// 分类数据
const productCate = reactive<Partial<ProductCate>>({ ...defaultProductCate });

// 上级分类列表
const selectProductCateList = ref<ProductCate[]>([]);

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
};

// 筛选属性相关
interface FilterProductAttr {
  key: number;
  value: number[] | null;
}

interface FilterAttrOption {
  label: string;
  value: number;
  children?: FilterAttrOption[];
}

const filterAttrs = ref<FilterAttrOption[]>([]);
const filterProductAttrList = ref<FilterProductAttr[]>([
  { key: Date.now(), value: null },
]);

// 筛选属性标签过滤器
const filterLabelFilter = (index: number) => {
  return index === 0 ? '筛选属性：' : '';
};

// 获取上级分类列表
const getSelectProductCateList = async () => {
  try {
    const response = await ProductCateService.fetchList(0, {
      pageSize: 100,
      pageNum: 1,
    });
    selectProductCateList.value = response.data.list;
    selectProductCateList.value.unshift({
      id: 0,
      name: '无上级分类',
    } as ProductCate);
  } catch (error) {
    console.error('获取分类列表失败:', error);
  }
};

// 获取商品属性分类列表（用于筛选属性）
const getProductAttrCateList = async () => {
  try {
    const response = await ProductAttrCateService.fetchListWithAttr();
    const list = response.data;

    filterAttrs.value = list.map((productAttrCate) => {
      const children: FilterAttrOption[] = [];
      if (
        productAttrCate.productAttributeList &&
        productAttrCate.productAttributeList.length > 0
      ) {
        productAttrCate.productAttributeList.forEach((attr) => {
          children.push({
            label: attr.name!,
            value: attr.id!,
          });
        });
      }
      return {
        label: productAttrCate.name!,
        value: productAttrCate.id!,
        children,
      };
    });
  } catch (error) {
    console.error('获取属性分类列表失败:', error);
  }
};

// 获取选中的商品属性ID列表
const getProductAttributeIdList = (): number[] => {
  const productAttributeIdList: number[] = [];
  filterProductAttrList.value.forEach((item) => {
    if (item.value !== null && item.value.length === 2) {
      productAttributeIdList.push(item.value[1]);
    }
  });
  return productAttributeIdList;
};

// 提交表单
const onSubmit = async () => {
  if (!productCateFormRef.value) return;

  try {
    const valid = await productCateFormRef.value.validate();
    if (!valid) {
      ElMessage.error('验证失败');
      return false;
    }

    await ElMessageBox.confirm('是否提交数据', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 设置筛选属性ID列表
    productCate.productAttributeIdList = getProductAttributeIdList();

    if (props.isEdit) {
      // 编辑模式
      const id = Number(route.query.id);
      await ProductCateService.updateProductCate(
        id,
        productCate as ProductCate,
      );
      ElMessage.success('修改成功');
      router.back();
    } else {
      // 添加模式
      await ProductCateService.createProductCate(productCate as ProductCate);
      ElMessage.success('提交成功');
      resetForm();
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败:', error);
      ElMessage.error('提交失败');
    }
  }
};

// 重置表单
const resetForm = () => {
  productCateFormRef.value?.resetFields();
  Object.assign(productCate, defaultProductCate);
  filterProductAttrList.value = [{ key: Date.now(), value: null }];
  getSelectProductCateList();
};

// 返回
const goBack = () => {
  router.back();
};

// 删除筛选属性
const removeFilterAttr = (filterAttr: FilterProductAttr) => {
  if (filterProductAttrList.value.length === 1) {
    ElMessage.warning('至少要留一个');
    return;
  }
  const index = filterProductAttrList.value.indexOf(filterAttr);
  if (index !== -1) {
    filterProductAttrList.value.splice(index, 1);
  }
};

// 添加筛选属性
const handleAddFilterAttr = () => {
  if (filterProductAttrList.value.length === 3) {
    ElMessage.warning('最多添加三个');
    return;
  }
  filterProductAttrList.value.push({
    key: Date.now(),
    value: null,
  });
};

// 加载分类数据（编辑模式）
const loadProductCate = async () => {
  if (props.isEdit) {
    const id = Number(route.query.id);
    if (!id) {
      ElMessage.error('缺少分类ID');
      router.back();
      return;
    }

    try {
      // 加载分类基本信息
      const response = await ProductCateService.getProductCate(id);
      Object.assign(productCate, response.data);

      // 加载分类的筛选属性
      const attrResponse = await ProductAttrService.getProductAttrInfo(id);
      if (attrResponse.result && attrResponse.result.length > 0) {
        filterProductAttrList.value = [];
        attrResponse.result.forEach((attr, index) => {
          filterProductAttrList.value.push({
            key: Date.now() + index,
            value: [attr.attributeCategoryId!, attr.attributeId!],
          });
        });
      }
    } catch (error) {
      console.error('加载分类数据失败:', error);
      ElMessage.error('加载分类数据失败');
    }
  }
};

// 页面加载
onMounted(async () => {
  await getSelectProductCateList();
  await getProductAttrCateList();
  await loadProductCate();
});
</script>

<style scoped lang="scss">
.form-container {
  :deep(.el-form) {
    width: 600px;
  }

  :deep(.el-input-number) {
    width: 100%;
  }
}
</style>
