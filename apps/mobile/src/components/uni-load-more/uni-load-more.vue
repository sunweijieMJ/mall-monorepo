<template>
  <view class="uni-load-more">
    <view v-show="status === 'loading' && showIcon" class="uni-load-more__img">
      <view class="load1">
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
      </view>
      <view class="load2">
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
      </view>
      <view class="load3">
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
        <view :style="{ background: color }"></view>
      </view>
    </view>
    <text class="uni-load-more__text" :style="{ color: color }">
      {{
        status === 'more'
          ? contentText.contentdown
          : status === 'loading'
            ? contentText.contentrefresh
            : contentText.contentnomore
      }}
    </text>
  </view>
</template>

<script setup lang="ts">
/**
 * uni-load-more 加载更多组件
 * 用于列表加载更多的状态显示
 * 支持三种状态：more(更多)、loading(加载中)、noMore(无更多)
 */

export interface ContentText {
  contentdown: string;
  contentrefresh: string;
  contentnomore: string;
}

export interface UniLoadMoreProps {
  /** 上拉的状态：more-loading前；loading-loading中；noMore-没有更多了 */
  status?: 'more' | 'loading' | 'noMore';
  /** 是否显示加载图标 */
  showIcon?: boolean;
  /** 文字颜色 */
  color?: string;
  /** 显示的文字内容 */
  contentText?: ContentText;
}

const props = withDefaults(defineProps<UniLoadMoreProps>(), {
  status: 'more',
  showIcon: true,
  color: '#777777',
  contentText: () => ({
    contentdown: '上拉显示更多',
    contentrefresh: '正在加载...',
    contentnomore: '没有更多数据了',
  }),
});
</script>

<style scoped>
.uni-load-more {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 80upx;
}

.uni-load-more__text {
  color: #999;
  font-size: 28upx;
}

.uni-load-more__img {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.uni-load-more__img > view {
  position: absolute;
}

.uni-load-more__img > view view {
  position: absolute;
  width: 6px;
  height: 2px;
  transform-origin: 50%;
  animation: load 1.56s ease infinite;
  border-top-left-radius: 1px;
  border-bottom-left-radius: 1px;
  opacity: 0.2;
  background: #999;
}

.uni-load-more__img > view view:nth-child(1) {
  top: 2px;
  left: 9px;
  transform: rotate(90deg);
}

.uni-load-more__img > view view:nth-child(2) {
  top: 11px;
  right: 0;
  transform: rotate(180deg);
}

.uni-load-more__img > view view:nth-child(3) {
  bottom: 2px;
  left: 9px;
  transform: rotate(270deg);
}

.uni-load-more__img > view view:nth-child(4) {
  top: 11px;
  left: 0;
}

.load1,
.load2,
.load3 {
  width: 24px;
  height: 24px;
}

.load2 {
  transform: rotate(30deg);
}

.load3 {
  transform: rotate(60deg);
}

.load1 view:nth-child(1) {
  animation-delay: 0s;
}

.load2 view:nth-child(1) {
  animation-delay: 0.13s;
}

.load3 view:nth-child(1) {
  animation-delay: 0.26s;
}

.load1 view:nth-child(2) {
  animation-delay: 0.39s;
}

.load2 view:nth-child(2) {
  animation-delay: 0.52s;
}

.load3 view:nth-child(2) {
  animation-delay: 0.65s;
}

.load1 view:nth-child(3) {
  animation-delay: 0.78s;
}

.load2 view:nth-child(3) {
  animation-delay: 0.91s;
}

.load3 view:nth-child(3) {
  animation-delay: 1.04s;
}

.load1 view:nth-child(4) {
  animation-delay: 1.17s;
}

.load2 view:nth-child(4) {
  animation-delay: 1.3s;
}

.load3 view:nth-child(4) {
  animation-delay: 1.43s;
}

@keyframes load {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.2;
  }
}

@keyframes load {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0.2;
  }
}
</style>
