<!--
  Mall 单图上传组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
  支持 OSS 和 MinIO 两种上传方式
-->
<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :data="useOss ? dataObj : undefined"
      list-type="picture"
      :multiple="false"
      :show-file-list="showFileList"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
    >
      <el-button type="primary">点击上传</el-button>
      <template #tip>
        <div class="el-upload__tip">只能上传jpg/png文件，且不超过10MB</div>
      </template>
    </el-upload>
    <el-dialog v-model="dialogVisible">
      <img
        v-if="fileList.length > 0"
        width="100%"
        :src="fileList[0].url"
        alt=""
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import type { UploadProps, UploadUserFile } from 'element-plus';
import { ref, computed } from 'vue';
import { OssService } from '@/api/modules';

interface Props {
  modelValue?: string;
  useOss?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  useOss: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// OSS 上传配置
const dataObj = ref({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
});

const dialogVisible = ref(false);
const OSS_UPLOAD_URL = 'http://macro-oss.oss-cn-shenzhen.aliyuncs.com';
const MINIO_UPLOAD_URL = 'http://localhost:8080/minio/upload';

// 上传地址
const uploadUrl = computed(() => {
  return props.useOss ? OSS_UPLOAD_URL : MINIO_UPLOAD_URL;
});

// 图片 URL
const imageUrl = computed(() => props.modelValue);

// 图片名称
const imageName = computed(() => {
  if (props.modelValue) {
    return props.modelValue.substring(props.modelValue.lastIndexOf('/') + 1);
  }
  return null;
});

// 文件列表
const fileList = computed<UploadUserFile[]>(() => {
  if (!imageName.value || !imageUrl.value) return [];
  return [
    {
      name: imageName.value,
      url: imageUrl.value,
    },
  ];
});

// 是否显示文件列表
const showFileList = computed(() => {
  return !!props.modelValue;
});

// 删除文件
const handleRemove: UploadProps['onRemove'] = () => {
  emit('update:modelValue', '');
};

// 预览图片
const handlePreview: UploadProps['onPreview'] = () => {
  dialogVisible.value = true;
};

// 上传前处理
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  // 验证文件类型
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!');
    return false;
  }

  // 验证文件大小
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!');
    return false;
  }

  // 如果不使用 OSS，直接返回
  if (!props.useOss) {
    return true;
  }

  // 使用 OSS，需要获取上传策略
  try {
    const response = await OssService.policy();
    if (!response || !response.data) {
      ElMessage.error('获取上传策略失败：响应数据为空');
      return false;
    }
    const policy = response.data;
    dataObj.value = {
      policy: policy.policy,
      signature: policy.signature,
      ossaccessKeyId: policy.accessKeyId,
      key: policy.dir + '/${filename}',
      dir: policy.dir,
      host: policy.host,
    };
    return true;
  } catch (error) {
    console.error('获取上传策略失败:', error);
    ElMessage.error('获取上传策略失败');
    return false;
  }
};

// 上传成功回调
const handleUploadSuccess: UploadProps['onSuccess'] = (res: any, file) => {
  let url: string;

  if (props.useOss) {
    // 使用 OSS，拼接完整URL
    url = `${dataObj.value.host}/${dataObj.value.dir}/${file.name}`;
  } else {
    // 使用 MinIO，从响应中获取 URL
    url = res?.data?.url || res?.url || '';
  }

  if (!url) {
    ElMessage.error('上传失败：未获取到文件URL');
    return;
  }

  emit('update:modelValue', url);
  ElMessage.success('上传成功');
};
</script>

<style scoped>
.el-upload__tip {
  margin-top: 7px;
  color: #606266;
  font-size: 12px;
}
</style>
