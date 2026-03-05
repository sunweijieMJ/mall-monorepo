<!--
  Mall 多图上传组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
  支持 OSS 和 MinIO 两种上传方式
-->
<template>
  <div>
    <el-upload
      :action="uploadUrl"
      :data="useOss ? dataObj : undefined"
      list-type="picture-card"
      :file-list="fileList"
      :before-upload="beforeUpload"
      :on-remove="handleRemove"
      :on-success="handleUploadSuccess"
      :on-preview="handlePreview"
      :limit="maxCount"
      :on-exceed="handleExceed"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
    <el-dialog v-model="dialogVisible">
      <img v-if="dialogImageUrl" width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadProps, UploadUserFile, UploadFile } from 'element-plus';
import { ref, computed } from 'vue';
import { OssService } from '@/api/modules';

interface Props {
  modelValue?: string[];
  maxCount?: number;
  useOss?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  maxCount: 5,
  useOss: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
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
const dialogImageUrl = ref<string>('');
const OSS_UPLOAD_URL = 'http://macro-oss.oss-cn-shenzhen.aliyuncs.com';
const MINIO_UPLOAD_URL = 'http://localhost:8080/minio/upload';

// 上传地址
const uploadUrl = computed(() => {
  return props.useOss ? OSS_UPLOAD_URL : MINIO_UPLOAD_URL;
});

// 文件列表
const fileList = computed<UploadUserFile[]>(() => {
  return (props.modelValue || []).map((url) => ({ url }));
});

// 删除文件
const handleRemove: UploadProps['onRemove'] = (file, fileList) => {
  const urls = fileList.map((item) => item.url).filter(Boolean) as string[];
  emit('update:modelValue', urls);
};

// 预览图片
const handlePreview: UploadProps['onPreview'] = (file) => {
  dialogVisible.value = true;
  dialogImageUrl.value = file.url || '';
};

// 超出限制
const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多只能上传 ${props.maxCount} 张图片`);
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
const handleUploadSuccess: UploadProps['onSuccess'] = (
  res: any,
  file,
  fileList,
) => {
  let url: string;

  if (props.useOss) {
    // 使用 OSS，拼接完整URL
    url = `${dataObj.value.host}/${dataObj.value.dir}/${file.name}`;
  } else {
    // 使用 MinIO，从响应中获取 URL
    url = res.data?.url || res.data?.url || '';
  }

  // 获取所有已上传的文件 URL
  const urls = fileList.map((item) => item.url).filter(Boolean) as string[];

  // 替换最后一个 URL（刚上传的）
  urls[urls.length - 1] = url;

  emit('update:modelValue', urls);
  ElMessage.success('上传成功');
};
</script>

<style scoped>
:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 148px;
  height: 148px;
}

:deep(.el-upload--picture-card) {
  width: 148px;
  height: 148px;
  line-height: 148px;
}
</style>
