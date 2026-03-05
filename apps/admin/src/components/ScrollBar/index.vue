<!--
  Mall 自定义滚动条组件
  从 mall-admin-web 迁移并转换为 Vue 3 + TypeScript
-->
<template>
  <div
    ref="scrollContainerRef"
    class="scroll-container"
    @wheel.prevent="handleScroll"
  >
    <div
      ref="scrollWrapperRef"
      class="scroll-wrapper"
      :style="{ top: top + 'px' }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const DELTA = 15;

const top = ref(0);
const scrollContainerRef = ref<HTMLElement>();
const scrollWrapperRef = ref<HTMLElement>();

const handleScroll = (e: WheelEvent) => {
  const eventDelta = e.deltaY ? -e.deltaY * 3 : (e as any).wheelDelta;
  const $container = scrollContainerRef.value;
  const $wrapper = scrollWrapperRef.value;

  if (!$container || !$wrapper) return;

  const $containerHeight = $container.offsetHeight;
  const $wrapperHeight = $wrapper.offsetHeight;

  if (eventDelta > 0) {
    // 向上滚动
    top.value = Math.min(0, top.value + eventDelta);
  } else {
    // 向下滚动
    if ($containerHeight - DELTA < $wrapperHeight) {
      if (top.value < -($wrapperHeight - $containerHeight + DELTA)) {
        // 已经到底部，不再滚动
        // 已经到底部，不再滚动
      } else {
        top.value = Math.max(
          top.value + eventDelta,
          $containerHeight - $wrapperHeight - DELTA,
        );
      }
    } else {
      // 内容高度小于容器高度，不需要滚动
      top.value = 0;
    }
  }
};
</script>

<style scoped lang="scss">
.scroll-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #304156;

  .scroll-wrapper {
    position: absolute;
    width: 100% !important;
  }
}
</style>
