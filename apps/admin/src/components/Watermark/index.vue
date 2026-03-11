<!--
  水印覆盖层组件
  通过 canvas 生成水印图片并以 fixed 定位覆盖整个页面
-->
<template>
  <div
    v-if="config.enabled && dataUrl"
    class="watermark-overlay"
    :style="overlayStyle"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { WatermarkConfig } from '@/constants/siteConfig';

const props = defineProps<{
  config: WatermarkConfig;
}>();

const dataUrl = ref('');

/**
 * 用 canvas 生成水印 dataURL
 */
function generateDataUrl(cfg: WatermarkConfig): string {
  const canvas = document.createElement('canvas');
  canvas.width = cfg.gapX;
  canvas.height = cfg.gapY;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, cfg.gapX, cfg.gapY);
  ctx.save();
  ctx.translate(cfg.gapX / 2, cfg.gapY / 2);
  ctx.rotate((cfg.rotate * Math.PI) / 180);
  ctx.globalAlpha = cfg.opacity;
  ctx.font = `${cfg.fontWeight} ${cfg.fontSize}px Arial, sans-serif`;
  ctx.fillStyle = cfg.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cfg.content, 0, 0);
  ctx.restore();
  return canvas.toDataURL('image/png');
}

// 配置变化时重新生成水印
watch(
  () => props.config,
  (cfg) => {
    if (cfg.enabled) {
      dataUrl.value = generateDataUrl(cfg);
    } else {
      dataUrl.value = '';
    }
  },
  { deep: true, immediate: true },
);

const overlayStyle = computed(() => ({
  backgroundImage: `url(${dataUrl.value})`,
}));
</script>

<style lang="scss" scoped>
.watermark-overlay {
  position: fixed;
  z-index: 9999;
  background-repeat: repeat;
  pointer-events: none;
  inset: 0;
}
</style>
