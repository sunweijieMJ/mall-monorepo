<template>
  <view class="content">
    <scroll-view scroll-y class="left-aside">
      <view
        v-for="item in flist"
        :key="item.id"
        class="f-item b-b"
        :class="{ active: item.id === currentId }"
        @click="tabtap(item)"
      >
        {{ item.name }}
      </view>
    </scroll-view>
    <scroll-view scroll-with-animation scroll-y class="right-aside">
      <view class="s-list">
        <view
          v-for="item in slist"
          :key="item.id"
          class="s-item"
          @click="navToList(item.id)"
        >
          <image
            :src="
              item.icon ||
              'http://macro-oss.oss-cn-shenzhen.aliyuncs.com/mall/images/20190519/default.png'
            "
          ></image>
          <text>{{ item.name }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '分类',
    'app-plus': {
      bounce: 'none',
    },
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { HomeService } from '@/api';

/**
 * 分类页面
 * 展示商品的一级和二级分类，左侧为一级分类，右侧为二级分类
 */

/** 分类项接口 */
interface Category {
  id: number;
  name: string;
  icon?: string;
}

/** 当前选中的一级分类ID */
const currentId = ref(0);
/** 一级分类列表 */
const flist = ref<Category[]>([]);
/** 二级分类列表 */
const slist = ref<Category[]>([]);

/**
 * 页面加载
 */
onLoad(() => {
  loadData();
});

/**
 * 加载分类数据
 */
const loadData = async () => {
  try {
    const response = await HomeService.fetchProductCateList(0);
    flist.value = response.data || [];
    if (flist.value.length > 0) {
      currentId.value = flist.value[0].id;
      const subResponse = await HomeService.fetchProductCateList(
        currentId.value,
      );
      slist.value = subResponse.data || [];
    }
  } catch (error) {
    console.error('加载分类列表失败:', error);
  }
};

/**
 * 一级分类点击
 */
const tabtap = async (item: Category) => {
  currentId.value = item.id;
  try {
    const response = await HomeService.fetchProductCateList(currentId.value);
    slist.value = response.data || [];
  } catch (error) {
    console.error('加载子分类失败:', error);
  }
};

/**
 * 跳转到商品列表
 */
const navToList = (sid: number) => {
  uni.navigateTo({
    url: `/pages/product/list?fid=${currentId.value}&sid=${sid}`,
  });
};
</script>

<style lang="scss" scoped>
page,
.content {
  height: 100%;
  background-color: #f8f8f8;
}

.content {
  display: flex;
}

.left-aside {
  flex-shrink: 0;
  width: 200upx;
  height: 100%;
  background-color: #fff;
}

.f-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100upx;
  color: #666;
  font-size: 28upx;

  &.active {
    background: #f8f8f8;
    color: #fa436a;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 8upx;
      height: 36upx;
      transform: translateY(-50%);
      border-radius: 0 4px 4px 0;
      opacity: 0.8;
      background-color: #fa436a;
    }
  }
}

.right-aside {
  flex: 1;
  padding-left: 20upx;
  overflow: hidden;
}

.s-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 20upx;
  padding-top: 12upx;
  background: #fff;

  &::after {
    content: '';
    flex: 99;
    height: 0;
  }
}

.s-item {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 176upx;
  padding-bottom: 20upx;
  color: #666;
  font-size: 26upx;

  image {
    width: 140upx;
    height: 140upx;
  }
}
</style>
