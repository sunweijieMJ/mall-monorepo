<template>
  <view class="content">
    <image
      src="/static/banners/recommend_brand_banner.png"
      class="banner-image"
    ></image>
    <view class="section-tit">相关品牌</view>
    <view class="goods-list">
      <view
        v-for="(item, index) in brandList"
        :key="index"
        class="goods-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.logo" mode="aspectFit"></image>
        </view>
        <text class="title clamp">{{ item.name }}</text>
        <text class="title2">商品数量：{{ item.productCount }}</text>
      </view>
    </view>
    <ULoadMore :status="loadingType" />
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '推荐品牌列表',
    enablePullDownRefresh: true,
  },
});
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { ULoadMore } from '@/components';
import { useBrandStore } from '@/store';

const brandStore = useBrandStore();

/**
 * 品牌列表页面
 * 显示推荐品牌列表
 * 支持下拉刷新、上拉加载更多
 */

/** 品牌项接口 */
interface Brand {
  id: number;
  name: string;
  logo: string;
  productCount: number;
}

/** 搜索参数接口 */
interface SearchParam {
  pageNum: number;
  pageSize: number;
}

/** 加载更多状态 */
const loadingType = ref<'loadmore' | 'loading' | 'nomore'>('loadmore');
/** 品牌列表 */
const brandList = ref<Brand[]>([]);
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
 * 加载品牌列表，支持下拉刷新和上滑加载
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
    brandList.value = [];
  }

  try {
    const dataList = (await brandStore.fetchRecommendList(searchParam)) || [];

    if (dataList.length === 0) {
      // 没有更多了
      loadingType.value = 'nomore';
      searchParam.pageNum--;
    } else {
      if (dataList.length < searchParam.pageSize) {
        loadingType.value = 'nomore';
        searchParam.pageNum--;
      } else {
        loadingType.value = 'loadmore';
      }
      brandList.value = brandList.value.concat(dataList);
    }

    if (type === 'refresh') {
      if (loading === 1) {
        uni.hideLoading();
      } else {
        uni.stopPullDownRefresh();
      }
    }
  } catch (error) {
    console.error('加载品牌列表失败:', error);
    loadingType.value = 'loadmore';
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
 * 跳转到品牌详情页
 */
const navToDetailPage = (item: Brand) => {
  const id = item.id;
  uni.navigateTo({
    url: `/pages-sub/brand/brand-detail?id=${id}`,
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
  font-size: 32rpx;
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
    height: 150rpx;
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
  }
}
</style>
