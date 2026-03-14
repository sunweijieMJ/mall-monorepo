<template>
  <div class="theme-visual-editor">
    <el-tabs v-model="activeTab">
      <el-tab-pane
        v-for="category in categories"
        :key="category.key"
        :name="category.key"
      >
        <template #label>
          <span class="tab-label">
            {{ category.label }}
            <el-badge
              v-if="getCategoryModifiedCount(category) > 0"
              :value="getCategoryModifiedCount(category)"
              type="primary"
              class="tab-badge"
            />
          </span>
        </template>
      </el-tab-pane>
    </el-tabs>

    <div class="vars-container">
      <!-- 调色板：按色系分组 + 吸顶标题 -->
      <template v-if="activeTab === 'palette' && paletteGroups.length > 0">
        <div
          v-for="group in paletteGroups"
          :key="group.key"
          class="palette-group"
        >
          <div class="palette-group-header">
            {{ group.label }}
            <span class="palette-group-count">{{ group.vars.length }}</span>
          </div>
          <ThemeColorVar
            v-for="varName in group.vars"
            :key="varName"
            :var-name="varName"
            :value="getVarValue(varName)"
            :default-value="getDefaultValue(varName)"
            @change="handleVarChange"
            @reset="handleVarReset"
          />
        </div>
      </template>

      <!-- 其他分类：平铺列表 -->
      <template v-else-if="activeCategory && activeCategory.vars.length > 0">
        <ThemeColorVar
          v-for="varName in activeCategory.vars"
          :key="varName"
          :var-name="varName"
          :value="getVarValue(varName)"
          :default-value="getDefaultValue(varName)"
          @change="handleVarChange"
          @reset="handleVarReset"
        />
      </template>

      <div v-else class="empty-state">暂无颜色变量</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import ThemeColorVar from './ThemeColorVar.vue';
import type { ThemeStyleKey } from '@/interface/system';
import type { ColorCategory, ThemeVars } from '@/utils/theme';
import {
  getColorCategories,
  getDefaultThemeVars,
  paletteSubGroups,
} from '@/utils/theme';

interface Props {
  editTheme: ThemeStyleKey;
  mergedVars: ThemeVars;
  customVars: ThemeVars;
}

interface Emits {
  (e: 'change', varName: string, value: string): void;
  (e: 'reset', varName: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const categories = getColorCategories();
const activeTab = ref(categories[0]?.key ?? '');

const defaults = computed(() => getDefaultThemeVars(props.editTheme));

const activeCategory = computed(() =>
  categories.find((c) => c.key === activeTab.value),
);

const paletteCategory = computed(() =>
  categories.find((c) => c.key === 'palette'),
);

const paletteGroups = computed(() => {
  const vars = paletteCategory.value?.vars ?? [];
  return paletteSubGroups
    .map((group) => ({
      ...group,
      vars: vars.filter((v) => v.toLowerCase().startsWith(group.prefix)),
    }))
    .filter((g) => g.vars.length > 0);
});

function getVarValue(varName: string): string {
  return props.mergedVars[varName] ?? '';
}

function getDefaultValue(varName: string): string {
  return defaults.value[varName] ?? '';
}

function getCategoryModifiedCount(category: ColorCategory): number {
  return category.vars.filter((v) => v in props.customVars).length;
}

function handleVarChange(varName: string, value: string) {
  emit('change', varName, value);
}

function handleVarReset(varName: string) {
  emit('reset', varName);
}
</script>

<style lang="scss" scoped>
.theme-visual-editor {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-tabs__header) {
    flex-shrink: 0;
    margin: 0;
    padding: 0 16px;
  }

  :deep(.el-tabs__content) {
    display: none;
  }
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab-badge {
  :deep(.el-badge__content) {
    font-size: 10px;
  }
}

.vars-container {
  flex: 1;
  padding: 8px 16px;
  overflow-y: auto;
}

.palette-group {
  &:not(:last-child) {
    margin-bottom: 4px;
  }
}

.palette-group-header {
  display: flex;
  position: sticky;
  z-index: 1;
  top: -8px;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--colorBorderSecondary);
  background-color: var(--colorBgContainer);
  color: var(--colorTextSecondary);
  font-size: 13px;
  font-weight: 600;
  gap: 8px;
}

.palette-group-count {
  color: var(--colorTextDescription);
  font-size: 12px;
  font-weight: 400;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--colorTextDescription);
  font-size: 14px;
}
</style>
