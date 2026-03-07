<template>
  <view class="container">
    <!-- 小程序头部兼容 -->
    <!-- #ifdef MP -->
    <view class="mp-search-box">
      <input class="ser-input" type="text" value="输入关键字搜索" disabled />
    </view>
    <!-- #endif -->

    <!-- 头部轮播 -->
    <view class="carousel-section">
      <!-- 标题栏和状态栏占位符 -->
      <view class="titleNview-placing"></view>
      <!-- 背景色区域 -->
      <view
        class="titleNview-background"
        :style="{ backgroundColor: titleNViewBackground }"
      ></view>
      <swiper class="carousel" circular @change="handleSwiperChange">
        <swiper-item
          v-for="(item, index) in state.advertiseList"
          :key="index"
          class="carousel-item"
          @click="navToAdvertisePage(item)"
        >
          <image :src="item.pic" />
        </swiper-item>
      </swiper>
      <!-- 自定义swiper指示器 -->
      <view class="swiper-dots">
        <text class="num">{{ state.swiperCurrent + 1 }}</text>
        <text class="sign">/</text>
        <text class="num">{{ state.swiperLength }}</text>
      </view>
    </view>

    <!-- 头部功能区 -->
    <view class="cate-section">
      <view class="cate-item">
        <image src="/static/temp/c3.png"></image>
        <text>专题</text>
      </view>
      <view class="cate-item">
        <image src="/static/temp/c5.png"></image>
        <text>话题</text>
      </view>
      <view class="cate-item">
        <image src="/static/temp/c6.png"></image>
        <text>优选</text>
      </view>
      <view class="cate-item">
        <image src="/static/temp/c7.png"></image>
        <text>特惠</text>
      </view>
    </view>

    <!-- 品牌制造商直供 -->
    <view class="f-header m-t" @click="navToRecommendBrandPage">
      <image src="/static/icon_home_brand.png"></image>
      <view class="tit-box">
        <text class="tit">品牌制造商直供</text>
        <text class="tit2">工厂直达消费者，剔除品牌溢价</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>

    <view class="guess-section">
      <view
        v-for="(item, index) in state.brandList"
        :key="index"
        class="guess-item"
        @click="navToBrandDetailPage(item)"
      >
        <view class="image-wrapper-brand">
          <image :src="item.logo" mode="aspectFit"></image>
        </view>
        <text class="title clamp">{{ item.name }}</text>
        <text class="title2">商品数量:{{ item.productCount }}</text>
      </view>
    </view>

    <!-- 秒杀专区 -->
    <view v-if="state.homeFlashPromotion !== null" class="f-header m-t">
      <image src="/static/icon_flash_promotion.png"></image>
      <view class="tit-box">
        <text class="tit">秒杀专区</text>
        <text class="tit2">
          下一场
          {{ formatTime(state.homeFlashPromotion.nextStartTime) }} 开始
        </text>
      </view>
      <view class="tit-box">
        <text class="tit2" style="text-align: right">本场结束剩余:</text>
        <view style="text-align: right">
          <text class="hour timer">{{ cutDownTime.endHour }}</text>
          <text>:</text>
          <text class="minute timer">{{ cutDownTime.endMinute }}</text>
          <text>:</text>
          <text class="second timer">{{ cutDownTime.endSecond }}</text>
        </view>
      </view>
      <text v-show="false" class="yticon icon-you"></text>
    </view>

    <view v-if="state.homeFlashPromotion?.productList" class="guess-section">
      <view
        v-for="(item, index) in state.homeFlashPromotion.productList"
        :key="index"
        class="guess-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.pic" mode="aspectFill"></image>
        </view>
        <text class="title clamp">{{ item.name }}</text>
        <text class="title2 clamp">{{ item.subTitle }}</text>
        <text class="price">¥{{ item.price }}</text>
      </view>
    </view>

    <!-- 新鲜好物 -->
    <view class="f-header m-t" @click="navToNewProductListPage">
      <image src="/static/icon_new_product.png"></image>
      <view class="tit-box">
        <text class="tit">新鲜好物</text>
        <text class="tit2">为你寻觅世间好物</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>
    <view class="seckill-section">
      <scroll-view class="floor-list" scroll-x>
        <view class="scoll-wrapper">
          <view
            v-for="(item, index) in state.newProductList"
            :key="index"
            class="floor-item"
            @click="navToDetailPage(item)"
          >
            <image :src="item.pic" mode="aspectFill"></image>
            <text class="title clamp">{{ item.name }}</text>
            <text class="title2 clamp">{{ item.subTitle }}</text>
            <text class="price">¥{{ item.price }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 人气推荐楼层 -->
    <view class="f-header m-t" @click="navToHotProductListPage">
      <image src="/static/icon_hot_product.png"></image>
      <view class="tit-box">
        <text class="tit">人气推荐</text>
        <text class="tit2">大家都赞不绝口的</text>
      </view>
      <text class="yticon icon-you"></text>
    </view>

    <view class="hot-section">
      <view
        v-for="(item, index) in state.hotProductList"
        :key="index"
        class="guess-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.pic" mode="aspectFill"></image>
        </view>
        <view class="txt">
          <text class="title clamp">{{ item.name }}</text>
          <text class="title2">{{ item.subTitle }}</text>
          <text class="price">¥{{ item.price }}</text>
        </view>
      </view>
    </view>

    <!-- 猜你喜欢-->
    <view class="f-header m-t">
      <image src="/static/icon_recommend_product.png"></image>
      <view class="tit-box">
        <text class="tit">猜你喜欢</text>
        <text class="tit2">你喜欢的都在这里了</text>
      </view>
      <text v-show="false" class="yticon icon-you"></text>
    </view>

    <view class="guess-section">
      <view
        v-for="(item, index) in state.recommendProductList"
        :key="index"
        class="guess-item"
        @click="navToDetailPage(item)"
      >
        <view class="image-wrapper">
          <image :src="item.pic" mode="aspectFill"></image>
        </view>
        <text class="title clamp">{{ item.name }}</text>
        <text class="title2 clamp">{{ item.subTitle }}</text>
        <text class="price">¥{{ item.price }}</text>
      </view>
    </view>
    <uni-load-more :status="state.loadingType"></uni-load-more>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: 'Mall商城',
    enablePullDownRefresh: true,
    'app-plus': {
      titleNView: {
        type: 'transparent',
        searchInput: {
          backgroundColor: 'rgba(231, 231, 231,.7)',
          borderRadius: '16px',
          placeholder: '请输入商品 如：手机',
          disabled: true,
          placeholderColor: '#606266',
        },
        buttons: [
          {
            fontSrc: '/static/yticon.ttf',
            text: '\ue60d',
            fontSize: '26',
            color: '#303133',
            float: 'left',
            background: 'rgba(0,0,0,0)',
          },
          {
            fontSrc: '/static/yticon.ttf',
            text: '\ue744',
            fontSize: '27',
            color: '#303133',
            background: 'rgba(0,0,0,0)',
            redDot: true,
          },
        ],
      },
    },
  },
});
/**
 * 首页组件
 * 功能：
 * 1. 展示广告轮播图
 * 2. 展示品牌制造商信息
 * 3. 展示秒杀专区（含倒计时）
 * 4. 展示新鲜好物、人气推荐、猜你喜欢等商品列表
 * 5. 支持下拉刷新和上拉加载更多
 */

