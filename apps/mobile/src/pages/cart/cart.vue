<template>
  <view class="container">
    <!-- 空白页 -->
    <view v-if="!hasLogin || empty === true" class="empty">
      <image src="/static/emptyCart.jpg" mode="aspectFit"></image>
      <view v-if="hasLogin" class="empty-tips">
        空空如也
        <navigator
          v-if="hasLogin"
          class="navigator"
          url="../index/index"
          open-type="switchTab"
          >随便逛逛></navigator
        >
      </view>
      <view v-else class="empty-tips">
        空空如也
        <view class="navigator" @click="navToLogin">去登陆></view>
      </view>
    </view>
    <view v-else>
      <!-- 列表 -->
      <view class="cart-list">
        <block v-for="(item, index) in cartList" :key="item.id">
          <view
            class="cart-item"
            :class="{ 'b-b': index !== cartList.length - 1 }"
          >
            <view class="image-wrapper">
              <image
                :src="item.productPic"
                :class="[item.loaded]"
                mode="aspectFill"
                lazy-load
                @load="onImageLoad(index)"
                @error="onImageError(index)"
              ></image>
              <view
                class="yticon icon-xuanzhong2 checkbox"
                :class="{ checked: item.checked }"
                @click="check('item', index)"
              ></view>
            </view>
            <view class="item-right">
              <text class="clamp title">{{ item.productName }}</text>
              <text class="attr">{{ item.spDataStr }}</text>
              <text class="price">¥{{ item.price }}</text>
              <uni-number-box
                class="step"
                :min="1"
                :max="100"
                :value="item.quantity"
                :index="index"
                @event-change="numberChange"
              ></uni-number-box>
            </view>
            <text
              class="del-btn yticon icon-fork"
              @click="handleDeleteCartItem(index)"
            ></text>
          </view>
        </block>
      </view>
      <!-- 底部菜单栏 -->
      <view class="action-section">
        <view class="checkbox">
          <image
            :src="allChecked ? '/static/selected.png' : '/static/select.png'"
            mode="aspectFit"
            @click="check('all')"
          ></image>
          <view
            class="clear-btn"
            :class="{ show: allChecked }"
            @click="clearCart"
          >
            清空
          </view>
        </view>
        <view class="total-box">
          <text class="price">¥{{ total }}元</text>
        </view>
        <button
          type="primary"
          class="no-border confirm-btn"
          @click="createOrder"
        >
          去结算
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '购物车',
  },
});
import { onShow } from '@dcloudio/uni-app';
import { ref, computed, watch } from 'vue';
import { CartService } from '@/api';
import uniNumberBox from '@/components/uni-number-box.vue';
import { useUserStore } from '@/store/user';

/**
 * 购物车页面
 * 展示用户购物车商品列表，支持选中、修改数量、删除、清空、结算等功能
 */

/** 购物车商品项接口 */
interface CartItem {
  /** 购物车项ID */
  id: number;
  /** 商品图片 */
  productPic: string;
  /** 商品名称 */
  productName: string;
  /** 商品属性（JSON字符串） */
  productAttr: string;
  /** 商品属性显示字符串 */
  spDataStr?: string;
  /** 商品价格 */
  price: number;
  /** 商品数量 */
  quantity: number;
  /** 是否选中 */
  checked?: boolean;
  /** 图片加载状态 */
  loaded?: string;
}

/** 商品属性项接口 */
interface SpDataItem {
  key: string;
  value: string;
}

/** 数量变化事件接口 */
interface NumberChangeEvent {
  index: number;
  number: number;
}

/** 用户状态管理 */
const userStore = useUserStore();

/** 是否已登录 */
const hasLogin = computed(() => userStore.hasLogin);

/** 总价格 */
const total = ref(0);
/** 全选状态 */
const allChecked = ref(false);
/** 空白页显示 */
const empty = ref(false);
/** 购物车列表 */
const cartList = ref<CartItem[]>([]);

/**
 * 监听购物车列表变化，更新空白页状态
 */
watch(
  cartList,
  (newList) => {
    const isEmpty = newList.length === 0;
    if (empty.value !== isEmpty) {
      empty.value = isEmpty;
    }
  },
  { deep: true },
);

/**
 * 页面显示时加载数据
 */
onShow(() => {
  loadData();
});

/**
 * 请求数据
 */
const loadData = async () => {
  if (!hasLogin.value) {
    return;
  }

  try {
    const response = await CartService.fetchCartList();
    const list = response.data || [];
    const processedList = list.map((item: CartItem) => {
      item.checked = true;
      item.loaded = 'loaded';
      const spDataArr: SpDataItem[] = JSON.parse(item.productAttr);
      let spDataStr = '';
      for (const attr of spDataArr) {
        spDataStr += attr.key;
        spDataStr += ':';
        spDataStr += attr.value;
        spDataStr += ';';
      }
      item.spDataStr = spDataStr;
      return item;
    });
    cartList.value = processedList;
    calcTotal();
  } catch (error) {
    console.error('加载购物车失败:', error);
  }
};

/**
 * 监听image加载完成
 */
const onImageLoad = (index: number) => {
  if (cartList.value[index]) {
    cartList.value[index].loaded = 'loaded';
  }
};

/**
 * 监听image加载失败
 */
const onImageError = (index: number) => {
  if (cartList.value[index]) {
    cartList.value[index].productPic = '/static/errorImage.jpg';
  }
};

/**
 * 跳转到登录页
 */
const navToLogin = () => {
  uni.navigateTo({
    url: '/pages/public/login',
  });
};

/**
 * 选中状态处理
 */
