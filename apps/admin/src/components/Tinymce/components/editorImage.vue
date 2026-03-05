<!--
  Tinymce 编辑器图片上传组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div class="upload-container">
    <el-button
      :icon="Upload"
      :style="{ background: color, borderColor: color }"
      type="primary"
      @click="dialogVisible = true"
    >
      上传图片
    </el-button>
    <el-dialog v-model="dialogVisible" title="上传图片" append-to-body>
      <el-upload
        class="editor-slide-upload"
        :action="uploadUrl"
        :data="useOss ? dataObj : undefined"
        :multiple="true"
        :file-list="fileList"
        :show-file-list="true"
        list-type="picture-card"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
        :before-upload="beforeUpload"
      >
        <el-button type="primary">点击上传</el-button>
      </el-upload>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Upload } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import type { UploadProps, UploadUserFile } from 'element-plus';
import { ref, computed } from 'vue';
import { OssService } from '@/api/modules';

interface Props {
  color?: string;
  useOss?: boolean;
}

interface UploadedFile {
  uid: string | number;
  url: string;
  hasSuccess: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: '#1890ff',
  useOss: false,
});

const emit = defineEmits<{
  (e: 'successCBK', files: UploadedFile[]): void;
}>();

const dialogVisible = ref(false);
const listObj = ref<Record<string, UploadedFile>>({});
const fileList = ref<UploadUserFile[]>([]);

// OSS 上传配置
const dataObj = ref({
  policy: '',
  signature: '',
  key: '',
  ossaccessKeyId: '',
  dir: '',
  host: '',
});

const OSS_UPLOAD_URL = 'http://macro-oss.oss-cn-shenzhen.aliyuncs.com';
const MINIO_UPLOAD_URL = 'http://localhost:8080/minio/upload';

// 上传地址
const uploadUrl = computed(() => {
  return props.useOss ? OSS_UPLOAD_URL : MINIO_UPLOAD_URL;
});

// 检查所有文件是否上传成功
const checkAllSuccess = () => {
  return Object.keys(listObj.value).every(
    (key) => listObj.value[key].hasSuccess,
  );
};

// 提交已上传的图片
const handleSubmit = () => {
  if (!checkAllSuccess()) {
    ElMessage.warning('请等待所有图片上传成功');
    return;
  }

  const arr = Object.values(listObj.value);
  emit('successCBK', arr);

  // 重置
  listObj.value = {};
  fileList.value = [];
  dialogVisible.value = false;
};

// 上传成功回调
const handleSuccess: UploadProps['onSuccess'] = (response: any, file) => {
  const uid = file.uid;

  // 查找对应的文件对象
  for (const key in listObj.value) {
    if (listObj.value[key].uid === uid) {
      if (props.useOss) {
        // OSS 上传，拼接完整URL
        listObj.value[key].url =
          `${dataObj.value.host}/${dataObj.value.dir}/${file.name}`;
      } else {
        // MinIO 上传，从响应获取URL
        listObj.value[key].url = response?.data?.url || response?.url || '';
        if (!listObj.value[key].url) {
          ElMessage.error('上传失败：未获取到文件URL');
          return;
        }
      }
      listObj.value[key].hasSuccess = true;
      break;
    }
  }
};

// 删除文件
const handleRemove: UploadProps['onRemove'] = (file) => {
  const uid = file.uid;

  for (const key in listObj.value) {
    if (listObj.value[key].uid === uid) {
      delete listObj.value[key];
      break;
    }
  }
};

// 上传前处理
const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
  const fileName = String(file.uid);

  // 初始化文件对象
  listObj.value[fileName] = {
    hasSuccess: false,
    uid: file.uid,
    url: '',
  };

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
</script>

<style scoped lang="scss">
.upload-container {
  .editor-slide-upload {
    margin-bottom: 20px;
  }
}
</style>