import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { reactive, computed, ref } from 'vue';
import { HomeService } from '@/api';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
import type { HomeAdvertise, HomeBrand, Product } from '@/interface';
import { formatDateTime } from '@/utils/formatters';

// 类型定义
interface FlashPromotion {
  /** 秒杀活动结束时间 */
  endTime: string;
  /** 下一场秒杀开始时间 */
  nextStartTime: string;
  /** 秒杀商品列表 */
  productList: Product[];
}

interface CountDownTime {
  /** 剩余小时数 */
  endHour: number;
  /** 剩余分钟数 */
  endMinute: number;
  /** 剩余秒数 */
  endSecond: number;
}

interface PageState {
  /** 顶部背景色 */
  titleNViewBackground: string;
  /** 轮播图当前索引 */
  swiperCurrent: number;
  /** 轮播图总数 */
  swiperLength: number;
  /** 广告列表 */
  advertiseList: HomeAdvertise[];
  /** 品牌列表 */
  brandList: HomeBrand[];
  /** 秒杀活动信息 */
  homeFlashPromotion: FlashPromotion | null;
  /** 新品列表 */
  newProductList: Product[];
  /** 热门商品列表 */
  hotProductList: Product[];
  /** 推荐商品列表 */
  recommendProductList: Product[];
  /** 加载状态 */
  loadingType: 'more' | 'loading' | 'noMore';
}

