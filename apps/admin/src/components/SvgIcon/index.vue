<!--
  Mall SVG 图标组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :xlink:href="iconName"></use>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  iconClass: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
});

const iconName = computed(() => `#icon-${props.iconClass}`);

const svgClass = computed(() => {
  if (props.className) {
    return `svg-icon ${props.className}`;
  }
  return 'svg-icon';
});
</script>

<style scoped>
.svg-icon {
  width: 1.2em;
  height: 1.2em;
  overflow: hidden;
  fill: currentColor;
  vertical-align: -0.18em;
}
</style>
