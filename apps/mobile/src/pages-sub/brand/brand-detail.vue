<template>
  <view>
    <!-- 顶部大图 -->
    <view class="top-image">
      <view class="image-wrapper">
        <image :src="brand.bigPic" class="loaded" mode="aspectFill"></image>
      </view>
    </view>
    <!-- 品牌信息 -->
    <view class="info">
      <view class="image-wrapper">
        <image :src="brand.logo" class="loaded" mode="aspectFit"></image>
      </view>
      <view class="title">
        <text :class="{ Skeleton: !loaded }">{{ brand.name }}</text>
        <text :class="{ Skeleton: !loaded }">
          品牌首字母：{{ brand.firstLetter }}
        </text>
      </view>
      <view @click="favorite()">
        <uni-icons
          :type="favoriteStatus ? 'heart-filled' : 'heart'"
          size="24"
        />
      </view>
    </view>
    <!-- 品牌故事 -->
    <view class="section-tit">品牌故事</view>
    <view class="brand-story">
      <text class="text">{{ brand.brandStory }}</text>
    </view>
    <!-- 相关商品 -->
    <view class="section-tit">相关商品</view>
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
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '品牌详情',
    enablePullDownRefresh: true,
  },
});
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref, reactive, computed } from 'vue';
import { ULoadMore } from '@/components';
import { useBrandStore, useAttentionStore, useUserStore } from '@/store';

const brandStore = useBrandStore();
const attentionStore = useAttentionStore();

/**
 * 品牌详情页面
 * 显示品牌信息、品牌故事、相关商品列表
 * 支持品牌关注/取消关注
 * 支持商品列表下拉刷新、上拉加载更多
 */

/** 品牌信息接口 */
interface Brand {
  id?: number;
  name?: string;
  firstLetter?: string;
  logo?: string;
  bigPic?: string;
  brandStory?: string;
}

/** 商品项接口 */
interface Product {
  id: number;
  name: string;
  subTitle: string;
  pic: string;
  price: number;
  sale: number;
}

/** 查询参数接口 */
interface QueryParam {
  brandId: number | null;
  pageNum: number;
  pageSize: number;
}

const userStore = useUserStore();

/** 是否已登录 */
const hasLogin = computed(() => userStore.hasLogin);

/** 是否加载完成 */
const loaded = ref(false);
/** 品牌信息 */
const brand = reactive<Brand>({});
/** 商品列表 */
const productList = ref<Product[]>([]);
/** 加载更多状态 */
const loadingType = ref<'loadmore' | 'loading' | 'nomore'>('loadmore');
/** 收藏状态 */
const favoriteStatus = ref(false);
/** 查询参数 */
const queryParam = reactive<QueryParam>({
  brandId: null,
  pageNum: 1,
  pageSize: 4,
});

/**
 * 页面加载
 */
onLoad((options) => {
  loaded.value = true;
  const id = +(options?.id || 0);

  brandStore
    .fetchDetail(id)
    .then((data) => {
      Object.assign(brand, data);
      initBrandAttention();
    })
    .catch((error) => {
      console.error('加载品牌详情失败:', error);
    });

  queryParam.brandId = id;
  loadData('refresh');
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
  queryParam.pageNum++;
  loadData();
});

/**
 * 收藏/取消收藏
 */
const favorite = () => {
  if (!checkForLogin()) {
    return;
  }

  if (favoriteStatus.value) {
    // 取消关注
    attentionStore
      .remove(brand.id!)
      .then(() => {
        uni.showToast({
          title: '取消收藏成功！',
          icon: 'none',
        });
        favoriteStatus.value = false;
      })
      .catch((error) => {
        console.error('取消收藏失败:', error);
      });
  } else {
    // 关注
    const dto = {
      brandId: brand.id!,
      brandName: brand.name || '',
      brandLogo: brand.logo || '',
      brandCity: '',
    };
    attentionStore
      .create(dto)
      .then(() => {
        uni.showToast({
          title: '收藏成功！',
          icon: 'none',
        });
        favoriteStatus.value = true;
      })
      .catch((error) => {
        console.error('收藏失败:', error);
      });
  }
};

/**
 * 跳转到商品详情页
 */
const navToDetailPage = (item: Product) => {
  const id = item.id;
  uni.navigateTo({
    url: `/pages-sub/product/product?id=${id}`,
  });
};

/**
 * 加载商品列表，支持下拉刷新和上滑加载
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
    queryParam.pageNum = 1;
    productList.value = [];
  }

  try {
    const result = await brandStore.fetchProductList(queryParam.brandId!, {
      pageNum: queryParam.pageNum,
      pageSize: queryParam.pageSize,
    });
    const dataList = result?.list || [];

    if (dataList.length === 0) {
      // 没有更多了
      loadingType.value = 'nomore';
      queryParam.pageNum--;
    } else {
      if (dataList.length < queryParam.pageSize) {
        loadingType.value = 'nomore';
        queryParam.pageNum--;
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
    console.error('加载商品列表失败:', error);
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
 * 初始化收藏状态
 */
const initBrandAttention = () => {
  if (hasLogin.value && brand.id) {
    // 通过获取关注列表并过滤当前品牌来判断是否已关注
    attentionStore
      .fetchList({ pageNum: 1, pageSize: 100 })
      .then((data) => {
        const list = data?.list || [];
        favoriteStatus.value = list.some(
          (item: any) => item.brandId === brand.id,
        );
      })
      .catch((error) => {
        console.error('加载收藏状态失败:', error);
      });
  }
};

/**
 * 检查登录状态并弹出登录框
 */
const checkForLogin = (): boolean => {
  if (!hasLogin.value) {
    uni.showModal({
      title: '提示',
      content: '你还没登录，是否要登录？',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: '/pages/login/index',
          });
        }
      },
    });
    return false;
  }
  return true;
};
</script>

<style lang="scss" scoped>
page {
  background: var(--color-bg-grey);
}

.top-image {
  height: 200px;

  .image-wrapper {
    display: flex;
    place-content: center center;
    width: 100%;
    height: 100%;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
  }
}

.info {
  display: flex;
  align-items: center;
  margin-top: 16rpx;
  padding: 30rpx 50rpx;
  background: var(--color-bg);

  .image-wrapper {
    width: 210rpx;
    height: 70rpx;
    background: var(--color-bg);

    image {
      width: 100%;
      height: 100%;
    }
  }

  .title {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-left: 30rpx;
    color: var(--color-text);
    font-size: 40rpx;

    text:last-child {
      margin-top: 8rpx;
      color: var(--color-text-secondary);
      font-size: 24rpx;

      &.Skeleton {
        width: 220rpx;
      }
    }
  }

  uni-icons {
    margin: 0 10rpx 0 30rpx;
  }
}

.brand-story {
  display: flex;
  padding: 30rpx;
  background: var(--color-bg);

  .text {
    color: var(--color-text-secondary);
    font-size: 24rpx;
  }
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