interface RecommendParams {
  /** 当前页码 */
  pageNum: number;
  /** 每页大小 */
  pageSize: number;
}

// 顶部背景色列表
const titleNViewBackgroundList = ['rgb(203, 87, 60)', 'rgb(205, 215, 218)'];

// 响应式数据
const state = reactive<PageState>({
  titleNViewBackground: '',
  swiperCurrent: 0,
  swiperLength: 0,
  advertiseList: [],
  brandList: [],
  homeFlashPromotion: null,
  newProductList: [],
  hotProductList: [],
  recommendProductList: [],
  loadingType: 'more',
});

// 推荐商品分页参数
const recommendParams = reactive<RecommendParams>({
  pageNum: 1,
  pageSize: 4,
});

/**
 * 计算属性：秒杀倒计时
 * 根据秒杀结束时间计算剩余时间
 */
const cutDownTime = computed<CountDownTime>(() => {
  if (!state.homeFlashPromotion?.endTime) {
    return { endHour: 0, endMinute: 0, endSecond: 0 };
  }

  const endTime = new Date(state.homeFlashPromotion.endTime);
  const endDateTime = new Date();
  const startDateTime = new Date();

  // 设置结束时间
  endDateTime.setHours(endTime.getHours());
  endDateTime.setMinutes(endTime.getMinutes());
  endDateTime.setSeconds(endTime.getSeconds());

  // 计算时间差
  const offsetTime = endDateTime.getTime() - startDateTime.getTime();

  // 计算小时、分钟、秒
  const endHour = Math.floor(offsetTime / (60 * 60 * 1000));
  const offsetMinute = offsetTime % (60 * 60 * 1000);
  const endMinute = Math.floor(offsetMinute / (60 * 1000));
  const offsetSecond = offsetTime % (60 * 1000);
  const endSecond = Math.floor(offsetSecond / 1000);

  return {
    endHour,
    endMinute,
    endSecond,
  };
});

/**
 * 格式化时间
 * 将时间字符串格式化为 HH:mm:ss 格式
 * @param time - 时间字符串
 * @returns 格式化后的时间字符串
 */
const formatTime = (time: string | null | undefined): string => {
  if (!time) {
    return 'N/A';
  }
  return formatDateTime(time, 'HH:mm:ss');
};

/**
 * 加载首页数据
 * 包括广告、品牌、秒杀、新品、热门、推荐等数据
 */
const loadData = async (): Promise<void> => {
  try {
    const response = await HomeService.fetchContent();

    // 设置广告列表和轮播图配置
    state.advertiseList = response.data.advertiseList || [];
    state.swiperLength = state.advertiseList.length;
    state.titleNViewBackground = titleNViewBackgroundList[0];

    // 设置其他数据
    state.brandList = response.data.brandList || [];
    state.homeFlashPromotion = response.data.homeFlashPromotion || null;
    state.newProductList = response.data.newProductList || [];
    state.hotProductList = response.data.hotProductList || [];

    // 加载推荐商品列表
    const recommendResponse =
      await HomeService.fetchRecommendProductList(recommendParams);
    state.recommendProductList = recommendResponse.data || [];

    // 停止下拉刷新
    uni.stopPullDownRefresh();
  } catch (error) {
    console.error('首页数据加载失败', error);
    uni.stopPullDownRefresh();
  }
};

/**
 * 轮播图切换事件处理
 * 根据当前索引切换背景色
 * @param e - 轮播图切换事件
 */
const handleSwiperChange = (e: any): void => {
  const index = e.detail.current;
  state.swiperCurrent = index;
  const changeIndex = index % titleNViewBackgroundList.length;
  state.titleNViewBackground = titleNViewBackgroundList[changeIndex];
};

/**
 * 导航到商品详情页
 * @param item - 商品信息
 */
