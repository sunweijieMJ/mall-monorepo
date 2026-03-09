<template>
  <view class="content b-t">
    <view
      v-for="(item, index) in addressList"
      :key="index"
      class="list b-b"
      @click="checkAddress(item)"
    >
      <view class="wrapper">
        <view class="address-box">
          <text v-if="item.defaultStatus == 1" class="tag">默认</text>
          <text class="address">
            {{ item.province }} {{ item.city }} {{ item.region }}
            {{ item.detailAddress }}
          </text>
        </view>
        <view class="u-box">
          <text class="name">{{ item.name }}</text>
          <text class="mobile">{{ item.phoneNumber }}</text>
        </view>
      </view>
      <text
        class="yticon icon-bianji"
        @click.stop="addAddress('edit', item)"
      ></text>
      <text
        class="yticon icon-iconfontshanchu1"
        @click.stop="handleDeleteAddress(item.id)"
      ></text>
    </view>

    <button class="add-btn" @click="addAddress('add')">新增地址</button>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '收货地址',
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { ref } from 'vue';
import { useAddressStore } from '@/store';

/**
 * 地址选择页面
 * 显示用户的收货地址列表
 * 支持选择地址、编辑地址、删除地址、新增地址
 */

/** 地址接口 */
interface Address {
  id: number;
  name: string;
  phoneNumber: string;
  province: string;
  city: string;
  region: string;
  detailAddress: string;
  defaultStatus: number;
}

const addressStore = useAddressStore();

/** 来源标识（1表示从订单页选择地址） */
const source = ref(0);
/** 地址列表 */
const addressList = ref<Address[]>([]);

/**
 * 页面加载
 */
onLoad((option) => {
  source.value = +(option?.source || 0);
  loadData();
});

/**
 * 加载地址列表
 */
const loadData = async () => {
  try {
    const data = await addressStore.fetchList();
    addressList.value = data || [];
  } catch (error) {
    console.error('加载地址列表失败:', error);
  }
};

/**
 * 选择地址
 */
const checkAddress = (item: Address) => {
  if (source.value === 1) {
    // 获取上一页实例并设置地址，然后返回
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2] as any;
    if (prevPage) {
      prevPage.currentAddress = item;
    }
    uni.navigateBack();
  }
};

/**
 * 新增或编辑地址
 */
const addAddress = (type: string, item?: Address) => {
  if (type === 'edit' && item) {
    uni.navigateTo({
      url: `/pages-sub/address/address-manage?type=${type}&id=${item.id}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages-sub/address/address-manage?type=${type}`,
    });
  }
};

/**
 * 处理删除地址
 */
const handleDeleteAddress = (id: number) => {
  uni.showModal({
    title: '提示',
    content: '是否要删除该地址',
    success: async (res) => {
      if (res.confirm) {
        try {
          await addressStore.remove(id);
          loadData();
        } catch (error) {
          console.error('删除地址失败:', error);
        }
      }
    },
  });
};
</script>

<style lang="scss" scoped>
page {
  padding-bottom: 120rpx;
}

.content {
  position: relative;
}

.list {
  display: flex;
  position: relative;
  align-items: center;
  padding: 20rpx 30rpx;
  background: var(--color-bg);
}

.wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.address-box {
  display: flex;
  align-items: center;

  .tag {
    margin-right: 10rpx;
    padding: 4rpx 10rpx;
    border: 1px solid #ffb4c7;
    border-radius: 4rpx;
    background: #fffafb;
    color: var(--color-primary);
    font-size: 24rpx;
    line-height: 1;
  }

  .address {
    color: var(--color-text);
    font-size: 30rpx;
  }
}

.u-box {
  margin-top: 16rpx;
  color: var(--color-text-secondary);
  font-size: 28rpx;

  .name {
    margin-right: 30rpx;
  }
}

.icon-bianji {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding-left: 30rpx;
  color: var(--color-text-secondary);
  font-size: 40rpx;
}

.icon-iconfontshanchu1 {
  display: flex;
  align-items: center;
  height: 80rpx;
  padding-left: 30rpx;
  color: var(--color-text-secondary);
  font-size: 40rpx;
}

.add-btn {
  display: flex;
  position: fixed;
  z-index: 95;
  right: 30rpx;
  bottom: 16rpx;
  left: 30rpx;
  align-items: center;
  justify-content: center;
  width: 690rpx;
  height: 80rpx;
  border-radius: 10rpx;
  background-color: var(--color-primary);
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  color: var(--color-bg);
  font-size: 32rpx;
}
</style>
