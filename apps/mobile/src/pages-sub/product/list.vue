<template>
  <view class="content">
    <view class="navbar" :style="{ position: headerPosition, top: headerTop }">
      <view
        class="nav-item"
        :class="{ current: filterIndex === 0 }"
        @click="tabClick(0)"
      >
        综合排序
      </view>
      <view
        class="nav-item"
        :class="{ current: filterIndex === 1 }"
        @click="tabClick(1)"
      >
        销量优先
      </view>
      <view
        class="nav-item"
        :class="{ current: filterIndex === 2 }"
        @click="tabClick(2)"
      >
        <text>价格</text>
        <view class="p-box">
          <uni-icons
            type="arrow-up"
            size="14"
            :color="
              priceOrder === 1 && filterIndex === 2
                ? 'var(--color-primary)'
                : '#888'
            "
          />
          <uni-icons
            type="arrow-down"
            size="14"
            :color="
              priceOrder === 2 && filterIndex === 2
                ? 'var(--color-primary)'
                : '#888'
            "
          />
        </view>
      </view>
      <uni-icons
        type="bars"
        size="20"
        class="cate-item"
        @click="toggleCateMask('show')"
      />
    </view>
    <view class="goods-list">
      <view
        v-for="(item, index) in productList"
        :key="index"
        class="goods-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.pic" mode="aspectFill"></image>
        </view>
        <text class="title clamp">{{ item.name }}</text>
        <text class="title2">{{ item.subTitle }}</text>
        <view class="price-box">
          <text class="price">{{ item.price }}</text>
          <text>已售 {{ item.sale }}</text>
        </view>
      </view>
    </view>
    <ULoadMore :status="loadingType" />

    <view
      class="cate-mask"
      :class="cateMaskState === 0 ? 'none' : cateMaskState === 1 ? 'show' : ''"
      @click="toggleCateMask()"
    >
      <view
        class="cate-content"
        @click.stop.prevent="stopPrevent"
        @touchmove.stop.prevent="stopPrevent"
      >
        <scroll-view scroll-y class="cate-list">
          <view v-for="item in cateList" :key="item.id">
            <view class="cate-item b-b two">{{ item.name }}</view>
            <view
              v-for="tItem in item.children"
              :key="tItem.id"
              class="cate-item b-b"
              :class="{ active: tItem.id == searchParam.productCategoryId }"
              @click="changeCate(tItem)"
            >
              {{ tItem.name }}
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '商品列表',
    enablePullDownRefresh: true,
  },
});
import {
  onLoad,
  onPageScroll,
  onPullDownRefresh,
  onReachBottom,
} from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { ULoadMore } from '@/components';
import { useProductStore } from '@/store';

const productStore = useProductStore();

/**
 * 商品列表页面
 * 支持按综合、销量、价格排序，支持分类筛选
 */

/** 商品项接口 */
interface Product {
  id: number;
  name: string;
  subTitle: string;
  pic: string;
  price: number;
  sale: number;
}

/** 分类项接口 */
interface Category {
  id: number;
  name: string;
  children?: Category[];
}

/** 搜索参数接口 */
interface SearchParam {
  productCategoryId: number | null;
  pageNum: number;
  pageSize: number;
  sort: number;
}

/** 分类面板展开状态 */
const cateMaskState = ref<0 | 1 | 2>(0);
/** 头部定位方式 */
const headerPosition = ref<'fixed' | 'absolute'>('fixed');
/** 头部top值 */
const headerTop = ref('0px');
/** 加载更多状态 */
const loadingType = ref<'loadmore' | 'loading' | 'nomore'>('loadmore');
/** 筛选索引 */
const filterIndex = ref(0);
/** 价格排序 1-从低到高 2-从高到低 */
const priceOrder = ref(0);
/** 分类列表 */
const cateList = ref<Category[]>([]);
/** 商品列表 */
const productList = ref<Product[]>([]);
/** 搜索参数 */
const searchParam = reactive<SearchParam>({
  productCategoryId: null,
  pageNum: 1,
  pageSize: 6,
  sort: 0,
});

/**
 * 页面加载
 */
onLoad((options) => {
  // #ifdef H5
  const uniPageHead = document.getElementsByTagName('uni-page-head')[0];
  if (uniPageHead) {
    headerTop.value = uniPageHead.offsetHeight + 'px';
  }
  // #endif

  if (options?.sid) {
    searchParam.productCategoryId = Number(options.sid);
  }
  if (options?.fid) {
    loadCateList(options.fid, options.sid);
  } else {
    loadCateList();
  }
  loadData();
});

/**
 * 页面滚动监听
 */
onPageScroll((e) => {
  // 兼容iOS端下拉时顶部漂移
  if (e.scrollTop >= 0) {
    headerPosition.value = 'fixed';
  } else {
    headerPosition.value = 'absolute';
  }
});

/**
 * 下拉刷新
 */
onPullDownRefresh(() => {
  loadData('refresh');
});

/**
 * 加载更多
 */
onReachBottom(() => {
  searchParam.pageNum++;
  loadData();
});

/**
 * 加载分类列表
 */
const loadCateList = async (fid?: string, sid?: string) => {
  try {
    cateList.value = (await productStore.fetchCategoryTree()) || [];
  } catch (error) {
    console.error('加载分类列表失败:', error);
  }
};

/**
 * 加载商品列表，支持下拉刷新和上拉加载
 */