const check = (type: 'item' | 'all', index?: number) => {
  if (type === 'item' && index !== undefined) {
    cartList.value[index].checked = !cartList.value[index].checked;
  } else if (type === 'all') {
    const checked = !allChecked.value;
    const list = cartList.value;
    list.forEach((item) => {
      item.checked = checked;
    });
    allChecked.value = checked;
  }
  calcTotal();
};

/**
 * 数量变化处理
 */
const numberChange = async (data: NumberChangeEvent) => {
  const cartItem = cartList.value[data.index];
  try {
    await CartService.updateQuantity({
      id: cartItem.id,
      quantity: data.number,
    });
    cartItem.quantity = data.number;
    calcTotal();
  } catch (error) {
    console.error('更新数量失败:', error);
  }
};

/**
 * 删除购物车项
 */
const handleDeleteCartItem = async (index: number) => {
  const list = cartList.value;
  const row = list[index];
  const id = row.id;

  try {
    await CartService.deleteCartItem({ ids: id });
    cartList.value.splice(index, 1);
    calcTotal();
    uni.hideLoading();
  } catch (error) {
    console.error('删除购物车项失败:', error);
  }
};

/**
 * 清空购物车
 */
const clearCart = async () => {
  uni.showModal({
    content: '清空购物车？',
    success: async (e) => {
      if (e.confirm) {
        try {
          await CartService.clearCartList();
          cartList.value = [];
        } catch (error) {
          console.error('清空购物车失败:', error);
        }
      }
    },
  });
};

/**
 * 计算总价
 */
const calcTotal = () => {
  const list = cartList.value;
  if (list.length === 0) {
    empty.value = true;
    return;
  }

  let totalPrice = 0;
  let checked = true;
  list.forEach((item) => {
    if (item.checked === true) {
      totalPrice += item.price * item.quantity;
    } else if (checked === true) {
      checked = false;
    }
  });
  allChecked.value = checked;
  total.value = Number(totalPrice.toFixed(2));
};

/**
 * 创建订单
 */
const createOrder = () => {
  const list = cartList.value;
  const cartIds: number[] = [];
  list.forEach((item) => {
    if (item.checked) {
      cartIds.push(item.id);
    }
  });

  if (cartIds.length === 0) {
    uni.showToast({
      title: '您还未选择要下单的商品！',
      duration: 1000,
      icon: 'none',
    });
    return;
  }

  uni.navigateTo({
    url: `/pages-sub/order/createOrder?cartIds=${JSON.stringify(cartIds)}`,
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding-bottom: 134upx;

  /* 空白页 */
  .empty {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    padding-bottom: 100upx;
    background: #fff;

    image {
      width: 240upx;
      height: 160upx;
      margin-bottom: 30upx;
    }

    .empty-tips {
      display: flex;
      color: #999;
      font-size: 26upx;

      .navigator {
        margin-left: 16upx;
        color: #fa436a;
      }
    }
  }
}

/* 购物车列表项 */
.cart-item {
  display: flex;
  position: relative;
  padding: 30upx 40upx;

  .image-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 230upx;
    height: 230upx;

    image {
      border-radius: 8upx;
    }
  }

  .checkbox {
    position: absolute;
    z-index: 8;
    top: -16upx;
    left: -16upx;
    padding: 4upx;
    border-radius: 50px;
    background: #fff;
    color: #999;
    font-size: 44upx;
    line-height: 1;
  }

  .item-right {
    display: flex;
    position: relative;
    flex: 1;
    flex-direction: column;
    padding-left: 30upx;
    overflow: hidden;

    .title,
    .price {
      height: 40upx;
      color: #333;
      font-size: 30upx;
      line-height: 40upx;
    }

    .attr {
      height: 50upx;
      color: #999;
      font-size: 26upx;
      line-height: 50upx;
    }

    .price {
      height: 50upx;
      line-height: 50upx;
    }
  }

  .del-btn {
    height: 50upx;
    padding: 4upx 10upx;
    color: #999;
    font-size: 34upx;
  }
}

/* 底部栏 */
.action-section {
  display: flex;
  position: fixed;
  z-index: 95;
  bottom: 30upx;
  left: 30upx;
  align-items: center;
  width: 690upx;
  height: 100upx;

  /* #ifdef H5 */
  margin-bottom: 100upx;
  padding: 0 30upx;
  border-radius: 16upx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 20upx 0 rgba(0, 0, 0, 0.5);

  .checkbox {
    position: relative;
    height: 52upx;

    image {
      position: relative;
      z-index: 5;
      width: 52upx;
      height: 100%;
    }
  }

  .clear-btn {
    position: absolute;
    z-index: 4;
    top: 0;
    left: 26upx;
    width: 0;
    height: 52upx;
    padding-left: 38upx;
    transition: 0.2s;
    border-radius: 0 50px 50px 0;
    opacity: 0;
    background: #999;
    color: #fff;
    font-size: 28upx;
    line-height: 52upx;

    &.show {
      width: 120upx;
      opacity: 1;
    }
  }

  .total-box {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding-right: 40upx;
    text-align: right;

    .price {
      color: #333;
      font-size: 36upx;
    }

    .coupon {
      color: #999;
      font-size: 24upx;

      text {
        color: #333;
      }
    }
  }

  .confirm-btn {
    height: 76upx;
    margin: 0;
    padding: 0 38upx;
    border-radius: 100px;
    background: #fa436a;
    box-shadow: 1px 2px 5px rgba(217, 60, 93, 0.72);
    font-size: 30upx;
    line-height: 76upx;
  }
}

/* 复选框选中状态 */
.action-section .checkbox.checked,
.cart-item .checkbox.checked {
  color: #fa436a;
}
</style>
