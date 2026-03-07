<template>
  <view class="container">
    <view class="carousel">
      <swiper indicator-dots circular duration="400">
        <swiper-item
          v-for="(item, index) in imgList"
          :key="index"
          class="swiper-item"
        >
          <view class="image-wrapper">
            <image :src="item.src" class="loaded" mode="aspectFill"></image>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view class="introduce-section">
      <text class="title">{{ product.name }}</text
      ><br />
      <text class="title2">{{ product.subTitle }}</text>
      <view class="price-box">
        <text class="price-tip">¥</text>
        <text class="price">{{ product.price }}</text>
        <text class="m-price">¥{{ product.originalPrice }}</text>
      </view>
      <view class="bot-row">
        <text>销量: {{ product.sale }}</text>
        <text>库存: {{ product.stock }}</text>
        <text>浏览量: 768</text>
      </view>
    </view>

    <!-- 分享 -->
    <view class="share-section" @click="share">
      <view class="share-icon">
        <text class="yticon icon-xingxing"></text>
        返
      </view>
      <text class="tit">该商品分享可领49减10红包</text>
      <text class="yticon icon-bangzhu1"></text>
      <view class="share-btn">
        立即分享
        <text class="yticon icon-you"></text>
      </view>
    </view>

    <view class="c-list">
      <view class="c-row b-b" @click="toggleSpec">
        <text class="tit">购买类型</text>
        <view class="con">
          <text
            v-for="(sItem, sIndex) in specSelected"
            :key="sIndex"
            class="selected-text"
          >
            {{ sItem.name }}
          </text>
        </view>
        <text class="yticon icon-you"></text>
      </view>
      <view class="c-row b-b" @click="toggleAttr">
        <text class="tit">商品参数</text>
        <view class="con">
          <text class="con t-r">查看</text>
        </view>
        <text class="yticon icon-you"></text>
      </view>
      <view class="c-row b-b" @click="toggleCoupon('show')">
        <text class="tit">优惠券</text>
        <text class="con t-r red">领取优惠券</text>
        <text class="yticon icon-you"></text>
      </view>
      <view class="c-row b-b">
        <text class="tit">促销活动</text>
        <view class="con-list">
          <text v-for="item in promotionTipList" :key="item">{{ item }}</text>
        </view>
      </view>
      <view class="c-row b-b">
        <text class="tit">服务</text>
        <view class="bz-list con">
          <text v-for="item in serviceList" :key="item">{{ item }} ·</text>
        </view>
      </view>
    </view>

    <!-- 评价 -->
    <view class="eva-section">
      <view class="e-header">
        <text class="tit">评价</text>
        <text>(86)</text>
        <text class="tip">好评率 100%</text>
        <text class="yticon icon-you"></text>
      </view>
      <view class="eva-box">
        <image
          class="portrait"
          src="http://img3.imgtn.bdimg.com/it/u=1150341365,1327279810&fm=26&gp=0.jpg"
          mode="aspectFill"
        ></image>
        <view class="right">
          <text class="name">Leo yo</text>
          <text class="con">
            商品收到了，79元两件，质量不错，试了一下有点瘦，但是加个外罩很漂亮，我很喜欢
          </text>
          <view class="bot">
            <text class="attr">购买类型：XL 红色</text>
            <text class="time">2019-04-01 19:21</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 品牌信息 -->
    <view class="brand-info">
      <view class="d-header">
        <text>品牌信息</text>
      </view>
      <view class="brand-box" @click="navToBrandDetail()">
        <view class="image-wrapper">
          <image :src="brand.logo" class="loaded" mode="aspectFit"></image>
        </view>
        <view class="title">
          <text>{{ brand.name }}</text>
          <text>品牌首字母：{{ brand.firstLetter }}</text>
        </view>
      </view>
    </view>

    <view class="detail-desc">
      <view class="d-header">
        <text>图文详情</text>
      </view>
      <rich-text :nodes="desc"></rich-text>
    </view>

    <!-- 底部操作菜单 -->
    <view class="page-bottom">
      <navigator url="/pages/index/index" open-type="switchTab" class="p-b-btn">
        <text class="yticon icon-xiatubiao--copy"></text>
        <text>首页</text>
      </navigator>
      <navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
        <text class="yticon icon-gouwuche"></text>
        <text>购物车</text>
      </navigator>
      <view class="p-b-btn" :class="{ active: favorite }" @click="toFavorite">
        <text class="yticon icon-shoucang"></text>
        <text>收藏</text>
      </view>

      <view class="action-btn-group">
        <button
          type="primary"
          class="action-btn no-border buy-now-btn"
          @click="buy"
        >
          立即购买
        </button>
        <button
          type="primary"
          class="action-btn no-border add-cart-btn"
          @click="addToCart"
        >
          加入购物车
        </button>
      </view>
    </view>

    <!-- 规格-模态层弹窗 -->
    <view
      class="popup spec"
      :class="specClass"
      @touchmove.stop.prevent="stopPrevent"
      @click="toggleSpec"
    >
      <!-- 遮罩层 -->
      <view class="mask"></view>
      <view class="layer attr-content" @click.stop="stopPrevent">
        <view class="a-t">
          <image :src="product.pic"></image>
          <view class="right">
            <text class="price">¥{{ product.price }}</text>
            <text class="stock">库存：{{ product.stock }}件</text>
            <view class="selected">
              已选：
              <text
                v-for="(sItem, sIndex) in specSelected"
                :key="sIndex"
                class="selected-text"
              >
                {{ sItem.name }}
              </text>
            </view>
          </view>
        </view>
        <view v-for="(item, index) in specList" :key="index" class="attr-list">
          <text>{{ item.name }}</text>
          <view class="item-list">
            <text
              v-for="(childItem, childIndex) in getSpecChildren(item.id)"
              :key="childIndex"
              class="tit"
              :class="{ selected: childItem.selected }"
              @click="selectSpec(childIndex, childItem.pid)"
            >
              {{ childItem.name }}
            </text>
          </view>
        </view>
        <button class="btn" @click="toggleSpec">完成</button>
      </view>
    </view>
    <!-- 属性-模态层弹窗 -->
    <view
      class="popup spec"
      :class="attrClass"
      @touchmove.stop.prevent="stopPrevent"
      @click="toggleAttr"
    >
      <!-- 遮罩层 -->
      <view class="mask"></view>
      <view class="layer attr-content no-padding" @click.stop="stopPrevent">
        <view class="c-list">
          <view v-for="item in attrList" :key="item.key" class="c-row b-b">
            <text class="tit">{{ item.key }}</text>
            <view class="con">
              <text class="con t-r">{{ item.value }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 优惠券面板 -->
    <view
      class="mask"
      :class="couponState === 0 ? 'none' : couponState === 1 ? 'show' : ''"
      @click="toggleCoupon"
    >
      <view class="mask-content" @click.stop.prevent="stopPrevent">
        <!-- 优惠券页面，仿mt -->
        <view
          v-for="(item, index) in couponList"
          :key="index"
          class="coupon-item"
          @click="addCoupon(item)"
        >
          <view class="con">
            <view class="left">
              <text class="title">{{ item.name }}</text>
              <text class="time">
                有效期至{{ formatDateTime(item.endTime) }}
              </text>
            </view>
            <view class="right">
              <text class="price">{{ item.amount }}</text>
              <text>满{{ item.minPoint }}可用</text>
            </view>

            <view class="circle l"></view>
            <view class="circle circle-right"></view>
          </view>
          <text class="tips">{{ formatCouponUseType(item.useType) }}</text>
        </view>
      </view>
    </view>
    <!-- 分享 -->
    <ShareComponent
      ref="shareRef"
      :content-height="580"
      :share-list="shareList"
    ></ShareComponent>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '详情展示',
    'app-plus': {
      titleNView: {
        type: 'transparent',
      },
    },
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref, computed } from 'vue';
import {
  ProductService,
  CartService,
  CouponService,
  MemberReadHistoryService,
  MemberProductCollectionService,
} from '@/api';
import ShareComponent from '@/components/share.vue';
import { useUserStore } from '@/store/user';
import { formatDateTime } from '@/utils/formatters';