const navToDetailPage = (item: Product): void => {
  const id = item.id;
  uni.navigateTo({
    url: `/pages/product/product?id=${id}`,
  });
};

/**
 * 导航到广告详情页
 * @param item - 广告信息
 */
const navToAdvertisePage = (item: HomeAdvertise): void => {
  const id = item.id;
  // TODO: 实现广告详情页跳转逻辑
};

/**
 * 导航到品牌详情页
 * @param item - 品牌信息
 */
const navToBrandDetailPage = (item: HomeBrand): void => {
  const id = item.id;
  uni.navigateTo({
    url: `/pages/brand/brandDetail?id=${id}`,
  });
};

/**
 * 导航到推荐品牌列表页
 */
const navToRecommendBrandPage = (): void => {
  uni.navigateTo({
    url: '/pages/brand/list',
  });
};

/**
 * 导航到新鲜好物列表页
 */
const navToNewProductListPage = (): void => {
  uni.navigateTo({
    url: '/pages-sub/product/newProductList',
  });
};

/**
 * 导航到人气推荐列表页
 */
const navToHotProductListPage = (): void => {
  uni.navigateTo({
    url: '/pages-sub/product/hotProductList',
  });
};

/**
 * 页面加载时的生命周期钩子
 */
onLoad(() => {
  loadData();
});

/**
 * 下拉刷新的生命周期钩子
 * 重置页码并重新加载数据
 */
onPullDownRefresh(() => {
  recommendParams.pageNum = 1;
  loadData();
});

/**
 * 上拉加载更多的生命周期钩子
 * 加载下一页推荐商品
 */
onReachBottom(() => {
  recommendParams.pageNum++;
  state.loadingType = 'loading';

  HomeService.fetchRecommendProductList(recommendParams)
    .then((response) => {
      const addProductList = response.data;
      if (!addProductList || addProductList.length === 0) {
        // 没有更多数据了
        recommendParams.pageNum--;
        state.loadingType = 'noMore';
      } else {
        // 追加新数据
        state.recommendProductList =
          state.recommendProductList.concat(addProductList);
        state.loadingType = 'more';
      }
    })
    .catch((error) => {
      console.error('加载推荐商品失败', error);
      recommendParams.pageNum--;
      state.loadingType = 'more';
    });
});

// #ifndef MP
// 标题栏input搜索框点击（非小程序平台）
const onNavigationBarSearchInputClicked = async (e: any): Promise<void> => {
  // TODO: 实现搜索功能
};

// 点击导航栏 buttons 时触发（非小程序平台）
const onNavigationBarButtonTap = (e: any): void => {
  const index = e.index;
  if (index === 0) {
    // TODO: 实现扫描功能
  } else if (index === 1) {
    // #ifdef APP-PLUS
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    const currentWebview = page.$getAppWebview();
    currentWebview.hideTitleNViewButtonRedDot({
      index,
    });
    // #endif
    uni.navigateTo({
      url: '/pages/notice/notice',
    });
  }
};
// #endif
</script>

<style lang="scss">
/* #ifdef MP */
.mp-search-box {
  position: absolute;
  z-index: 9999;
  top: 30upx;
  left: 0;
  width: 100%;
  padding: 0 80upx;

  .ser-input {
    flex: 1;
    height: 56upx;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.6);
    color: $font-color-base;
    font-size: 28upx;
    line-height: 56upx;
    text-align: center;
  }
}

page {
  background: #f5f5f5;

  .cate-section {
    position: relative;
    z-index: 5;
    margin-top: -20upx;
    border-radius: 16upx 16upx 0 0;
  }

  .carousel-section {
    padding: 0;

    .titleNview-placing {
      height: 0;
      padding-top: 0;
    }

    .carousel {
      .carousel-item {
        padding: 0;
      }
    }

    .swiper-dots {
      bottom: 40upx;
      left: 45upx;
    }
  }
}

/* #endif */

.m-t {
  margin-top: 16upx;
}

/* 头部 轮播图 */
.carousel-section {
  position: relative;
  padding-top: 10px;

  .titleNview-placing {
    box-sizing: content-box;
    height: var(--status-bar-height);
    padding-top: 44px;
  }

  .titleNview-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 426upx;
    transition: 0.4s;
  }
}

