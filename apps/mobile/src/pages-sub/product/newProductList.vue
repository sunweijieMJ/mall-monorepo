<template>
  <view class="content">
    <image src="/static/new_product_banner.png" class="banner-image"></image>
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
    <uni-load-more :status="loadingType"></uni-load-more>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '新品推荐',
  },
});
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { HomeService } from '@/api';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';

/**
 * 新品列表页面
 * 展示最新上架商品，支持下拉刷新和上拉加载更多
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

/** 加载更多状态 */
const loadingType = ref<'more' | 'loading' | 'nomore'>('more');
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
    loadingType.value = 'more';
  }

  if (type === 'refresh') {
    searchParam.pageNum = 1;
    productList.value = [];
  }

  try {
    const response = await HomeService.fetchNewProductList(searchParam);
    const list = response.data || [];

    if (list.length === 0) {
      // 没有更多了
      loadingType.value = 'nomore';
      searchParam.pageNum--;
    } else {
      if (list.length < searchParam.pageSize) {
        loadingType.value = 'nomore';
        searchParam.pageNum--;
      } else {
        loadingType.value = 'more';
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
    console.error('加载新品列表失败:', error);
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
    url: `/pages/product/product?id=${item.id}`,
  });
};
</script>

<style lang="scss" scoped>
page,
.content {
  background: #f8f8f8;
}

.banner-image {
  width: 100%;
}

.section-tit {
  margin-top: 16upx;
  padding-top: 20upx;
  padding-bottom: 20upx;
  background: #fff;
  color: #333;
  font-size: 30upx;
  text-align: center;
}

/* 商品列表 */
.goods-list {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30upx;
  background: #fff;

  .goods-item {
    display: flex;
    flex-direction: column;
    width: 48%;
    padding-bottom: 40upx;

    &:nth-child(2n + 1) {
      margin-right: 4%;
    }
  }

  .image-wrapper {
    width: 100%;
    height: 330upx;
    overflow: hidden;
    border-radius: 3px;
    background-color: #fff;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    color: #333;
    font-size: 36upx;
    line-height: 80upx;
  }

  .title2 {
    display: block;
    height: 80upx;
    overflow: hidden;
    color: #999;
    font-size: 24upx;
    line-height: 40upx;
    text-overflow: ellipsis;
  }

  .price-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 10upx;
    color: #999;
    font-size: 24upx;
  }

  .price {
    color: #fa436a;
    font-size: 36upx;
    line-height: 1;

    &::before {
      content: '￥';
      font-size: 26upx;
    }
  }
}
</style>
