<template>
  <view class="content">
    <!-- 空白页 -->
    <empty v-if="brandList == null || brandList.length === 0"></empty>
    <view class="hot-section">
      <view
        v-for="(item, index) in brandList"
        :key="index"
        class="guess-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.brandLogo" mode="aspectFit"></image>
        </view>
        <view class="txt">
          <text class="title clamp">{{ item.brandName }}</text>
        </view>
      </view>
    </view>
    <uni-load-more :status="loadingType"></uni-load-more>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '品牌关注',
  },
});
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { ref, reactive } from 'vue';
import { MemberBrandAttentionService } from '@/api';
import empty from '@/components/empty.vue';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';

/**
 * 品牌关注列表页面
 * 显示用户关注的品牌列表
 * 支持下拉刷新、上拉加载更多
 */

/** 品牌关注项接口 */
interface BrandAttention {
  brandId: number;
  brandName: string;
  brandLogo: string;
}

/** 搜索参数接口 */
interface SearchParam {
  pageNum: number;
  pageSize: number;
}

/** 加载更多状态 */
const loadingType = ref<'more' | 'loading' | 'nomore'>('more');
/** 品牌列表 */
const brandList = ref<BrandAttention[]>([]);
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
 * 加载品牌关注列表，支持下拉刷新和上滑加载
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
    brandList.value = [];
  }

  try {
    const response =
      await MemberBrandAttentionService.fetchBrandAttentionList(searchParam);
    const dataList = response.data.list || [];

    if (dataList.length === 0) {
      // 没有更多了
      loadingType.value = 'nomore';
      searchParam.pageNum--;
    } else {
      if (dataList.length < searchParam.pageSize) {
        loadingType.value = 'nomore';
        searchParam.pageNum--;
      } else {
        loadingType.value = 'more';
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
    console.error('加载品牌关注列表失败:', error);
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
 * 跳转到品牌详情页
 */
const navToDetailPage = (item: BrandAttention) => {
  const id = item.brandId;
  uni.navigateTo({
    url: `/pages/brand/brandDetail?id=${id}`,
  });
};
</script>

<style lang="scss" scoped>
page,
.content {
  background: #f8f8f8;
}

.hot-section {
  display: flex;
  flex-wrap: wrap;
  margin-top: 16upx;

  .guess-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    margin-bottom: 16upx;
    padding: 0 30upx;
    background-color: #fff;
  }

  .image-wrapper {
    width: 30%;
    height: 170upx;
    overflow: hidden;
    border-radius: 3px;
    background: #fff;

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

  .price {
    color: #fa436a;
    font-size: 36upx;
    line-height: 80upx;
  }

  .txt {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 70%;
    padding-left: 40upx;
  }

  .hor-txt {
    display: flex;
    justify-content: space-between;
  }

  .time {
    color: #303133;
    font-size: 24upx;
    line-height: 80upx;
  }
}
</style>
