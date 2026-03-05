<!--
  品牌详情表单组件
  支持添加和编辑两种模式
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-form
      ref="brandFormRef"
      :model="brand"
      :rules="rules"
      label-width="150px"
    >
      <el-form-item label="品牌名称：" prop="name">
        <el-input v-model="brand.name" placeholder="请输入品牌名称" />
      </el-form-item>

      <el-form-item label="品牌首字母：" prop="firstLetter">
        <el-input
          v-model="brand.firstLetter"
          placeholder="请输入品牌首字母"
          maxlength="1"
        />
      </el-form-item>

      <el-form-item label="品牌LOGO：" prop="logo">
        <SingleUpload v-model="brand.logo" />
      </el-form-item>

      <el-form-item label="品牌专区大图：">
        <SingleUpload v-model="brand.bigPic" />
      </el-form-item>

      <el-form-item label="品牌故事：">
        <el-input
          v-model="brand.brandStory"
          type="textarea"
          placeholder="请输入品牌故事"
          :autosize="{ minRows: 3, maxRows: 8 }"
        />
      </el-form-item>

      <el-form-item label="排序：" prop="sort">
        <el-input-number
          v-model="brand.sort"
          :min="0"
          controls-position="right"
        />
      </el-form-item>

      <el-form-item label="是否显示：">
        <el-radio-group v-model="brand.showStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="品牌制造商：">
        <el-radio-group v-model="brand.factoryStatus">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
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
import { BrandService } from '@/api/modules';
import { SingleUpload } from '@/components';
import type { Brand } from '@/interface';

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
const brandFormRef = ref<FormInstance>();

// 默认品牌数据
const defaultBrand: Partial<Brand> = {
  bigPic: '',
  brandStory: '',
  factoryStatus: 0,
  firstLetter: '',
  logo: '',
  name: '',
  showStatus: 0,
  sort: 0,
};

// 品牌数据
const brand = reactive<Partial<Brand>>({ ...defaultBrand });

// 表单验证规则
const rules: FormRules = {
  name: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
  logo: [{ required: true, message: '请上传品牌LOGO', trigger: 'change' }],
  sort: [{ type: 'number', message: '排序必须为数字', trigger: 'blur' }],
};

// 提交表单
const onSubmit = async () => {
  if (!brandFormRef.value) return;

  try {
    const valid = await brandFormRef.value.validate();
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
      await BrandService.updateBrand(id, brand as Brand);
      ElMessage.success('修改成功');
      router.back();
    } else {
      // 添加模式
      await BrandService.createBrand(brand as Brand);
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
  brandFormRef.value?.resetFields();
  Object.assign(brand, defaultBrand);
};

// 返回
const goBack = () => {
  router.back();
};

// 加载品牌数据（编辑模式）
const loadBrand = async () => {
  if (props.isEdit) {
    const id = Number(route.query.id);
    if (!id) {
      ElMessage.error('缺少品牌ID');
      router.back();
      return;
    }

    try {
      const response = await BrandService.getBrand(id);
      Object.assign(brand, response.data);
    } catch (error) {
      console.error('加载品牌数据失败:', error);
      ElMessage.error('加载品牌数据失败');
    }
  }
};

// 页面加载
onMounted(() => {
  loadBrand();
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