/**
 * 商品详情页面
 * 展示商品信息、规格选择、优惠券、评价、品牌信息等
 */

/** 服务列表常量 */
const defaultServiceList = [
  { id: 1, name: '无忧退货' },
  { id: 2, name: '快速退款' },
  { id: 3, name: '免费包邮' },
];

/** 分享列表常量 */
const defaultShareList = [
  { type: 1, icon: '/static/temp/share_wechat.png', text: '微信好友' },
  { type: 2, icon: '/static/temp/share_moment.png', text: '朋友圈' },
  { type: 3, icon: '/static/temp/share_qq.png', text: 'QQ好友' },
  { type: 4, icon: '/static/temp/share_qqzone.png', text: 'QQ空间' },
];

/** 图片项接口 */
interface ImgItem {
  src: string;
}

/** 规格项接口 */
interface SpecItem {
  id: number;
  name: string;
}

/** 规格子项接口 */
interface SpecChildItem {
  pid: number;
  pname: string;
  name: string;
  selected?: boolean;
}

/** 属性项接口 */
interface AttrItem {
  key: string;
  value: string;
}

/** 品牌信息接口 */
interface BrandInfo {
  id?: number;
  name?: string;
  firstLetter?: string;
  logo?: string;
}

/** 商品信息接口 */
interface ProductInfo {
  id?: number;
  name?: string;
  subTitle?: string;
  pic?: string;
  price?: number;
  originalPrice?: number;
  sale?: number;
  stock?: number;
  albumPics?: string;
  brandName?: string;
  productCategoryId?: number;
  productSn?: string;
  detailMobileHtml?: string;
  serviceIds?: string;
  promotionType?: number;
}