.carousel {
  width: 100%;
  height: 350upx;

  .carousel-item {
    width: 100%;
    height: 100%;
    padding: 0 28upx;
    overflow: hidden;
  }

  image {
    width: 100%;
    height: 100%;
    border-radius: 10upx;
  }
}

.swiper-dots {
  display: flex;
  position: absolute;
  bottom: 15upx;
  left: 60upx;
  width: 72upx;
  height: 36upx;
  background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk4MzlBNjE0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk4MzlBNjA0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0E3RUNERkE0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0E3RUNERkI0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4Gh5BPAAACTUlEQVR42uzcQW7jQAwFUdN306l1uWwNww5kqdsmm6/2MwtVCp8CosQtP9vg/2+/gY+DRAMBgqnjIp2PaCxCLLldpPARRIiFj1yBbMV+cHZh9PURRLQNhY8kgWyL/WDtwujjI8hoE8rKLqb5CDJaRMJHokC6yKgSCR9JAukmokIknCQJpLOIrJFwMsBJELFcKHwM9BFkLBMKFxNcBCHlQ+FhoocgpVwwnv0Xn30QBJGMC0QcaBVJiAMiec/dcwKuL4j1QMsVCXFAJE4s4NQA3K/8Y6DzO4g40P7UcmIBJxbEesCKWBDg8wWxHrAiFgT4fEGsB/CwIhYE+AeBAAdPLOcV8HRmWRDAiQVcO7GcV8CLM8uCAE4sQCDAlHcQ7x+ABQEEAggEEAggEEAggEAAgQACASAQQCCAQACBAAIBBAIIBBAIIBBAIABe4e9iAe/xd7EAJxYgEGDeO4j3EODp/cOCAE4sYMyJ5cwCHs4rCwI4sYBxJ5YzC84rCwKcXxArAuthQYDzC2JF0H49LAhwYUGsCFqvx5EF2T07dMaJBetx4cRyaqFtHJ8EIhK0i8OJBQxcECuCVutxJhCRoE0cZwMRyRcFefa/ffZBVPogePihhyCnbBhcfMFFEFM+DD4m+ghSlgmDkwlOgpAl4+BkkJMgZdk4+EgaSCcpVX7bmY9kgXQQU+1TgE0c+QJZUUz1b2T4SBbIKmJW+3iMj2SBVBWz+leVfCQLpIqYbp8b85EskIxyfIOfK5Sf+wiCRJEsllQ+oqEkQfBxmD8BBgA5hVjXyrBNUQAAAABJRU5ErkJggg==');
  background-size: 100% 100%;

  .num {
    width: 36upx;
    height: 36upx;
    border-radius: 50px;
    color: #fff;
    font-size: 24upx;
    line-height: 36upx;
    text-align: center;
  }

  .sign {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    color: #fff;
    font-size: 12upx;
    line-height: 36upx;
  }
}

/* 分类 */
.cate-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-around;
  padding: 30upx 22upx;
  background: #fff;

  .cate-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: $font-color-dark;
    font-size: $font-sm + 2upx;
  }

  /* 原图标颜色太深,不想改图了,所以加了透明度 */
  image {
    width: 88upx;
    height: 88upx;
    margin-bottom: 14upx;
    border-radius: 50%;
    opacity: 0.7;
    box-shadow: 4upx 4upx 20upx rgba(250, 67, 106, 0.3);
  }
}

.ad-1 {
  width: 100%;
  height: 210upx;
  padding: 10upx 0;
  background: #fff;

  image {
    width: 100%;
    height: 100%;
  }
}

/* 秒杀专区 */
.seckill-section {
  padding: 4upx 30upx 24upx;
  background: #fff;

  .s-header {
    display: flex;
    align-items: center;
    height: 92upx;
    line-height: 1;

    .s-img {
      width: 140upx;
      height: 30upx;
    }

    .tip {
      margin: 0 20upx 0 40upx;
      color: $font-color-light;
      font-size: $font-base;
    }

    .timer {
      display: inline-block;
      width: 40upx;
      height: 36upx;
      margin-right: 14upx;
      border-radius: 2px;
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      font-size: $font-sm + 2upx;
      line-height: 36upx;
      text-align: center;
    }

    .icon-you {
      flex: 1;
      color: $font-color-light;
      font-size: $font-lg;
      text-align: right;
    }
  }

  .floor-list {
    white-space: nowrap;
  }

  .scoll-wrapper {
    display: flex;
    align-items: flex-start;
  }

  .floor-item {
    width: 300upx;
    margin-right: 20upx;
    color: $font-color-dark;
    font-size: $font-sm + 2upx;
    line-height: 1.8;

    image {
      width: 300upx;
      height: 300upx;
      border-radius: 6upx;
    }

    .price {
      color: $uni-color-primary;
    }
  }

  .title2 {
    color: $font-color-light;
    font-size: $font-sm;
    line-height: 40upx;
  }
}

