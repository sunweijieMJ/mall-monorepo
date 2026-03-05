<template>
  <view class="upload-content">
    <block v-for="(item, index) in imageList" :key="index">
      <view class="upload-item">
        <image
          class="upload-img"
          :src="item.filePath"
          mode="aspectFill"
          @click="previewImage(index)"
        ></image>
        <image
          class="upload-del-btn"
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAYAAACoPemuAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RjNBODgzQjUwNDM5MTFFOUJDMjlGN0UwRTJGMjVCNjQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RjNBODgzQjYwNDM5MTFFOUJDMjlGN0UwRTJGMjVCNjQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpGM0E4ODNCMzA0MzkxMUU5QkMyOUY3RTBFMkYyNUI2NCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGM0E4ODNCNDA0MzkxMUU5QkMyOUY3RTBFMkYyNUI2NCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PuYQTIAAAAHNSURBVHjazJgxasMwFIbjnsD4BDmCLxDQDZrNQ5bcILlBvXvpDRLIWmiHFkyH2t0LyVbwEkPpbE/eYlUCGYQax096UuIffkIgij7ryU/vyZuYy2e+Z56K70R8lsJcOfPn5AriMCvmZ2YKdMW8EQ/hRA9iEorwXlpZtObMRySQ6kysvrFWloHUEIcmUBuHUDLccmxQskErt7wyVLdy00tQ4Q2g5De2V9kNwWjffiNDA33f/42i6E13Qj5uNptlwJD+SyODuaqqqi/KVBTFOxSKA7VtW/NxSZI8AcbE2nuraZpvKgSBk6G4drsdBOwogz1CwAghH/JEl+BUKJ1VltPHHjoIAoeE4l53YFqb+RKcBSgqyqXhtxEKZwkKB3YOThYCqjPuCDoHZwGK3mGLtdPp5LmqTI1Dqe4p26EkNqA4iE6eg2z+iQ0okyQMATvYgLIIt9Y6knTyFBIudHqIq3BpmkL60VJ9O0sXZY8MBwSLtdNGEAQ/i8XiVXcz83EcEPDbuq/fzMdYWt+6GTmMsX2rh9q3TtsxNrzXhKt1rwg6rR1Dhdjqo7QMlWOvoWTF4imxQMRF7eaL8L5ohmwrLgDB8pCQc8DlcG7y538CDABJNGPqfaJgfgAAAABJRU5ErkJggg=="
          mode="scaleToFill"
          @click="delImage(index)"
        >
        </image>
        <view v-if="item.progress < 100" class="upload-progress"
          >{{ item.progress }}%</view
        >
      </view>
    </block>
    <view
      v-if="rduLength > 0"
      class="upload-add-btn"
      @click="chooseImage"
    ></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

/**
 * 图片上传组件
 * 支持多图上传、进度显示、预览、删除
 */

/** 图片项接口 */
interface ImageItem {
  filePath: string;
  progress: number;
  src?: string;
}

/** Props定义 */
interface Props {
  /** 上传接口地址 */
  url?: string;
  /** 单次可选择的图片数量 */
  count?: number;
  /** 可上传总数量 */
  length?: number;
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  count: 4,
  length: 50,
});

/** 图片列表 */
const imageList = ref<ImageItem[]>([]);
/** 上传任务 */
let uploadTask: UniApp.UploadTask | null = null;

/**
 * 剩余可上传数量
 */
const rduLength = computed(() => {
  return props.length - imageList.value.length;
});

/**
 * 选择图片
 */
const chooseImage = () => {
  uni.chooseImage({
    count: rduLength.value < props.count ? rduLength.value : props.count,
    sizeType: ['original', 'compressed'],
    sourceType: ['album'],
    success: (res) => {
      const images = res.tempFilePaths;
      uploadFiles(images);
    },
  });
};

/**
 * 上传图片
 */
const uploadFiles = async (images: string[]) => {
  imageList.value.push({
    filePath: images[0],
    progress: 0,
  });
  uni.showLoading({
    title: '请稍后..',
    mask: true,
  });

  try {
    const uploadUrl = await uploadImage(images[0]);

    if (uploadUrl !== false) {
      images.splice(0, 1);
      imageList.value[imageList.value.length - 1].src = uploadUrl;

      // 判断是否需要继续上传
      if (images.length > 0 && rduLength.value > 0) {
        uploadFiles(images);
      } else {
        uni.hideLoading();
      }
    } else {
      // 上传失败处理
      imageList.value.pop();
      uni.hideLoading();
      uni.showToast({
        title: '上传中出现问题，已终止上传',
        icon: 'none',
        mask: true,
        duration: 2000,
      });
    }
  } catch (err) {
    console.error('上传失败:', err);
    imageList.value.pop();
    uni.hideLoading();
    uni.showToast({
      title: '上传失败',
      icon: 'none',
    });
  }
};

/**
 * 上传单张图片
 */
const uploadImage = (file: string): Promise<string | false> => {
  return new Promise((resolve, reject) => {
    // 发送给后端的附加参数
    const formData = {
      thumb_mode: 1,
    };
    uploadTask = uni.uploadFile({
      url: props.url,
      filePath: file,
      name: 'file',
      formData: formData,
      success(uploadFileResult) {
        const uploadFileRes = JSON.parse(uploadFileResult.data) || {};
        if (uploadFileRes.status === 1 && uploadFileRes.data) {
          resolve(uploadFileRes.data);
        } else {
          reject('接口返回错误');
        }
      },
      fail() {
        reject('网络链接错误');
      },
    });
    // 上传进度
    uploadTask.onProgressUpdate((progressRes) => {
      imageList.value[imageList.value.length - 1].progress =
        progressRes.progress;
    });
  });
};

/**
 * 删除图片
 */
const delImage = (index: number) => {
  uni.showModal({
    content: '确定要放弃这张图片么？',
    success: (confirmRes) => {
      if (confirmRes.confirm) {
        imageList.value.splice(index, 1);
      }
    },
  });
};

/**
 * 预览图片
 */
const previewImage = (index: number) => {
  const urls: string[] = [];
  imageList.value.forEach((item) => {
    urls.push(item.filePath);
  });
  uni.previewImage({
    current: urls[index],
    urls: urls,
    indicator: 'number',
  });
};
</script>

<style lang="scss" scoped>
.upload-content {
  padding: 24upx 0 0 28upx;
  overflow: hidden;
  background-color: #fff;
}

.upload-item {
  position: relative;
  width: 150upx;
  height: 150upx;
  margin-right: 30upx;
  margin-bottom: 30upx;
  float: left;

  &:nth-child(4n) {
    margin-right: 0;
  }

  .upload-img {
    width: 100%;
    height: 100%;
    border-radius: 8upx;
  }

  .upload-del-btn {
    position: absolute;
    top: -14upx;
    right: -16upx;
    width: 36upx;
    height: 36upx;
    border: 4upx solid #fff;
    border-radius: 100px;
  }

  .upload-progress {
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 8upx;
    background-color: rgba(0, 0, 0, 0.4);
    color: #fff;
    font-size: 24upx;
  }
}

.upload-add-btn {
  position: relative;
  z-index: 99;
  width: 150upx;
  height: 150upx;
  float: left;
  border-radius: 8upx;
  background: #f9f9f9;

  &::before,
  &::after {
    content: ' ';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 4upx;
    height: 60upx;
    transform: translate(-50%, -50%);
    background-color: #d6d6d6;
  }

  &::after {
    width: 60upx;
    height: 4upx;
  }

  &:active {
    background-color: #f7f7f7;
  }
}
</style>
