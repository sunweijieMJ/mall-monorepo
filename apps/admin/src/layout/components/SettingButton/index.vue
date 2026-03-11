<template>
  <div class="setting-button">
    <el-tooltip :content="$t('layout.settings')" placement="bottom">
      <el-button
        :icon="Setting"
        circle
        text
        size="small"
        class="setting-btn"
        @click="handleSettingClick"
      />
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

defineOptions({ name: 'SettingButton' });

const router = useRouter();

const handleSettingClick = () => {
  router.push('/setting');
};
</script>

<style scoped lang="scss">
.setting-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-btn {
  transition: all 0.3s ease;
  color: var(--colorTextSecondary);

  &:hover {
    transform: rotate(90deg);
    background-color: var(--colorPrimaryBg);
    color: var(--colorPrimary);
  }

  &:focus {
    background-color: var(--colorPrimaryBgHover);
    color: var(--colorPrimary);
  }

  // 图标样式
  :deep(.el-icon) {
    font-size: 24px;
  }
}
</style>