.f-header {
  display: flex;
  align-items: center;
  height: 140upx;
  padding: 6upx 30upx 8upx;
  background: #fff;

  image {
    flex-shrink: 0;
    width: 80upx;
    height: 80upx;
    margin-right: 20upx;
  }

  .tit-box {
    display: flex;
    flex: 1;
    flex-direction: column;
  }

  .tit {
    color: $font-color-dark;
    font-size: $font-lg + 2upx;
    line-height: 1.3;
  }

  .tit2 {
    color: $font-color-light;
    font-size: $font-sm;
  }

  .icon-you {
    color: $font-color-light;
    font-size: $font-lg + 2upx;
  }

  .timer {
    display: inline-block;
    width: 40upx;
    height: 36upx;
    margin-right: 14upx;
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    font-size: $font-sm + 2upx;
    line-height: 36upx;
    text-align: center;
  }
}

/* 分类推荐楼层 */
.hot-floor {
  width: 100%;
  margin-bottom: 20upx;
  overflow: hidden;

  .floor-img-box {
    position: relative;
    width: 100%;
    height: 320upx;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(rgba(255, 255, 255, 0.06) 30%, #f8f8f8);
    }
  }

  .floor-img {
    width: 100%;
    height: 100%;
  }

  .floor-list {
    position: relative;
    z-index: 1;
    margin-top: -140upx;
    margin-left: 30upx;
    padding: 20upx;
    padding-right: 50upx;
    border-radius: 6upx;
    background: #fff;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
  }

  .scoll-wrapper {
    display: flex;
    align-items: flex-start;
  }

  .floor-item {
    width: 180upx;
    margin-right: 20upx;
    color: $font-color-dark;
    font-size: $font-sm + 2upx;
    line-height: 1.8;

    image {
      width: 180upx;
      height: 180upx;
      border-radius: 6upx;
    }

    .price {
      color: $uni-color-primary;
    }
  }

  .more {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 180upx;
    height: 180upx;
    border-radius: 6upx;
    background: #f3f3f3;
    color: $font-color-light;
    font-size: $font-base;

    text:first-child {
      margin-bottom: 4upx;
    }
  }
}

/* 猜你喜欢 */
.guess-section {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30upx;
  background: #fff;

  .guess-item {
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

  .image-wrapper-brand {
    width: 100%;
    height: 150upx;
    overflow: hidden;
    border-radius: 3px;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    color: $font-color-dark;
    font-size: $font-lg;
    line-height: 80upx;
  }

  .title2 {
    color: $font-color-light;
    font-size: $font-sm;
    line-height: 40upx;
  }

  .price {
    color: $uni-color-primary;
    font-size: $font-lg;
    line-height: 1;
  }
}

.hot-section {
  display: flex;
  flex-wrap: wrap;
  padding: 0 30upx;
  background: #fff;

  .guess-item {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding-bottom: 40upx;
  }

  .image-wrapper {
    width: 30%;
    height: 250upx;
    overflow: hidden;
    border-radius: 3px;

    image {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .title {
    color: $font-color-dark;
    font-size: $font-lg;
    line-height: 80upx;
  }

  .title2 {
    display: block;
    height: 80upx;
    overflow: hidden;
    color: $font-color-light;
    font-size: $font-sm;
    line-height: 40upx;
    text-overflow: ellipsis;
  }

  .price {
    color: $uni-color-primary;
    font-size: $font-lg;
    line-height: 80upx;
  }

  .txt {
    display: flex;
    flex-direction: column;
    width: 70%;
    padding-left: 40upx;
  }
}
</style>
