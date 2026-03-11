<template>
  <el-dropdown @command="handleCommand">
    <div class="user-info">
      <el-avatar :size="32" :src="userStore.avatar || undefined">
        <el-icon><User /></el-icon>
      </el-avatar>
      <span class="username">{{ userStore.name || $t('layout.admin') }}</span>
      <el-icon class="arrow-icon"><ArrowDown /></el-icon>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="logout">
          <el-icon><SwitchButton /></el-icon>
          {{ $t('layout.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { User, ArrowDown, SwitchButton } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useMallUserStore } from '@/store';

const router = useRouter();
const userStore = useMallUserStore();
const { t: $t } = useI18n();

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await ElMessageBox.confirm($t('layout.logoutConfirm'))
      .then(async () => {
        await userStore.logoutAction();
        ElMessage.success($t('layout.logoutSuccess'));
        router.push('/login');
      })
      .catch(() => {});
  }
};
</script>

<style scoped lang="scss">
.user-info {
  display: flex;
  align-items: center;
  padding: 5px 10px;
  transition: background-color 0.2s;
  border-radius: 6px;
  cursor: pointer;
  gap: 6px;

  &:focus-visible {
    outline: none;
  }

  &:hover {
    background-color: var(--controlItemBgHover);

    .arrow-icon {
      transform: rotate(180deg);
    }
  }
}

.username {
  max-width: 120px;
  overflow: hidden;
  color: var(--colorText);
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow-icon {
  transition: transform 0.3s;
  color: var(--colorTextSecondary);
  font-size: 12px;
}
</style>
