<!--
  Schema 驱动的表单组件
  根据传入的 SiteSchema 自动渲染分组表单
-->
<template>
  <div class="schema-form">
    <el-card
      v-for="(section, sectionKey) in schema"
      :key="sectionKey"
      class="mb-4"
    >
      <template #header>
        <div class="section-header">
          <span class="section-title">{{ section.title }}</span>
          <span v-if="section.description" class="section-desc">
            {{ section.description }}
          </span>
        </div>
      </template>

      <el-form label-position="top" :model="modelValue">
        <el-row :gutter="16">
          <el-col
            v-for="(field, fieldKey) in section.properties"
            :key="fieldKey"
            :span="field.span ?? 12"
          >
            <el-form-item>
              <template #label>
                <span class="field-label">
                  {{ field.title }}
                  <el-tooltip
                    v-if="field.description"
                    :content="field.description"
                    placement="top"
                  >
                    <el-icon class="field-help">
                      <QuestionFilled />
                    </el-icon>
                  </el-tooltip>
                </span>
              </template>

              <!-- boolean: switch -->
              <template v-if="field.type === 'boolean'">
                <el-switch
                  :model-value="getFieldValue(sectionKey, fieldKey) as boolean"
                  @change="
                    (val: boolean) =>
                      handleFieldChange(sectionKey, fieldKey, val)
                  "
                />
              </template>

              <!-- number slider -->
              <template
                v-else-if="
                  field.type === 'number' && field.inputType === 'slider'
                "
              >
                <el-slider
                  class="field-slider"
                  :model-value="getFieldValue(sectionKey, fieldKey) as number"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step"
                  show-tooltip
                  @change="
                    (val: number) =>
                      handleFieldChange(sectionKey, fieldKey, val)
                  "
                />
              </template>

              <!-- number input -->
              <template v-else-if="field.type === 'number'">
                <el-input-number
                  :model-value="getFieldValue(sectionKey, fieldKey) as number"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step"
                  controls-position="right"
                  @change="
                    (val: number) =>
                      handleFieldChange(sectionKey, fieldKey, val)
                  "
                />
              </template>

              <!-- string color -->
              <template
                v-else-if="
                  field.type === 'string' && field.inputType === 'color'
                "
              >
                <el-color-picker
                  show-alpha
                  :model-value="getFieldValue(sectionKey, fieldKey) as string"
                  @change="
                    (val: string) =>
                      handleFieldChange(sectionKey, fieldKey, val)
                  "
                />
              </template>

              <!-- string enumType: select -->
              <template v-else-if="field.type === 'string' && field.enumType">
                <el-select
                  :model-value="getFieldValue(sectionKey, fieldKey) as string"
                  @change="
                    (val: string) =>
                      handleFieldChange(sectionKey, fieldKey, val)
                  "
                >
                  <el-option
                    v-for="opt in field.enumType"
                    :key="opt"
                    :label="opt"
                    :value="opt"
                  />
                </el-select>
              </template>

              <!-- string textarea -->
              <template
                v-else-if="
                  field.type === 'string' && field.inputType === 'textarea'
                "
              >
                <el-input
                  type="textarea"
                  :model-value="getFieldValue(sectionKey, fieldKey) as string"
                  @input="
                    (val: string) =>
                      handleFieldChange(sectionKey, fieldKey, val)
                  "
                />
              </template>

              <!-- string default: text input -->
              <template v-else>
                <el-input
                  :model-value="getFieldValue(sectionKey, fieldKey) as string"
                  @input="
                    (val: string) =>
                      handleFieldChange(sectionKey, fieldKey, val)
                  "
                />
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { QuestionFilled } from '@element-plus/icons-vue';
import type { SiteSchema } from '@/constants/siteConfig';

const props = defineProps<{
  schema: SiteSchema;
  modelValue: Record<string, Record<string, unknown>>;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, Record<string, unknown>>];
}>();

/**
 * 获取字段当前值，未设置时从 schema defaultValue 取
 */
function getFieldValue(sectionKey: string, fieldKey: string): unknown {
  // 通过 mergeConfig 已经处理了默认值，直接读 modelValue
  return props.modelValue?.[sectionKey]?.[fieldKey];
}

/**
 * 字段变化，以不可变方式更新 modelValue
 */
function handleFieldChange(
  sectionKey: string,
  fieldKey: string,
  val: unknown,
): void {
  emit('update:modelValue', {
    ...props.modelValue,
    [sectionKey]: {
      ...(props.modelValue?.[sectionKey] ?? {}),
      [fieldKey]: val,
    },
  });
}
</script>

<style lang="scss" scoped>
.mb-4 {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
  }

  .section-desc {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.field-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  .field-help {
    color: var(--el-text-color-secondary);
    font-size: 14px;
    cursor: pointer;
  }
}

.field-slider {
  width: 100%;
}
</style>
