<template>
  <view class="uni-numbox">
    <view class="uni-numbox-minus" @click="calcValue('subtract')">
      <text
        class="yticon icon--jianhao"
        :class="minDisabled ? 'uni-numbox-disabled' : ''"
      ></text>
    </view>
    <input
      class="uni-numbox-value"
      type="number"
      :disabled="disabled"
      :value="inputValue"
      @blur="onBlur"
    />
    <view class="uni-numbox-plus" @click="calcValue('add')">
      <text
        class="yticon icon-jia2"
        :class="maxDisabled ? 'uni-numbox-disabled' : ''"
      ></text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

/**
 * uni-number-box 数字输入框组件
 * 支持增减按钮控制、最小最大值限制、步长设置
 */

export interface UniNumberBoxProps {
  /** 是否达到最大值 */
  isMax?: boolean;
  /** 是否达到最小值 */
  isMin?: boolean;
  /** 索引（用于列表中识别是哪个输入框） */
  index?: number;
  /** 当前值 */
  value?: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否禁用 */
  disabled?: boolean;
}

export interface EventChangeData {
  number: number;
  index: number;
}

const props = withDefaults(defineProps<UniNumberBoxProps>(), {
  isMax: false,
  isMin: false,
  index: 0,
  value: 0,
  min: -Infinity,
  max: Infinity,
  step: 1,
  disabled: false,
});

const emit = defineEmits<{
  eventChange: [data: EventChangeData];
}>();

/** 输入框的值 */
const inputValue = ref(props.value);
/** 减号按钮是否禁用 */
const minDisabled = ref(false);
/** 加号按钮是否禁用 */
const maxDisabled = ref(false);

onMounted(() => {
  maxDisabled.value = props.isMax;
  minDisabled.value = props.isMin;
});

/** 监听输入值变化，触发事件 */
watch(inputValue, (number) => {
  const data: EventChangeData = {
    number: number,
    index: props.index,
  };
  emit('eventChange', data);
});

/** 获取小数位数的缩放倍数 */
const getDecimalScale = (): number => {
  let scale = 1;
  // 浮点型
  if (~~props.step !== props.step) {
    scale = Math.pow(10, (props.step + '').split('.')[1].length);
  }
  return scale;
};

/** 计算新值（加或减） */
const calcValue = (type: 'add' | 'subtract') => {
  const scale = getDecimalScale();
  let value = inputValue.value * scale;
  let newValue = 0;
  const step = props.step * scale;

  if (type === 'subtract') {
    newValue = value - step;
    if (newValue <= props.min) {
      minDisabled.value = true;
    }
    if (newValue < props.min) {
      newValue = props.min;
    }
    if (newValue < props.max && maxDisabled.value === true) {
      maxDisabled.value = false;
    }
  } else if (type === 'add') {
    newValue = value + step;
    if (newValue >= props.max) {
      maxDisabled.value = true;
    }
    if (newValue > props.max) {
      newValue = props.max;
    }
    if (newValue > props.min && minDisabled.value === true) {
      minDisabled.value = false;
    }
  }

  if (newValue === value) {
    return;
  }

  inputValue.value = newValue / scale;
};

/** 输入框失去焦点时的处理 */
const onBlur = (event: any) => {
  let value = event.detail.value;
  if (!value) {
    inputValue.value = 0;
    return;
  }
  value = +value;
  if (value > props.max) {
    value = props.max;
  } else if (value < props.min) {
    value = props.min;
  }

  inputValue.value = value;
};
</script>

<style scoped>
.uni-numbox {
  display: flex;
  position: absolute;
  bottom: 0;
  left: 30upx;
  align-items: center;
  justify-content: flex-start;
  width: 230upx;
  height: 70upx;
  background: #f5f5f5;
}

.uni-numbox-minus,
.uni-numbox-plus {
  position: relative;
  width: 70upx;
  height: 100%;
  margin: 0;
  background-color: #f5f5f5;
  line-height: 70upx;
  text-align: center;
}

.uni-numbox-minus .yticon,
.uni-numbox-plus .yticon {
  color: #555;
  font-size: 36upx;
}

.uni-numbox-minus {
  border-right: none;
  border-top-left-radius: 6upx;
  border-bottom-left-radius: 6upx;
}

.uni-numbox-plus {
  border-left: none;
  border-top-right-radius: 6upx;
  border-bottom-right-radius: 6upx;
}

.uni-numbox-value {
  position: relative;
  width: 90upx;
  height: 50upx;
  padding: 0;
  background-color: #f5f5f5;
  font-size: 30upx;
  text-align: center;
}

.uni-numbox-disabled.yticon {
  color: #d6d6d6;
}
</style>
