<template>
  <view class="content">
    <view
      class="mix-list-cell"
      :class="border"
      hover-class="cell-hover"
      :hover-stay-time="50"
      @click="handleClick"
    >
      <text
        v-if="icon"
        class="cell-icon yticon"
        :style="{ color: iconColor }"
        :class="icon"
      ></text>
      <text class="cell-tit clamp">{{ title }}</text>
      <text v-if="tips" class="cell-tip">{{ tips }}</text>
      <text class="cell-more yticon" :class="typeList[navigateType]"></text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * mix-list-cell 列表单元格组件
 * 简单封装的列表单元格，支持图标、标题、提示、导航箭头
 * 可以在此基础上进行扩展使用，比如加入image、iconSize可控等
 */

export interface MixListCellProps {
  /** 图标类名 */
  icon?: string;
  /** 标题 */
  title?: string;
  /** 提示文字 */
  tips?: string;
  /** 导航箭头类型 */
  navigateType?: 'left' | 'right' | 'up' | 'down';
  /** 边框类名 */
  border?: string;
  /** hover类名 */
  hoverClass?: string;
  /** 图标颜色 */
  iconColor?: string;
}

const props = withDefaults(defineProps<MixListCellProps>(), {
  icon: '',
  title: '标题',
  tips: '',
  navigateType: 'right',
  border: 'b-b',
  hoverClass: 'cell-hover',
  iconColor: '#333',
});

const emit = defineEmits<{
  eventClick: [];
}>();

/** 箭头类型映射 */
const typeList: Record<string, string> = {
  left: 'icon-zuo',
  right: 'icon-you',
  up: 'icon-shang',
  down: 'icon-xia',
};

/** 点击事件处理 */
const handleClick = () => {
  emit('eventClick');
};
</script>

<style lang="scss" scoped>
.icon .mix-list-cell.b-b::after {
  left: 90upx;
}

.mix-list-cell {
  display: flex;
  position: relative;
  align-items: baseline;
  padding: 20upx 30upx;
  line-height: 60upx;

  &.cell-hover {
    background: #fafafa;
  }

  &.b-b::after {
    left: 30upx;
  }

  .cell-icon {
    align-self: center;
    width: 56upx;
    max-height: 60upx;
    font-size: 38upx;
  }

  .cell-more {
    align-self: center;
    margin-left: 20upx;
    color: #999;
    font-size: 30upx;
  }

  .cell-tit {
    flex: 1;
    margin-right: 10upx;
    color: #333;
    font-size: 28upx;
  }

  .cell-tip {
    color: #999;
    font-size: 26upx;
  }
}
</style>
