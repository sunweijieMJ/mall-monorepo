<template>
  <view
    v-if="show"
    class="mask"
    :style="{ backgroundColor: backgroundColor }"
    @click="toggleMask"
    @touchmove.stop.prevent="stopPrevent"
  >
    <view
      class="mask-content"
      :style="{ height: config.height, transform: transform }"
      @click.stop.prevent="stopPrevent"
    >
      <scroll-view class="view-content" scroll-y>
        <view class="share-header">分享到</view>
        <view class="share-list">
          <view
            v-for="(item, index) in shareList"
            :key="index"
            class="share-item"
            @click="shareToFriend(item.text)"
          >
            <image :src="item.icon" mode=""></image>
            <text>{{ item.text }}</text>
          </view>
        </view>
      </scroll-view>
      <view class="bottom b-t" @click="toggleMask">取消</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';

/**
 * Share 分享组件
 * 底部弹出式分享面板，支持多个分享渠道
 */

export interface ShareItem {
  icon: string;
  text: string;
}

export interface ShareProps {
  /** 内容高度（单位upx） */
  contentHeight?: number;
  /** 是否是tabbar页面（防止tabbar重复显示） */
  hasTabbar?: boolean;
  /** 分享列表 */
  shareList?: ShareItem[];
}

const props = withDefaults(defineProps<ShareProps>(), {
  contentHeight: 0,
  hasTabbar: false,
  shareList: () => [],
});

/** 变换属性 */
const transform = ref('translateY(50vh)');
/** 防抖计时器 */
const timer = ref(0);
/** 背景颜色 */
const backgroundColor = ref('rgba(0,0,0,0)');
/** 是否显示 */
const show = ref(false);
/** 配置对象 */
const config = reactive({
  height: '0px',
  transform: 'translateY(0px)',
  backgroundColor: 'rgba(0,0,0,.4)',
});

onMounted(() => {
  const height = uni.upx2px(props.contentHeight) + 'px';
  config.height = height;
  config.transform = `translateY(${height})`;
  config.backgroundColor = 'rgba(0,0,0,.4)';
  transform.value = config.transform;
});

/** 切换遮罩显示/隐藏 */
const toggleMask = () => {
  // 防止高频点击
  if (timer.value === 1) {
    return;
  }
  timer.value = 1;
  setTimeout(() => {
    timer.value = 0;
  }, 500);

  if (show.value) {
    transform.value = config.transform;
    backgroundColor.value = 'rgba(0,0,0,0)';
    setTimeout(() => {
      show.value = false;
      props.hasTabbar && uni.showTabBar();
    }, 200);
    return;
  }

  show.value = true;
  // 等待mask重绘完成执行
  if (props.hasTabbar) {
    uni.hideTabBar({
      success: () => {
        setTimeout(() => {
          backgroundColor.value = config.backgroundColor;
          transform.value = 'translateY(0px)';
        }, 10);
      },
    });
  } else {
    setTimeout(() => {
      backgroundColor.value = config.backgroundColor;
      transform.value = 'translateY(0px)';
    }, 10);
  }
};

/** 防止冒泡和滚动穿透 */
const stopPrevent = () => {};

/** 分享操作 */
const shareToFriend = (type: string) => {
  uni.showToast({
    title: `分享给${type}`,
    icon: 'none',
  });
  toggleMask();
};

/** 暴露toggleMask方法供父组件调用 */
defineExpose({
  toggleMask,
});
</script>

<style lang="scss" scoped>
.mask {
  display: flex;
  position: fixed;
  z-index: 998;
  inset: 0;
  align-items: flex-end;
  justify-content: center;
  transition: 0.3s;

  .bottom {
    display: flex;
    position: absolute;
    z-index: 9;
    bottom: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 90upx;
    background: #fff;
    color: #333;
    font-size: 30upx;
  }
}

.mask-content {
  width: 100%;
  height: 580upx;
  transition: 0.3s;
  background: #fff;

  &.has-bottom {
    padding-bottom: 90upx;
  }

  .view-content {
    height: 100%;
  }
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 110upx;
  padding-top: 10upx;
  color: #333;
  font-size: 30upx;

  &::before,
  &::after {
    content: '';
    width: 240upx;
    height: 0;
    margin-right: 30upx;
    transform: scaleY(0.5);
    border-top: 1px solid #e5e5e5;
  }

  &::after {
    margin-right: 0;
    margin-left: 30upx;
  }
}

.share-list {
  display: flex;
  flex-wrap: wrap;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 33.33%;
  height: 180upx;

  image {
    width: 80upx;
    height: 80upx;
    margin-bottom: 16upx;
  }

  text {
    color: #999;
    font-size: 28upx;
  }
}
</style>
