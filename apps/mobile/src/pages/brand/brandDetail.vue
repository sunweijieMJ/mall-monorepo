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
        <text :class="{ Skeleton: !loaded }"
          >品牌首字母：{{ brand.firstLetter }}</text
        >
      </view>
      <view>
        <text
          class="yticon icon-shoucang"
          :class="{ active: favoriteStatus }"
          @click="favorite()"
        ></text>
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
    <uni-load-more :status="loadingType"></uni-load-more>
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
import { BrandService, MemberBrandAttentionService } from '@/api';
import share from '@/components/share.vue';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import { useUserStore } from '@/store/user';

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
const loadingType = ref<'more' | 'loading' | 'nomore'>('more');
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

  BrandService.getBrandDetail(id)
    .then((response) => {
      Object.assign(brand, response.data);
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
    // 取消收藏
    MemberBrandAttentionService.deleteBrandAttention({ brandId: brand.id! })
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
    // 收藏
    const brandAttention = {
      brandId: brand.id!,
      brandName: brand.name || '',
      brandLogo: brand.logo || '',
      brandCity: '',
    };
    MemberBrandAttentionService.createBrandAttention(brandAttention)
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
    url: `/pages/product/product?id=${id}`,
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
    loadingType.value = 'more';
  }

  if (type === 'refresh') {
    queryParam.pageNum = 1;
    productList.value = [];
  }

  try {
    const response = await BrandService.fetchBrandProductList(queryParam);
    const dataList = response.data.list || [];

    if (dataList.length === 0) {
      // 没有更多了
      loadingType.value = 'nomore';
      queryParam.pageNum--;
    } else {
      if (dataList.length < queryParam.pageSize) {
        loadingType.value = 'nomore';
        queryParam.pageNum--;
      } else {
        loadingType.value = 'more';
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
    loadingType.value = 'more';
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
    MemberBrandAttentionService.brandAttentionDetail({ brandId: brand.id })
      .then((response) => {
        favoriteStatus.value = response.data != null;
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
            url: '/pages/public/login',
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
  background: #f8f8f8;
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
  margin-top: 16upx;
  padding: 30upx 50upx;
  background: #fff;

  .image-wrapper {
    width: 210upx;
    height: 70upx;
    background: #fff;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .title {
    display: flex;
    flex: 1;
    flex-direction: column;
    margin-left: 30upx;
    color: #303133;
    font-size: 40upx;

    text:last-child {
      margin-top: 8upx;
      color: #909399;
      font-size: 24upx;

      &.Skeleton {
        width: 220upx;
      }
    }
  }

  .yticon {
    margin: 0 10upx 0 30upx;
    color: #606266;
    font-size: 80upx;

    &.active {
      color: #ff4443;
    }
  }
}

.brand-story {
  display: flex;
  padding: 30upx;
  background: #fff;

  .text {
    color: #909399;
    font-size: 24upx;
  }
}

.actions {
  padding: 10upx 28upx;
  background: #fff;

  .yticon {
    padding: 10upx 12upx;
    color: #606266;
    font-size: 46upx;

    &.active {
      color: #ff4443;
    }

    &:nth-child(2) {
      font-size: 50upx;
    }
  }
}

.section-tit {
  margin-top: 16upx;
  padding-top: 20upx;
  padding-bottom: 20upx;
  background: #fff;
  color: #303133;
  font-size: 32upx;
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

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    color: #303133;
    font-size: 36upx;
    line-height: 80upx;
  }

  .title2 {
    display: block;
    height: 80upx;
    overflow: hidden;
    color: #909399;
    font-size: 24upx;
    line-height: 40upx;
    text-overflow: ellipsis;
  }

  .price-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-right: 10upx;
    color: #909399;
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
