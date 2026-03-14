<template>
  <div class="var-item" :class="{ 'is-modified': isModified }">
    <div class="var-name">
      <el-badge v-if="isModified" is-dot type="primary">
        <span class="var-name-text">--{{ varName }}</span>
      </el-badge>
      <span v-else class="var-name-text">--{{ varName }}</span>
    </div>
    <div class="var-controls">
      <el-color-picker
        v-if="showColorPicker"
        v-model="hexValue"
        :show-alpha="hasAlpha"
        size="small"
        @change="handleColorChange"
      />
      <el-input
        v-model="inputValue"
        size="small"
        class="var-input"
        @change="handleInputChange"
      />
      <el-button
        v-if="isModified"
        size="small"
        text
        type="info"
        @click="handleReset"
      >
        重置
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { hexToRgb, isColorValue, rgbToHex } from '@/utils/theme';

interface Props {
  varName: string;
  value: string;
  defaultValue: string;
}

interface Emits {
  (e: 'change', varName: string, value: string): void;
  (e: 'reset', varName: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isModified = computed(() => props.value !== props.defaultValue);

const hasAlpha = computed(() => {
  const match = props.value.match(/\/\s*([\d.]+)/);
  return match ? parseFloat(match[1]) < 1 : false;
});

const showColorPicker = computed(() => isColorValue(props.value));

const hexValue = ref(rgbToHex(props.value));
const inputValue = ref(props.value);

watch(
  () => props.value,
  (val) => {
    hexValue.value = rgbToHex(val);
    inputValue.value = val;
  },
);

function handleColorChange(val: string | null) {
  if (!val) return;
  const rgbValue = hexToRgb(val);
  inputValue.value = rgbValue;
  emit('change', props.varName, rgbValue);
}

function handleInputChange(val: string) {
  emit('change', props.varName, val);
  hexValue.value = rgbToHex(val);
}

function handleReset() {
  emit('reset', props.varName);
}
</script>

<style lang="scss" scoped>
.var-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  font-size: 14px;

  &:hover {
    background-color: var(--colorBgElevated, var(--colorFillQuaternary));
  }
}

.var-name {
  flex-shrink: 0;
  width: 280px;
}

.var-name-text {
  color: var(--colorText);
  font-family: Consolas, Monaco, monospace;
  font-size: 13px;
}

.var-controls {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
}

.var-input {
  width: 220px;
}
</style>
