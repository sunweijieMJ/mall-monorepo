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
import { useProductStore } from '@/store';

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

const productStore = useProductStore();

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

/** 分类树（原始数据，含 children） */
const categoryTree = ref<any[]>([]);

/**
 * 加载分类数据
 */
const loadData = async () => {
  try {
    const data = await productStore.fetchCategoryTree();
    categoryTree.value = data || [];
    // 取一级分类列表
    flist.value = categoryTree.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      icon: item.icon,
    }));
    if (flist.value.length > 0) {
      currentId.value = flist.value[0].id;
      // 取第一个一级分类的子分类
      const first = categoryTree.value[0];
      slist.value = (first?.children || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
      }));
    }
  } catch (error) {
    console.error('加载分类列表失败:', error);
  }
};

/**
 * 一级分类点击
 */
const tabtap = (item: Category) => {
  currentId.value = item.id;
  const found = categoryTree.value.find((c: any) => c.id === item.id);
  slist.value = (found?.children || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
  }));
};

/**
 * 跳转到商品列表
 */
const navToList = (sid: number) => {
  uni.navigateTo({
    url: `/pages-sub/product/list?fid=${currentId.value}&sid=${sid}`,
  });
};
</script>

<style lang="scss" scoped>
page,
.content {
  height: 100%;
  background-color: var(--color-bg-grey);
}

.content {
  display: flex;
}

.left-aside {
  flex-shrink: 0;
  width: 200rpx;
  height: 100%;
  background-color: var(--color-bg);
}

.f-item {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100rpx;
  color: #666;
  font-size: 28rpx;

  &.active {
    background: var(--color-bg-grey);
    color: var(--color-primary);

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 8rpx;
      height: 36rpx;
      transform: translateY(-50%);
      border-radius: 0 4px 4px 0;
      opacity: 0.8;
      background-color: var(--color-primary);
    }
  }
}

.right-aside {
  flex: 1;
  padding-left: 20rpx;
  overflow: hidden;
}

.s-list {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin-top: 20rpx;
  padding-top: 12rpx;
  background: var(--color-bg);

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
  width: 176rpx;
  padding-bottom: 20rpx;
  color: #666;
  font-size: 26rpx;

  image {
    width: 140rpx;
    height: 140rpx;
  }
}
</style>
