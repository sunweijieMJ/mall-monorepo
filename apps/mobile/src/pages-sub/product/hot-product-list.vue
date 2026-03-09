<template>
  <view class="content">
    <image
      src="/static/banners/hot_product_banner.png"
      class="banner-image"
    ></image>
    <view class="section-tit">相关商品</view>
    <view class="goods-list">
      <view
        v-for="(item, index) in productList"
        :key="index"
        class="goods-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.pic" mode="aspectFit"></image>
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
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '热门商品',
  },
});
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { ULoadMore } from '@/components';
import { useHomeStore } from '@/store';

/**
 * 热销商品列表页面
 * 展示热门商品，支持下拉刷新和上拉加载更多
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

/** 搜索参数接口 */
interface SearchParam {
  pageNum: number;
  pageSize: number;
}

const homeStore = useHomeStore();

/** 加载更多状态 */
const loadingType = ref<'loadmore' | 'loading' | 'nomore'>('loadmore');
/** 商品列表 */
const productList = ref<Product[]>([]);
/** 搜索参数 */
const searchParam = reactive<SearchParam>({
  pageNum: 1,
  pageSize: 6,
});

/**
 * 页面加载
 */
onLoad(() => {
  loadData();
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

  try {
    // sort=2 按销量（热品）排序
    const data = await homeStore.fetchProductList({ ...searchParam, sort: 2 });
    const list = (data as any)?.list || data || [];

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
    console.error('加载热销商品失败:', error);
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
 * 跳转到商品详情页
 */
const navToDetailPage = (item: Product) => {
  uni.navigateTo({
    url: `/pages-sub/product/product?id=${item.id}`,
  });
};
</script>

<style lang="scss" scoped>
page,
.content {
  background: var(--color-bg-grey);
}

.banner-image {
  width: 100%;
}

.section-tit {
  margin-top: 16rpx;
  padding-top: 20rpx;
  padding-bottom: 20rpx;
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 30rpx;
  text-align: center;
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
    background-color: var(--color-bg);

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