/** SKU库存信息接口 */
interface SkuStockItem {
  id: number;
  skuCode: string;
  price: number;
  promotionPrice?: number;
  stock: number;
  spData: string;
}

/** 优惠券信息接口 */
interface CouponItem {
  id: number;
  name: string;
  amount: number;
  minPoint: number;
  endTime: string;
  useType: number;
}

/** 商品属性接口 */
interface ProductAttribute {
  id: number;
  name: string;
  type: number;
  handAddStatus?: number;
  inputList?: string;
}

/** 商品属性值接口 */
interface ProductAttributeValue {
  productAttributeId: number;
  value: string;
}

/** 商品阶梯价格接口 */
interface ProductLadderItem {
  count: number;
  discount: number;
}

/** 商品满减接口 */
interface ProductFullReductionItem {
  fullPrice: number;
  reducePrice: number;
}

/** 商品详情响应接口 */
interface ProductDetailResponse {
  product: ProductInfo;
  brand: BrandInfo;
  skuStockList: SkuStockItem[];
  productAttributeList: ProductAttribute[];
  productAttributeValueList: ProductAttributeValue[];
  productLadderList?: ProductLadderItem[];
  productFullReductionList?: ProductFullReductionItem[];
}

/** 用户状态管理 */
const userStore = useUserStore();

/** 是否已登录 */
const hasLogin = computed(() => userStore.hasLogin);

/** 规格弹窗类名 */
const specClass = ref<'none' | 'show' | 'hide'>('none');
/** 属性弹窗类名 */
const attrClass = ref<'none' | 'show' | 'hide'>('none');
/** 已选规格 */
const specSelected = ref<SpecChildItem[]>([]);
/** 是否收藏 */
const favorite = ref(false);
/** 分享列表 */
const shareList = ref(defaultShareList);
/** 图片列表 */
const imgList = ref<ImgItem[]>([]);
/** 商品详情HTML */
const desc = ref('');
/** 规格列表 */
const specList = ref<SpecItem[]>([]);
/** 规格子项列表 */
const specChildList = ref<SpecChildItem[]>([]);
/** 按父级 ID 获取规格子项 */
const getSpecChildren = (pid: number) =>
  specChildList.value.filter((c) => c.pid === pid);
/** 商品信息 */
const product = ref<ProductInfo>({});
/** 品牌信息 */
const brand = ref<BrandInfo>({});
/** 服务列表 */
const serviceList = ref<string[]>([]);
/** SKU库存列表 */
const skuStockList = ref<SkuStockItem[]>([]);
/** 属性列表 */
const attrList = ref<AttrItem[]>([]);
/** 促销活动提示列表 */
const promotionTipList = ref<string[]>([]);
/** 优惠券状态 0-隐藏 1-显示 2-过渡 */
const couponState = ref(0);
/** 优惠券列表 */
const couponList = ref<CouponItem[]>([]);
/** 分享组件引用 */
const shareRef = ref<{ toggleMask: () => void } | null>(null);

/**
 * 页面加载时初始化数据
 */
onLoad((options) => {
  const id = options?.id;
  if (id) {
    loadData(Number(id));
  }
});

/**
 * 格式化优惠券使用类型
 */
const formatCouponUseType = (useType: number): string => {
  if (useType === 0) {
    return '全场通用';
  } else if (useType === 1) {
    return '指定分类商品可用';
  } else if (useType === 2) {
    return '指定商品可用';
  }
  return '';
};

/**
 * 加载商品数据
 */
const loadData = async (id: number) => {
  try {
    const response = await ProductService.fetchProductDetail(id);
    const data = response.data as ProductDetailResponse;
    product.value = data.product;
    skuStockList.value = data.skuStockList;
    brand.value = data.brand;
    initImgList();
    initServiceList();
    initSpecList(data);
    initAttrList(data);
    initPromotionTipList(data);
    initProductDesc();
    handleReadHistory();
    initProductCollection();
  } catch (error) {
    console.error('加载商品详情失败:', error);
  }
};

