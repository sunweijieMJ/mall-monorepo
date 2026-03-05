<template>
  <div class="error-boundary">
    <!-- 错误边界UI -->
    <div v-if="hasError" class="error-boundary-fallback">
      <div class="error-content">
        <el-icon class="error-icon" :size="64">
          <WarningFilled />
        </el-icon>
        <h3 class="error-title">{{ props.errorTitle }}</h3>
        <p class="error-message">{{ props.errorMessage }}</p>
        <div class="error-actions">
          <el-button type="primary" @click="handleRetry">{{
            props.retryText
          }}</el-button>
          <el-button v-if="props.showHomeButton" @click="handleGoHome">{{
            props.homeText
          }}</el-button>
        </div>

        <!-- 开发环境显示错误详情 -->
        <div
          v-if="isDev && errorDetails && props.showDetails"
          class="error-details"
        >
          <el-collapse>
            <el-collapse-item title="错误详情" name="details">
              <div class="error-stack-wrapper">
                <div class="error-stack-header">
                  <span>错误堆栈</span>
                  <el-button text @click="copyErrorDetails">复制</el-button>
                </div>
                <pre class="error-stack">{{ errorDetails }}</pre>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <!-- 正常内容 -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue';
import {
  ElButton,
  ElIcon,
  ElCollapse,
  ElCollapseItem,
  ElMessage,
} from 'element-plus';
import { ref, onErrorCaptured, computed, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

/**
 * 组件属性
 */
interface Props {
  /** 错误标题 */
  errorTitle?: string;
  /** 错误消息 */
  errorMessage?: string;
  /** 重试按钮文本 */
  retryText?: string;
  /** 首页按钮文本 */
  homeText?: string;
  /** 是否显示首页按钮 */
  showHomeButton?: boolean;
  /** 是否显示错误详情（仅开发环境） */
  showDetails?: boolean;
  /** 是否自动重试 */
  autoRetry?: boolean;
  /** 自动重试延迟（毫秒） */
  autoRetryDelay?: number;
  /** 自定义重试逻辑 */
  onRetry?: () => void;
  /** 自定义错误处理 */
  onError?: (error: Error, errorInfo: any) => void;
}

/**
 * 组件事件
 */
interface Emits {
  (e: 'error', error: Error, errorInfo: any): void;
  (e: 'retry'): void;
}

const props = withDefaults(defineProps<Props>(), {
  errorTitle: '页面出现错误',
  errorMessage: '抱歉，页面遇到了一些问题。请尝试刷新页面或返回首页。',
  retryText: '重试',
  homeText: '返回首页',
  showHomeButton: true,
  showDetails: true,
  autoRetry: false,
  autoRetryDelay: 3000,
  onRetry: undefined,
  onError: undefined,
});

const emit = defineEmits<Emits>();
const router = useRouter();

// 组件状态
const hasError = ref(false);
const errorDetails = ref('');
const retryTimer = ref<number | null>(null);

// 是否为开发环境
const isDev = computed(() => import.meta.env.DEV);

/**
 * 错误边界处理
 */
onErrorCaptured((error: Error, instance, errorInfo) => {
  console.error('ErrorBoundary caught error:', error);

  hasError.value = true;

  // 构建错误详情
  errorDetails.value = `${error.stack}\n\nComponent: ${instance?.$?.type?.name || 'Unknown'}\nError Info: ${errorInfo}`;

  // 调用自定义错误处理
  if (props.onError) {
    props.onError(error, errorInfo);
  }

  emit('error', error, errorInfo);

  // 自动重试
  if (props.autoRetry && props.autoRetryDelay > 0) {
    retryTimer.value = window.setTimeout(() => {
      handleRetry();
    }, props.autoRetryDelay);
  }

  return false; // 阻止错误向上传播
});

/**
 * 重试处理
 */
const handleRetry = () => {
  // 清除自动重试定时器
  if (retryTimer.value !== null) {
    clearTimeout(retryTimer.value);
    retryTimer.value = null;
  }

  hasError.value = false;
  errorDetails.value = '';

  if (props.onRetry) {
    props.onRetry();
  } else {
    // 默认重新加载页面
    window.location.reload();
  }

  emit('retry');
};

/**
 * 返回首页
 */
const handleGoHome = () => {
  hasError.value = false;
  errorDetails.value = '';
  router.push('/');
};

/**
 * 复制错误详情
 */
const copyErrorDetails = async () => {
  try {
    await navigator.clipboard.writeText(errorDetails.value);
    ElMessage.success('错误详情已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

/**
 * 组件卸载清理
 */
onUnmounted(() => {
  // 清理自动重试定时器
  if (retryTimer.value !== null) {
    clearTimeout(retryTimer.value);
    retryTimer.value = null;
  }
});

// 暴露方法给父组件
defineExpose({
  handleRetry,
  hasError,
});
</script>

<style scoped lang="scss">
.error-boundary {
  display: contents; // 不影响布局
}

.error-boundary-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 20px;
}

.error-content {
  max-width: 600px;
  text-align: center;
}

.error-icon {
  margin-bottom: 24px;
  color: var(--el-color-warning);
}

.error-title {
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-size: 24px;
  font-weight: 500;
}

.error-message {
  margin-bottom: 32px;
  color: var(--el-text-color-regular);
  font-size: 16px;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
}

.error-details {
  margin-top: 32px;
  text-align: left;
}

.error-stack-wrapper {
  .error-stack-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    span {
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  .error-stack {
    padding: 16px;
    overflow-x: auto;
    border-radius: 4px;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.6;
    word-break: break-all;
    white-space: pre-wrap;
  }
}
</style>
