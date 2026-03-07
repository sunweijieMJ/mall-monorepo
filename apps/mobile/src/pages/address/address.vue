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
import { AddressService } from '@/api';

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
    const response = await AddressService.fetchAddressList();
    addressList.value = response.data || [];
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
      url: `/pages/address/addressManage?type=${type}&id=${item.id}`,
    });
  } else {
    uni.navigateTo({
      url: `/pages/address/addressManage?type=${type}`,
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
          await AddressService.deleteAddress(id);
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
  padding-bottom: 120upx;
}

.content {
  position: relative;
}

.list {
  display: flex;
  position: relative;
  align-items: center;
  padding: 20upx 30upx;
  background: #fff;
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
    margin-right: 10upx;
    padding: 4upx 10upx;
    border: 1px solid #ffb4c7;
    border-radius: 4upx;
    background: #fffafb;
    color: #fa436a;
    font-size: 24upx;
    line-height: 1;
  }

  .address {
    color: #303133;
    font-size: 30upx;
  }
}

.u-box {
  margin-top: 16upx;
  color: #909399;
  font-size: 28upx;

  .name {
    margin-right: 30upx;
  }
}

.icon-bianji {
  display: flex;
  align-items: center;
  height: 80upx;
  padding-left: 30upx;
  color: #909399;
  font-size: 40upx;
}

.icon-iconfontshanchu1 {
  display: flex;
  align-items: center;
  height: 80upx;
  padding-left: 30upx;
  color: #909399;
  font-size: 40upx;
}

.add-btn {
  display: flex;
  position: fixed;
  z-index: 95;
  right: 30upx;
  bottom: 16upx;
  left: 30upx;
  align-items: center;
  justify-content: center;
  width: 690upx;
  height: 80upx;
  border-radius: 10upx;
  background-color: #fa436a;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  color: #fff;
  font-size: 32upx;
}
</style>
