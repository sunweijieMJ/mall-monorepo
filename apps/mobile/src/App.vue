<template>
  <!-- #ifdef H5 -->
  <div id="app">
    <main id="main-content">
      <RouterView />
    </main>
  </div>
  <!-- #endif -->

  <!-- #ifndef H5 -->
  <!-- #endif -->
</template>

<script setup lang="ts">
// #ifndef H5
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
// #endif
import { log } from '@/utils/core/logger';

// #ifndef H5
onLaunch(() => {
  log.info('App Launch');
});

onShow(() => {
  log.debug('App Show');
});

onHide(() => {
  log.debug('App Hide');
});
// #endif
</script>

<style lang="scss">
@import './assets/styles/index';

view,
scroll-view,
swiper,
swiper-item,
cover-view,
cover-image,
icon,
text,
rich-text,
progress,
button,
checkbox,
form,
input,
label,
radio,
slider,
switch,
textarea,
navigator,
audio,
camera,
image,
video {
  box-sizing: border-box;
}

/* Web端兼容 */
#app {
  box-sizing: border-box;
}

/* 骨架屏替代方案 */
.Skeleton {
  padding: 20upx 0;
  border-radius: 8upx;
  background: var(--color-skeleton);
}

.clamp {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.common-hover {
  background: var(--color-background-tertiary);
}

/* 边框 */
.b-b::after,
.b-t::after {
  content: '';
  position: absolute;
  z-index: 3;
  right: 0;
  left: 0;
  height: 0;
  transform: scaleY(0.5);
  border-bottom: 1px solid var(--color-border);
}

.b-b::after {
  bottom: 0;
}

.b-t::after {
  top: 0;
}

/* button样式改写 */
button {
  height: 80upx;
  font-size: 18px;
  font-weight: 400;
  line-height: 80upx;

  &.no-border::before,
  &.no-border::after {
    border: 0;
  }
}

button[type='default'] {
  color: var(--color-text-primary);
}

/* input 样式 */
.input-placeholder {
  color: var(--color-text-tertiary);
}

.placeholder {
  color: var(--color-text-placeholder);
}
</style>