/**
 * 规格弹窗开关
 */
const toggleSpec = () => {
  if (specClass.value === 'show') {
    specClass.value = 'hide';
    setTimeout(() => {
      specClass.value = 'none';
    }, 250);
  } else if (specClass.value === 'none') {
    specClass.value = 'show';
  }
};

/**
 * 属性弹窗开关
 */
const toggleAttr = () => {
  if (attrClass.value === 'show') {
    attrClass.value = 'hide';
    setTimeout(() => {
      attrClass.value = 'none';
    }, 250);
  } else if (attrClass.value === 'none') {
    attrClass.value = 'show';
  }
};

/**
 * 优惠券弹窗开关
 */
const toggleCoupon = async (type?: string) => {
  if (!product.value.id) return;

  try {
    const response = await CouponService.fetchProductCouponList(
      product.value.id,
    );
    couponList.value = response.data || [];

    if (couponList.value.length === 0) {
      uni.showToast({
        title: '暂无可领优惠券',
        icon: 'none',
      });
      return;
    }

    const timer = type === 'show' ? 10 : 300;
    const state = type === 'show' ? 1 : 0;
    couponState.value = 2;
    setTimeout(() => {
      couponState.value = state;
    }, timer);
  } catch (error) {
    console.error('获取优惠券列表失败:', error);
  }
};

/**
 * 选择规格
 */
const selectSpec = (index: number, pid: number) => {
  const list = specChildList.value;
  list.forEach((item) => {
    if (item.pid === pid) {
      item.selected = false;
    }
  });

  list[index].selected = true;

  // 存储已选择
  specSelected.value = [];
  list.forEach((item) => {
    if (item.selected === true) {
      specSelected.value.push(item);
    }
  });
  changeSpecInfo();
};

/**
 * 领取优惠券
 */
const addCoupon = async (coupon: CouponItem) => {
  toggleCoupon();
  try {
    const response = await CouponService.addMemberCoupon(coupon.id);
    uni.showToast({
      title: '领取优惠券成功！',
      duration: 2000,
    });
  } catch (error) {
    console.error('领取优惠券失败:', error);
  }
};

/**
 * 分享
 */
const share = () => {
  shareRef.value?.toggleMask();
};

/**
 * 收藏/取消收藏
 */
