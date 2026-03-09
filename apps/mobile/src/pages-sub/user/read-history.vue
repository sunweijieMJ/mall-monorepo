<template>
  <view class="content">
    <!-- 空白页 -->
    <UEmpty v-if="productList == null || productList.length === 0" />
    <view class="hot-section">
      <view
        v-for="(item, index) in productList"
        :key="index"
        class="guess-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.productPic" mode="aspectFill"></image>
        </view>
        <view class="txt">
          <text class="title clamp">{{ item.productName }}</text>
          <text class="title2">{{ item.productSubTitle }}</text>
          <view class="hor-txt">
            <text class="price">￥{{ item.productPrice }}</text>
            <text class="time">{{ formatDateTime(item.createTime) }}</text>
          </view>
        </view>
      </view>
    </view>
    <ULoadMore :status="loadingType" />
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '浏览记录',
  },
});
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { UEmpty, ULoadMore } from '@/components';
import { useHistoryStore } from '@/store';
import { formatDateTime } from '@/utils/formatters';

/**
 * 浏览历史列表页面
 * 显示用户浏览过的商品列表
 * 支持下拉刷新、上拉加载更多
 */

/** 浏览历史项接口 */
interface ReadHistory {
  productId: number;
  productName: string;
  productSubTitle: string;
  productPic: string;
  productPrice: number;
  createTime: string;
}

/** 搜索参数接口 */
interface SearchParam {
  pageNum: number;
  pageSize: number;
}

const historyStore = useHistoryStore();

/** 加载更多状态 */
const loadingType = ref<'loadmore' | 'loading' | 'nomore'>('loadmore');
/** 商品列表 */
const productList = ref<ReadHistory[]>([]);
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
 * 加载浏览历史列表，支持下拉刷新和上滑加载
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
    const data = await historyStore.fetchList(searchParam);
    const dataList = (data as any)?.list || [];

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
      productList.value = productList.value.concat(dataList);
    }

    if (type === 'refresh') {
      if (loading === 1) {
        uni.hideLoading();
      } else {
        uni.stopPullDownRefresh();
      }
    }
  } catch (error) {
    console.error('加载浏览历史列表失败:', error);
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
 * 跳转到商品详情页
 */
const navToDetailPage = (item: ReadHistory) => {
  const id = item.productId;
  uni.navigateTo({
    url: `/pages-sub/product/product?id=${id}`,
  });
};
</script>

<style lang="scss" scoped>
page,
.content {
  background: var(--color-bg-grey);
}

.hot-section {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16rpx;
  padding: 0 30rpx;
  background: var(--color-bg);

  .guess-item {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding-bottom: 40rpx;
  }

  .image-wrapper {
    width: 30%;
    height: 250rpx;
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

  .price {
    color: var(--color-primary);
    font-size: 36rpx;
    line-height: 80rpx;
  }

  .txt {
    display: flex;
    flex-direction: column;
    width: 70%;
    padding-left: 40rpx;
  }

  .hor-txt {
    display: flex;
    justify-content: space-between;
  }

  .time {
    color: var(--color-text);
    font-size: 24rpx;
    line-height: 80rpx;
  }
}
</style>
