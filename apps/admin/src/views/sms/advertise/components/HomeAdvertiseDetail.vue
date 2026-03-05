<!--
  首页广告详情表单组件
-->
<template>
  <el-card class="form-container" shadow="never">
    <el-form
      ref="homeAdvertiseFormRef"
      :model="homeAdvertise"
      :rules="rules"
      label-width="150px"
    >
      <el-form-item label="广告名称：" prop="name">
        <el-input v-model="homeAdvertise.name" class="input-width" />
      </el-form-item>
      <el-form-item label="广告位置：">
        <el-select v-model="homeAdvertise.type">
          <el-option
            v-for="type in typeOptions"
            :key="type.value"
            :label="type.label"
            :value="type.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间：" prop="startTime">
        <el-date-picker
          v-model="homeAdvertise.startTime"
          type="datetime"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="到期时间：" prop="endTime">
        <el-date-picker
          v-model="homeAdvertise.endTime"
          type="datetime"
          placeholder="选择日期"
        />
      </el-form-item>
      <el-form-item label="上线/下线：">
        <el-radio-group v-model="homeAdvertise.status">
          <el-radio :value="0">下线</el-radio>
          <el-radio :value="1">上线</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="广告图片：" prop="pic">
        <SingleUpload v-model="homeAdvertise.pic" />
      </el-form-item>
      <el-form-item label="排序：">
        <el-input-number
          v-model="homeAdvertise.sort"
          class="input-width"
          :min="0"
        />
      </el-form-item>
      <el-form-item label="广告链接：" prop="url">
        <el-input v-model="homeAdvertise.url" class="input-width" />
      </el-form-item>
      <el-form-item label="广告备注：">
        <el-input
          v-model="homeAdvertise.note"
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
  type FormInstance,
  type FormRules,
} from 'element-plus';
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { HomeAdvertiseService } from '@/api/modules';
import SingleUpload from '@/components/Upload/SingleUpload.vue';
import type { HomeAdvertise } from '@/interface';

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const route = useRoute();

const homeAdvertiseFormRef = ref<FormInstance>();

const defaultHomeAdvertise: Partial<HomeAdvertise> = {
  name: '',
  type: 1,
  pic: '',
  startTime: '',
  endTime: '',
  status: 0,
  url: '',
  note: '',
  sort: 0,
};

const homeAdvertise = reactive<Partial<HomeAdvertise>>({
  ...defaultHomeAdvertise,
});

const typeOptions = [
  { label: 'PC首页轮播', value: 0 },
  { label: 'APP首页轮播', value: 1 },
];

const rules: FormRules = {
  name: [
    { required: true, message: '请输入广告名称', trigger: 'blur' },
    { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' },
  ],
  url: [{ required: true, message: '请输入广告链接', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'blur' }],
  endTime: [{ required: true, message: '请选择到期时间', trigger: 'blur' }],
  pic: [{ required: true, message: '请选择广告图片', trigger: 'blur' }],
};

const loadHomeAdvertise = async () => {
  if (props.isEdit) {
    const id = Number(route.query.id);
    try {
      const response = await HomeAdvertiseService.getHomeAdvertise(id);
      Object.assign(homeAdvertise, response.data);
    } catch (error) {
      console.error('加载广告数据失败:', error);
      ElMessage.error('加载广告数据失败');
    }
  } else {
    Object.assign(homeAdvertise, defaultHomeAdvertise);
  }
};

const onSubmit = async () => {
  if (!homeAdvertiseFormRef.value) return;

  try {
    const valid = await homeAdvertiseFormRef.value.validate();
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
      const id = Number(route.query.id);
      await HomeAdvertiseService.updateHomeAdvertise(
        id,
        homeAdvertise as HomeAdvertise,
      );
      ElMessage.success('修改成功');
      router.back();
    } else {
      await HomeAdvertiseService.createHomeAdvertise(
        homeAdvertise as HomeAdvertise,
      );
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

const resetForm = () => {
  homeAdvertiseFormRef.value?.resetFields();
  Object.assign(homeAdvertise, defaultHomeAdvertise);
};

onMounted(() => {
  loadHomeAdvertise();
});
</script>

<style scoped lang="scss">
.form-container {
  padding: 20px;
}

.input-width {
  width: 70%;
}
</style>
