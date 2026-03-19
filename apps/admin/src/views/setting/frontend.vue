<!--
  前端配置页面
  草稿模式：本地修改，点击保存后才写入 store
-->
<template>
  <div class="frontend-setting">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>前端配置</span>
          <div class="actions">
            <el-button type="danger" plain size="small" @click="handleReset">
              恢复默认
            </el-button>
            <el-button
              type="primary"
              size="small"
              :disabled="!isDirty"
              :loading="saving"
              @click="handleSave"
            >
              保存配置
            </el-button>
          </div>
        </div>
      </template>

      <ConfigEditor
        :schema="siteConfigSchema"
        :model-value="draft"
        @update:model-value="
          draft = $event as Record<string, Record<string, unknown>>
        "
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus';
import { ref, computed, onMounted } from 'vue';
import ConfigEditor from '@/components/ConfigEditor/index.vue';
import { siteConfigSchema, type SiteConfig } from '@/constants/siteConfig';
import { useSiteConfigStore } from '@/store/modules/siteConfig';

const siteConfigStore = useSiteConfigStore();

// 草稿：从 store 的合并配置初始化
const draft = ref<Record<string, Record<string, unknown>>>(
  JSON.parse(JSON.stringify(siteConfigStore.savedConfig)) as Record<
    string,
    Record<string, unknown>
  >,
);

onMounted(async () => {
  await siteConfigStore.load();
  draft.value = JSON.parse(
    JSON.stringify(siteConfigStore.savedConfig),
  ) as Record<string, Record<string, unknown>>;
});

// 是否有未保存的修改
const isDirty = computed(
  () =>
    JSON.stringify(draft.value) !== JSON.stringify(siteConfigStore.savedConfig),
);

const saving = ref(false);

/**
 * 保存配置到 store
 */
async function handleSave() {
  saving.value = true;
  try {
    await siteConfigStore.save(draft.value as unknown as Partial<SiteConfig>);
    ElMessage.success('配置已保存');
  } finally {
    saving.value = false;
  }
}

/**
 * 恢复默认配置（二次确认）
 */
async function handleReset() {
  try {
    await ElMessageBox.confirm(
      '确定要恢复默认配置吗？当前修改将会丢失。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );
    await siteConfigStore.reset();
    // 同步草稿到重置后的默认值
    draft.value = JSON.parse(
      JSON.stringify(siteConfigStore.savedConfig),
    ) as Record<string, Record<string, unknown>>;
    ElMessage.success('已恢复默认配置');
  } catch {
    // 用户取消，不做任何操作
  }
}
</script>

<style lang="scss" scoped>
.frontend-setting {
  box-sizing: border-box;
  height: 100%;
  padding: 16px;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .actions {
    display: flex;
    gap: 8px;
  }
}
</style>