const loadData = async (type: 'add' | 'refresh' = 'add', loading?: number) => {
  // 没有更多直接返回
  if (type === 'add') {
    if (loadingType.value === 'nomore') {
      return;
    }
    loadingType.value = 'loading';
  } else {
    loadingType.value = 'loadmore';
  }

  if (type === 'refresh') {
    searchParam.pageNum = 1;
    productList.value = [];
  }

  // 设置排序参数
  if (filterIndex.value === 0) {
    searchParam.sort = 0;
  }
  if (filterIndex.value === 1) {
    searchParam.sort = 2;
  }
  if (filterIndex.value === 2) {
    if (priceOrder.value === 1) {
      searchParam.sort = 3;
    } else {
      searchParam.sort = 4;
    }
  }

  try {
    const result = await productStore.search(searchParam);
    const list = result?.list || [];

    if (list.length === 0) {
      // 没有更多了
      loadingType.value = 'nomore';
      searchParam.pageNum--;
    } else {
      if (list.length < searchParam.pageSize) {
        loadingType.value = 'nomore';
        searchParam.pageNum--;
      } else {
        loadingType.value = 'loadmore';
      }
      productList.value = productList.value.concat(list);
    }

    if (type === 'refresh') {
      if (loading === 1) {
        uni.hideLoading();
      } else {
        uni.stopPullDownRefresh();
      }
    }
  } catch (error) {
    console.error('加载商品列表失败:', error);
    if (type === 'refresh') {
      if (loading === 1) {
        uni.hideLoading();
      } else {
        uni.stopPullDownRefresh();
      }
    }
  }
};

/**
 * 筛选点击
 */
const tabClick = (index: number) => {
  if (filterIndex.value === index && index !== 2) {
    return;
  }
  filterIndex.value = index;
  if (index === 2) {
    priceOrder.value = priceOrder.value === 1 ? 2 : 1;
  } else {
    priceOrder.value = 0;
  }
  uni.pageScrollTo({
    duration: 300,
    scrollTop: 0,
  });
  loadData('refresh', 1);
  uni.showLoading({
    title: '正在加载',
  });
};

/**
 * 显示/隐藏分类面板
 */
const toggleCateMask = (type?: 'show') => {
  const timer = type === 'show' ? 10 : 300;
  const state = type === 'show' ? 1 : 0;
  cateMaskState.value = 2;
  setTimeout(() => {
    cateMaskState.value = state as 0 | 1;
  }, timer);
};

/**
 * 分类点击
 */
const changeCate = (item: Category) => {
  searchParam.productCategoryId = item.id;
  toggleCateMask();
  uni.pageScrollTo({
    duration: 300,
    scrollTop: 0,
  });
  loadData('refresh', 1);
  uni.showLoading({
    title: '正在加载',
  });
};

/**
 * 跳转到详情页
 */
const navToDetailPage = (item: Product) => {
  uni.navigateTo({
    url: `/pages-sub/product/product?id=${item.id}`,
  });
};

/**
 * 防止事件冒泡
 */
const stopPrevent = () => {};
</script>

<style lang="scss" scoped>
page,
.content {
  background: var(--color-bg-grey);
}

.content {
  padding-top: 96rpx;
}

.navbar {
  display: flex;
  position: fixed;
  z-index: 10;
  top: var(--window-top);
  left: 0;
  width: 100%;
  height: 80rpx;
  background: var(--color-bg);
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.06);

  .nav-item {
    display: flex;
    position: relative;
    flex: 1;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text);
    font-size: 30rpx;

    &.current {
      color: var(--color-primary);

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: 120rpx;
        height: 0;
        transform: translateX(-50%);
        border-bottom: 4rpx solid var(--color-primary);
      }
    }
  }

  .p-box {
    display: flex;
    flex-direction: column;
    margin-left: 4rpx;
  }

  .cate-item {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    width: 80rpx;
    height: 100%;

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      width: 0;
      height: 36rpx;
      transform: translateY(-50%);
      border-left: 1px solid #ddd;
    }
  }
}

/* 分类 */
.cate-mask {
  position: fixed;
  z-index: 95;
  top: var(--window-top);
  bottom: 0;
  left: 0;
  width: 100%;
  transition: 0.3s;
  background: rgba(0, 0, 0, 0);

  .cate-content {
    width: 630rpx;
    height: 100%;
    float: right;
    transform: translateX(100%);
    transition: 0.3s;
    background: var(--color-bg);
  }

  &.none {
    display: none;
  }

  &.show {
    background: rgba(0, 0, 0, 0.4);

    .cate-content {
      transform: translateX(0);
    }
  }
}

.cate-list {
  display: flex;
  flex-direction: column;
  height: 100%;

  .cate-item {
    display: flex;
    position: relative;
    align-items: center;
    height: 90rpx;
    padding-left: 30rpx;
    color: #555;
    font-size: 28rpx;
  }

  .two {
    height: 64rpx;
    background: var(--color-bg-grey);
    color: var(--color-text);
    font-size: 30rpx;
  }

  .active {
    color: var(--color-primary);
  }
}

/* 商品列表 */
.goods-list {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30rpx;
  background: var(--color-bg);

  .goods-item {
    display: flex;
    flex-direction: column;
    width: 48%;
    padding-bottom: 40rpx;

    &:nth-child(2n + 1) {
      margin-right: 4%;
    }
  }

  .image-wrapper {
    width: 100%;
    height: 330rpx;
    overflow: hidden;
    border-radius: 3px;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    color: var(--color-text);
    font-size: 36rpx;
    line-height: 80rpx;
  }

  .title2 {
    display: block;
    height: 80rpx;
    overflow: hidden;
    color: var(--color-text-secondary);
    font-size: 24rpx;
    line-height: 40rpx;
    text-overflow: ellipsis;
  }

  .price-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 10rpx;
    color: var(--color-text-secondary);
    font-size: 24rpx;
  }

  .price {
    color: var(--color-primary);
    font-size: 36rpx;
    line-height: 1;

    &::before {
      content: '￥';
      font-size: 26rpx;
    }
  }
}
</style>