const toFavorite = async () => {
  if (!checkForLogin()) {
    return;
  }

  if (!product.value.id) return;

  try {
    if (favorite.value) {
      // 取消收藏
      await MemberProductCollectionService.deleteProductCollection({
        productId: product.value.id,
      });
      uni.showToast({
        title: '取消收藏成功！',
        icon: 'none',
      });
      favorite.value = false;
    } else {
      // 收藏
      const productCollection = {
        productId: product.value.id,
        productName: product.value.name,
        productPic: product.value.pic,
        productPrice: product.value.price,
        productSubTitle: product.value.subTitle,
      };
      await MemberProductCollectionService.createProductCollection(
        productCollection,
      );
      uni.showToast({
        title: '收藏成功！',
        icon: 'none',
      });
      favorite.value = true;
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
  }
};

/**
 * 立即购买
 */
const buy = () => {
  uni.showToast({
    title: '暂时只支持从购物车下单！',
    icon: 'none',
  });
};

/**
 * 防止事件冒泡
 */
const stopPrevent = () => {};

/**
 * 设置头图信息
 */
const initImgList = () => {
  if (!product.value.albumPics) return;

  const tempPics = product.value.albumPics.split(',');
  if (product.value.pic) {
    tempPics.unshift(product.value.pic);
  }
  tempPics.forEach((item) => {
    if (item != null && item !== '') {
      imgList.value.push({ src: item });
    }
  });
};

/**
 * 设置服务信息
 */
const initServiceList = () => {
  if (!product.value.serviceIds) return;

  defaultServiceList.forEach((item) => {
    if (product.value.serviceIds?.indexOf(String(item.id)) !== -1) {
      serviceList.value.push(item.name);
    }
  });
};

/**
 * 设置商品规格
 */
const initSpecList = (data: ProductDetailResponse) => {
  for (let i = 0; i < data.productAttributeList.length; i++) {
    const item = data.productAttributeList[i];
    if (item.type === 0) {
      specList.value.push({
        id: item.id,
        name: item.name,
      });

      if (item.handAddStatus === 1) {
        // 支持手动新增的
        const valueList = data.productAttributeValueList;
        const filterValueList = valueList.filter(
          (value) => value.productAttributeId === item.id,
        );
        if (filterValueList.length > 0) {
          const inputList = filterValueList[0].value.split(',');
          inputList.forEach((input) => {
            specChildList.value.push({
              pid: item.id,
              pname: item.name,
              name: input,
            });
          });
        }
      } else if (item.handAddStatus === 0 && item.inputList) {
        // 不支持手动新增的
        const inputList = item.inputList.split(',');
        inputList.forEach((input) => {
          specChildList.value.push({
            pid: item.id,
            pname: item.name,
            name: input,
          });
        });
      }
    }
  }

  // 根据商品sku筛选出可用规格
  const availAbleSpecSet = new Set<string>();
  skuStockList.value.forEach((sku) => {
    const spDataArr = JSON.parse(sku.spData);
    spDataArr.forEach((sp: { value: string }) => {
      availAbleSpecSet.add(sp.value);
    });
  });

  specChildList.value = specChildList.value.filter((item) =>
    availAbleSpecSet.has(item.name),
  );

  // 规格默认选中第一条
  specList.value.forEach((item) => {
    for (const cItem of specChildList.value) {
      if (cItem.pid === item.id) {
        cItem.selected = true;
        specSelected.value.push(cItem);
        changeSpecInfo();
        break;
      }
    }
  });
};

/**
 * 设置商品参数
 */
const initAttrList = (data: ProductDetailResponse) => {
  data.productAttributeList.forEach((item) => {
    if (item.type === 1) {
      const valueList = data.productAttributeValueList;
      const filterValueList = valueList.filter(
        (value) => value.productAttributeId === item.id,
      );
      if (filterValueList.length > 0) {
        const value = filterValueList[0].value;
        attrList.value.push({
          key: item.name,
          value: value,
        });
      }
    }
  });
};

/**
 * 设置促销活动信息
 */
const initPromotionTipList = (data: ProductDetailResponse) => {
  const promotionType = product.value.promotionType;
  if (promotionType === 0) {
    promotionTipList.value.push('暂无优惠');
  } else if (promotionType === 1) {
    promotionTipList.value.push('单品优惠');
  } else if (promotionType === 2) {
    promotionTipList.value.push('会员优惠');
  } else if (promotionType === 3) {
    promotionTipList.value.push('多买优惠');
    data.productLadderList?.forEach((item) => {
      promotionTipList.value.push(`满${item.count}件打${item.discount * 10}折`);
    });
  } else if (promotionType === 4) {
    promotionTipList.value.push('满减优惠');
    data.productFullReductionList?.forEach((item) => {
      promotionTipList.value.push(
        `满${item.fullPrice}元减${item.reducePrice}元`,
      );
    });
  } else if (promotionType === 5) {
    promotionTipList.value.push('限时优惠');
  }
};

/**
 * 初始化商品详情信息
 */
const initProductDesc = () => {
  if (!product.value.detailMobileHtml) return;
  // uni-app环境下，rich-text可以直接接收HTML字符串
  // 不需要使用document操作
  desc.value = product.value.detailMobileHtml;
};

/**
 * 处理创建浏览记录
 */
const handleReadHistory = async () => {
  if (hasLogin.value && product.value.id) {
    const data = {
      productId: product.value.id,
      productName: product.value.name,
      productPic: product.value.pic,
      productPrice: product.value.price,
      productSubTitle: product.value.subTitle,
    };
    try {
      await MemberReadHistoryService.createReadHistory(data);
    } catch (error) {
      console.error('创建浏览记录失败:', error);
    }
  }
};

/**
 * 当商品规格改变时，修改商品信息
 */
const changeSpecInfo = () => {
  const skuStock = getSkuStock();
  if (skuStock != null) {
    product.value.originalPrice = skuStock.price;
    if (product.value.promotionType === 1) {
      // 单品优惠使用促销价
      product.value.price = skuStock.promotionPrice;
    } else {
      product.value.price = skuStock.price;
    }
    product.value.stock = skuStock.stock;
  }
};

/**
 * 获取当前选中商品的SKU
 */
const getSkuStock = (): SkuStockItem | null => {
  for (const sku of skuStockList.value) {
    const spDataArr = JSON.parse(sku.spData);
    const availAbleSpecMap = new Map<string, string>();
    spDataArr.forEach((sp: { key: string; value: string }) => {
      availAbleSpecMap.set(sp.key, sp.value);
    });

    let correctCount = 0;
    specSelected.value.forEach((item) => {
      const value = availAbleSpecMap.get(item.pname);
      if (value != null && value === item.name) {
        correctCount++;
      }
    });

    if (correctCount === specSelected.value.length) {
      return sku;
    }
  }
  return null;
};

/**
 * 将商品加入到购物车
 */
const addToCart = async () => {
  if (!checkForLogin()) {
    return;
  }

  const productSkuStock = getSkuStock();
  if (!productSkuStock || !product.value.id) {
    uni.showToast({
      title: '请选择商品规格',
      icon: 'none',
    });
    return;
  }

  const cartItem = {
    price: product.value.price,
    productAttr: productSkuStock.spData,
    productBrand: product.value.brandName,
    productCategoryId: product.value.productCategoryId,
    productId: product.value.id,
    productName: product.value.name,
    productPic: product.value.pic,
    productSkuCode: productSkuStock.skuCode,
    productSkuId: productSkuStock.id,
    productSn: product.value.productSn,
    productSubTitle: product.value.subTitle,
    quantity: 1,
  };

  try {
    const response = await CartService.addCartItem(cartItem);
    uni.showToast({
      title: response.message || '加入购物车成功',
      duration: 1500,
    });
  } catch (error) {
    console.error('加入购物车失败:', error);
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

/**
 * 初始化收藏状态
 */
const initProductCollection = async () => {
  if (hasLogin.value && product.value.id) {
    try {
      const response =
        await MemberProductCollectionService.productCollectionDetail({
          productId: product.value.id,
        });
      favorite.value = response.data != null;
    } catch (error) {
      console.error('获取收藏状态失败:', error);
    }
  }
};

/**
 * 跳转到品牌详情页
 */
const navToBrandDetail = () => {
  if (brand.value.id) {
    uni.navigateTo({
      url: `/pages/brand/brandDetail?id=${brand.value.id}`,
    });
  }
};
</script>

<style lang="scss" scoped>
page {
  padding-bottom: 160upx;
  background: #f8f8f8;
}

.icon-you {
  color: #888;
  font-size: 30upx;
}

.carousel {
  position: relative;
  height: 722upx;

  swiper {
    height: 100%;
  }

  .image-wrapper {
    width: 100%;
    height: 100%;
  }

  .swiper-item {
    display: flex;
    place-content: center center;
    height: 750upx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
  }
}

/* 标题简介 */
.introduce-section {
  padding: 20upx 30upx;
  background: #fff;

  .title {
    height: 50upx;
    color: #333;
    font-size: 32upx;
    line-height: 50upx;
  }

  .title2 {
    height: 46upx;
    color: #999;
    font-size: 28upx;
    line-height: 46upx;
  }

  .price-box {
    display: flex;
    align-items: baseline;
    height: 64upx;
    padding: 10upx 0;
    color: #fa436a;
    font-size: 26upx;
  }

  .price {
    font-size: 38upx;
  }

  .m-price {
    margin: 0 12upx;
    color: #999;
    text-decoration: line-through;
  }

  .coupon-tip {
    align-items: center;
    padding: 4upx 10upx;
    transform: translateY(-4upx);
    border-radius: 6upx;
    background: #fa436a;
    color: #fff;
    font-size: 24upx;
    line-height: 1;
  }

  .bot-row {
    display: flex;
    align-items: center;
    height: 50upx;
    color: #999;
    font-size: 24upx;

    text {
      flex: 1;
    }
  }
}

/* 分享 */
.share-section {
  display: flex;
  align-items: center;
  padding: 12upx 30upx;
  background: linear-gradient(to right, #fdf5f6, #fbebf6);
  color: #666;

  .share-icon {
    display: flex;
    position: relative;
    align-items: center;
    width: 70upx;
    height: 30upx;
    overflow: hidden;
    border: 1px solid #fa436a;
    border-radius: 4upx;
    color: #fa436a;
    font-size: 22upx;
    line-height: 1;

    &::after {
      content: '';
      position: absolute;
      top: -12upx;
      left: -20upx;
      width: 50upx;
      height: 50upx;
      border-radius: 50%;
      background: #fa436a;
    }
  }

  .icon-xingxing {
    position: relative;
    z-index: 1;
    margin-right: 10upx;
    margin-left: 2upx;
    color: #fff;
    font-size: 24upx;
    line-height: 1;
  }

  .tit {
    margin-left: 10upx;
    font-size: 28upx;
  }

  .icon-bangzhu1 {
    padding: 10upx;
    font-size: 30upx;
    line-height: 1;
  }

  .share-btn {
    flex: 1;
    color: #fa436a;
    font-size: 24upx;
    text-align: right;
  }

  .icon-you {
    margin-left: 4upx;
    color: #fa436a;
    font-size: 24upx;
  }
}

.c-list {
  background: #fff;
  color: #666;
  font-size: 26upx;

  .c-row {
    display: flex;
    position: relative;
    align-items: center;
    padding: 20upx 30upx;
  }

  .tit {
    width: 140upx;
  }

  .con {
    flex: 1;
    color: #333;

    .selected-text {
      margin-right: 10upx;
    }
  }

  .bz-list {
    height: 40upx;
    color: #333;
    font-size: 26upx;

    text {
      display: inline-block;
      margin-right: 30upx;
    }
  }

  .con-list {
    display: flex;
    flex: 1;
    flex-direction: column;
    color: #333;
    line-height: 40upx;
  }

  .red {
    color: #fa436a;
  }
}

/* 评价 */
.eva-section {
  display: flex;
  flex-direction: column;
  margin-top: 16upx;
  padding: 20upx 30upx;
  background: #fff;

  .e-header {
    display: flex;
    align-items: center;
    height: 70upx;
    color: #999;
    font-size: 26upx;

    .tit {
      margin-right: 4upx;
      color: #333;
      font-size: 30upx;
    }

    .tip {
      flex: 1;
      text-align: right;
    }

    .icon-you {
      margin-left: 10upx;
    }
  }
}

.eva-box {
  display: flex;
  padding: 20upx 0;

  .portrait {
    flex-shrink: 0;
    width: 80upx;
    height: 80upx;
    border-radius: 100px;
  }

  .right {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-left: 26upx;
    color: #666;
    font-size: 28upx;

    .con {
      padding: 20upx 0;
      color: #333;
      font-size: 28upx;
    }

    .bot {
      display: flex;
      justify-content: space-between;
      color: #999;
      font-size: 24upx;
    }
  }
}

/* 详情 */
.detail-desc {
  margin-top: 16upx;
  background: #fff;

  .d-header {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    height: 80upx;
    color: #333;
    font-size: 30upx;

    text {
      position: relative;
      z-index: 1;
      padding: 0 20upx;
      background: #fff;
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300upx;
      height: 0;
      transform: translateX(-50%);
      border-bottom: 1px solid #ccc;
    }
  }
}

.detail-desc :deep(img) {
  width: 100%;
  height: auto;
}

/* 规格选择弹窗 */
.attr-content {
  padding: 10upx 30upx;

  .a-t {
    display: flex;

    image {
      flex-shrink: 0;
      width: 170upx;
      height: 170upx;
      margin-top: -40upx;
      border-radius: 8upx;
    }

    .right {
      display: flex;
      flex-direction: column;
      padding-left: 24upx;
      color: #666;
      font-size: 26upx;
      line-height: 42upx;

      .price {
        margin-bottom: 10upx;
        color: #fa436a;
        font-size: 36upx;
      }

      .selected-text {
        margin-right: 10upx;
      }
    }
  }

  .attr-list {
    display: flex;
    flex-direction: column;
    padding-top: 30upx;
    padding-left: 10upx;
    color: #666;
    font-size: 30upx;
  }

  .item-list {
    display: flex;
    flex-wrap: wrap;
    padding: 20upx 0 0;

    text {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 60upx;
      height: 60upx;
      margin-right: 20upx;
      margin-bottom: 20upx;
      padding: 0 20upx;
      border-radius: 100upx;
      background: #eee;
      color: #333;
      font-size: 28upx;
    }

    .selected {
      background: #fbebee;
      color: #fa436a;
    }
  }
}

.no-padding {
  padding: 0upx;
}

/* 弹出层 */
.popup {
  position: fixed;
  z-index: 99;
  inset: 0;

  &.show {
    display: block;

    .mask {
      animation: showPopup 0.2s linear both;
    }

    .layer {
      animation: showLayer 0.2s linear both;
    }
  }

  &.hide {
    .mask {
      animation: hidePopup 0.2s linear both;
    }

    .layer {
      animation: hideLayer 0.2s linear both;
    }
  }

  &.none {
    display: none;
  }

  .mask {
    position: fixed;
    z-index: 1;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .layer {
    position: fixed;
    z-index: 99;
    bottom: 0;
    width: 100%;
    min-height: 40vh;
    border-radius: 10upx 10upx 0 0;
    background-color: #fff;

    .btn {
      height: 66upx;
      margin: 30upx auto 20upx;
      border-radius: 100upx;
      background: #fa436a;
      color: #fff;
      font-size: 30upx;
      line-height: 66upx;
    }
  }

  @keyframes showPopup {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes hidePopup {
    0% {
      opacity: 1;
    }

    100% {
      opacity: 0;
    }
  }

  @keyframes showLayer {
    0% {
      transform: translateY(120%);
    }

    100% {
      transform: translateY(0%);
    }
  }

  @keyframes hideLayer {
    0% {
      transform: translateY(0);
    }

    100% {
      transform: translateY(120%);
    }
  }
}

/* 底部操作菜单 */
.page-bottom {
  display: flex;
  position: fixed;
  z-index: 95;
  bottom: 30upx;
  left: 30upx;
  align-items: center;
  justify-content: center;
  width: 690upx;
  height: 100upx;
  border-radius: 16upx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 20upx 0 rgba(0, 0, 0, 0.5);

  .p-b-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 96upx;
    height: 80upx;
    color: #666;
    font-size: 24upx;

    .yticon {
      color: #999;
      font-size: 40upx;
      line-height: 48upx;
    }

    &.active,
    &.active .yticon {
      color: #fa436a;
    }

    .icon-fenxiang2 {
      transform: translateY(-2upx);
      font-size: 42upx;
    }

    .icon-shoucang {
      font-size: 46upx;
    }
  }

  .action-btn-group {
    display: flex;
    position: relative;
    height: 76upx;
    margin-left: 20upx;
    overflow: hidden;
    border-radius: 100px;
    background: linear-gradient(to right, #ffac30, #fa436a, #f56c6c);
    box-shadow: 0 20upx 40upx -16upx #fa436a;
    box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 50%;
      width: 0;
      height: 28upx;
      transform: translateY(-50%);
      border-right: 1px solid rgba(255, 255, 255, 0.5);
    }

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 180upx;
      height: 100%;
      padding: 0;
      border-radius: 0;
      background: transparent;
      font-size: 28upx;
    }
  }
}

/* 优惠券面板 */
.mask {
  display: flex;
  position: fixed;
  z-index: 9995;
  top: var(--window-top);
  bottom: 0;
  left: 0;
  align-items: flex-end;
  width: 100%;
  transition: 0.3s;
  background: rgba(0, 0, 0, 0);

  .mask-content {
    width: 100%;
    min-height: 30vh;
    max-height: 70vh;
    overflow-y: scroll;
    transform: translateY(100%);
    transition: 0.3s;
    background: #f3f3f3;
  }

  &.none {
    display: none;
  }

  &.show {
    background: rgba(0, 0, 0, 0.4);

    .mask-content {
      transform: translateY(0);
    }
  }
}

/* 优惠券列表 */
.coupon-item {
  display: flex;
  flex-direction: column;
  margin: 20upx 24upx;
  background: #fff;

  .con {
    display: flex;
    position: relative;
    align-items: center;
    height: 120upx;
    padding: 0 30upx;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 0;
      transform: scaleY(50%);
      border-bottom: 1px dashed #f3f3f3;
    }
  }

  .left {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    height: 100upx;
    overflow: hidden;
  }

  .title {
    margin-bottom: 10upx;
    color: #333;
    font-size: 32upx;
  }

  .time {
    color: #999;
    font-size: 24upx;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100upx;
    color: #666;
    font-size: 26upx;
  }

  .price {
    color: #fa436a;
    font-size: 44upx;

    &::before {
      content: '￥';
      font-size: 34upx;
    }
  }

  .tips {
    padding-left: 30upx;
    color: #999;
    font-size: 24upx;
    line-height: 60upx;
  }

  .circle {
    position: absolute;
    z-index: 10;
    bottom: -10upx;
    left: -6upx;
    width: 20upx;
    height: 20upx;
    border-radius: 100px;
    background: #f3f3f3;

    &.circle-right {
      right: -6upx;
      left: auto;
    }
  }
}

.brand-info {
  display: flex;
  flex-direction: column;
  margin-top: 16upx;
  background-color: #fff;

  .brand-box {
    display: flex;
    align-items: center;
    padding: 30upx 50upx;

    .image-wrapper {
      width: 210upx;
      height: 70upx;

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
      color: #333;
      font-size: 40upx;

      text:last-child {
        margin-top: 8upx;
        color: #999;
        font-size: 24upx;

        &.Skeleton {
          width: 220upx;
        }
      }
    }
  }

  .d-header {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    height: 80upx;
    color: #333;
    font-size: 30upx;

    text {
      position: relative;
      z-index: 1;
      padding: 0 20upx;
      background: #fff;
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 300upx;
      height: 0;
      transform: translateX(-50%);
      border-bottom: 1px solid #ccc;
    }
  }
}
</style>
