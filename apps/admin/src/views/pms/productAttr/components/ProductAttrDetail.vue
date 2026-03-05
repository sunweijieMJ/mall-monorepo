<!--
  商品属性详情表单组件
  支持添加和编辑两种模式
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-form
      ref="productAttrFormRef"
      :model="productAttr"
      :rules="rules"
      label-width="150px"
    >
      <el-form-item label="属性名称：" prop="name">
        <el-input v-model="productAttr.name" placeholder="请输入属性名称" />
      </el-form-item>

      <el-form-item label="商品类型：">
        <el-select
          v-model="productAttr.productAttributeCategoryId"
          placeholder="请选择"
        >
          <el-option
            v-for="item in productAttrCateList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="分类筛选样式：">
        <el-radio-group v-model="productAttr.filterType">
          <el-radio :label="0">普通</el-radio>
          <el-radio :label="1">颜色</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="能否进行检索：">
        <el-radio-group v-model="productAttr.searchType">
          <el-radio :label="0">不需要检索</el-radio>
          <el-radio :label="1">关键字检索</el-radio>
          <el-radio :label="2">范围检索</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="商品属性关联：">
        <el-radio-group v-model="productAttr.relatedStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="属性是否可选：">
        <el-radio-group v-model="productAttr.selectType">
          <el-radio :label="0">唯一</el-radio>
          <el-radio :label="1">单选</el-radio>
          <el-radio :label="2">复选</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="属性值的录入方式：">
        <el-radio-group v-model="productAttr.inputType">
          <el-radio :label="0">手工录入</el-radio>
          <el-radio :label="1">从下面列表中选择</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="属性值可选值列表：">
        <el-input
          v-model="inputListFormat"
          :autosize="{ minRows: 3, maxRows: 8 }"
          type="textarea"
          placeholder="每行一个值"
        />
      </el-form-item>

      <el-form-item label="是否支持手动新增：">
        <el-radio-group v-model="productAttr.handAddStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="排序属性：">
        <el-input-number
          v-model="productAttr.sort"
          :min="0"
          controls-position="right"
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
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ProductAttrCateService, ProductAttrService } from '@/api/modules';
import type { ProductAttr, ProductAttrCate } from '@/interface';

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
const productAttrFormRef = ref<FormInstance>();

// 默认属性数据
const defaultProductAttr: Partial<ProductAttr> = {
  filterType: 0,
  handAddStatus: 0,
  inputList: '',
  inputType: 0,
  name: '',
  productAttributeCategoryId: 0,
  relatedStatus: 0,
  searchType: 0,
  selectType: 0,
  sort: 0,
  type: 0,
};

// 属性数据
const productAttr = reactive<Partial<ProductAttr>>({ ...defaultProductAttr });

// 属性类型列表
const productAttrCateList = ref<ProductAttrCate[]>([]);

// 输入列表格式化（换行符转逗号）
const inputListFormat = ref('');

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入属性名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
};

// 监听输入列表格式变化
watch(inputListFormat, (newValue) => {
  productAttr.inputList = newValue.replace(/\n/g, ',');
});

// 获取属性类型列表
const getCateList = async () => {
  try {
    const response = await ProductAttrCateService.fetchList({
      pageNum: 1,
      pageSize: 100,
    });
    productAttrCateList.value = response.data.list;
  } catch (error) {
    console.error('获取属性类型列表失败:', error);
  }
};

// 重置属性数据
const resetProductAttr = () => {
  Object.assign(productAttr, defaultProductAttr);
  productAttr.productAttributeCategoryId = Number(route.query.cid);
  productAttr.type = Number(route.query.type);
  inputListFormat.value = '';
};

// 提交表单
const onSubmit = async () => {
  if (!productAttrFormRef.value) return;

  try {
    const valid = await productAttrFormRef.value.validate();
    if (!valid) {
      ElMessage.error('验证失败');
      return false;
    }

    await ElMessageBox.confirm('是否提交数据', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    if (props.isEdit) {
      // 编辑模式
      const id = Number(route.query.id);
      await ProductAttrService.updateProductAttr(
        id,
        productAttr as ProductAttr,
      );
      ElMessage.success('修改成功');
      router.back();
    } else {
      // 添加模式
      await ProductAttrService.createProductAttr(productAttr as ProductAttr);
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
  productAttrFormRef.value?.resetFields();
  resetProductAttr();
};

// 返回
const goBack = () => {
  router.back();
};

// 加载属性数据（编辑模式）
const loadProductAttr = async () => {
  if (props.isEdit) {
    const id = Number(route.query.id);
    if (!id) {
      ElMessage.error('缺少属性ID');
      router.back();
      return;
    }

    try {
      const response = await ProductAttrService.getProductAttr(id);
      Object.assign(productAttr, response.data);
      // 将逗号分隔的列表转换为换行格式
      inputListFormat.value = productAttr.inputList
        ? productAttr.inputList.replace(/,/g, '\n')
        : '';
    } catch (error) {
      console.error('加载属性数据失败:', error);
      ElMessage.error('加载属性数据失败');
    }
  } else {
    resetProductAttr();
  }
};

// 页面加载
onMounted(async () => {
  await getCateList();
  await loadProductAttr();
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
