<template>
  <view class="content">
    <view class="row b-b">
      <text class="tit">姓名</text>
      <input
        v-model="addressData.name"
        class="input"
        type="text"
        placeholder="收货人姓名"
        placeholder-class="placeholder"
      />
    </view>
    <view class="row b-b">
      <text class="tit">手机号码</text>
      <input
        v-model="addressData.phoneNumber"
        class="input"
        type="number"
        placeholder="收货人手机号码"
        placeholder-class="placeholder"
      />
    </view>
    <view class="row b-b">
      <text class="tit">邮政编码</text>
      <input
        v-model="addressData.postCode"
        class="input"
        type="number"
        placeholder="收货人邮政编码"
        placeholder-class="placeholder"
      />
    </view>
    <view class="row b-b">
      <text class="tit">所在区域</text>
      <input
        v-model="addressData.prefixAddress"
        class="input"
        type="text"
        placeholder="所在区域"
        placeholder-class="placeholder"
      />
    </view>
    <view class="row b-b">
      <text class="tit">详细地址</text>
      <input
        v-model="addressData.detailAddress"
        class="input"
        type="text"
        placeholder="详细地址"
        placeholder-class="placeholder"
      />
    </view>

    <view class="row default-row">
      <text class="tit">设为默认</text>
      <switch
        :checked="addressData.defaultStatus == 1"
        color="#fa436a"
        @change="switchChange"
      />
    </view>
    <button class="add-btn" @click="confirm">提交</button>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '地址管理',
  },
});
import { onLoad } from '@dcloudio/uni-app';
import { reactive, ref } from 'vue';
import { AddressService } from '@/api';

/**
 * 地址管理页面（新增/编辑地址）
 * 支持新增地址和编辑地址
 * 包含表单验证
 */

/** 地址数据接口 */
interface AddressData {
  id?: number;
  name: string;
  phoneNumber: string;
  postCode: string;
  detailAddress: string;
  defaultStatus: number;
  province: string;
  city: string;
  region: string;
  prefixAddress: string;
}

/** 地址数据 */
const addressData = reactive<AddressData>({
  name: '',
  phoneNumber: '',
  postCode: '',
  detailAddress: '',
  defaultStatus: 0,
  province: '',
  city: '',
  region: '',
  prefixAddress: '',
});

/** 管理类型（add或edit） */
const manageType = ref('');

/**
 * 页面加载
 */
onLoad((option) => {
  let title = '新增收货地址';
  if (option?.type === 'edit') {
    title = '编辑收货地址';
    const id = +(option?.id || 0);
    AddressService.fetchAddressDetail(id)
      .then((response) => {
        Object.assign(addressData, response.data);
        addressData.prefixAddress =
          addressData.province + addressData.city + addressData.region;
      })
      .catch((error) => {
        console.error('加载地址详情失败:', error);
      });
  }
  manageType.value = option?.type || 'add';
  uni.setNavigationBarTitle({
    title,
  });
});

/**
 * 开关切换
 */
const switchChange = (e: any) => {
  addressData.defaultStatus = e.detail.value ? 1 : 0;
};

/**
 * 将地址转化为省市区
 */
const convertAddress = (address: string) => {
  let tempAddress = address;
  if (tempAddress.indexOf('省') !== -1) {
    addressData.province = tempAddress.substr(0, tempAddress.indexOf('省') + 1);
    tempAddress = tempAddress.replace(addressData.province, '');
    addressData.city = tempAddress.substr(0, tempAddress.indexOf('市') + 1);
    tempAddress = tempAddress.replace(addressData.city, '');
    addressData.region = tempAddress.substr(0, tempAddress.indexOf('区') + 1);
  } else {
    addressData.province = tempAddress.substr(0, tempAddress.indexOf('市') + 1);
    tempAddress = tempAddress.replace(addressData.province, '');
    addressData.city = '';
    addressData.region = tempAddress.substr(0, tempAddress.indexOf('区') + 1);
  }
};

/**
 * 提交表单
 */
const confirm = () => {
  if (!addressData.name) {
    uni.showToast({ title: '请填写收货人姓名', icon: 'none' });
    return;
  }
  if (!/(^1[3|4|5|7|8|9][0-9]{9}$)/.test(addressData.phoneNumber)) {
    uni.showToast({ title: '请输入正确的手机号码', icon: 'none' });
    return;
  }
  if (!addressData.prefixAddress) {
    uni.showToast({ title: '请输入区域', icon: 'none' });
    return;
  }
  convertAddress(addressData.prefixAddress);
  if (!addressData.province) {
    uni.showToast({ title: '请输入正确的省份', icon: 'none' });
    return;
  }
  if (!addressData.detailAddress) {
    uni.showToast({ title: '请填写详细地址信息', icon: 'none' });
    return;
  }

  if (manageType.value === 'edit') {
    AddressService.updateAddress(addressData)
      .then(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2] as any;
        if (prevPage && prevPage.refreshList) {
          prevPage.refreshList(addressData, manageType.value);
        }
        uni.showToast({ title: '地址修改成功！', icon: 'none' });
        setTimeout(() => {
          uni.navigateBack();
        }, 800);
      })
      .catch((error) => {
        console.error('修改地址失败:', error);
      });
  } else {
    AddressService.addAddress(addressData)
      .then(() => {
        const pages = getCurrentPages();
        const prevPage = pages[pages.length - 2] as any;
        if (prevPage && prevPage.refreshList) {
          prevPage.refreshList(addressData, manageType.value);
        }
        uni.showToast({ title: '地址添加成功！', icon: 'none' });
        setTimeout(() => {
          uni.navigateBack();
        }, 800);
      })
      .catch((error) => {
        console.error('添加地址失败:', error);
      });
  }
};
</script>

<style lang="scss" scoped>
page {
  padding-top: 16upx;
  background: #f8f8f8;
}

.row {
  display: flex;
  position: relative;
  align-items: center;
  height: 110upx;
  padding: 0 30upx;
  background: #fff;

  .tit {
    flex-shrink: 0;
    width: 150upx;
    color: #303133;
    font-size: 30upx;
  }

  .input {
    flex: 1;
    color: #303133;
    font-size: 30upx;
  }

  .icon-shouhuodizhi {
    color: #909399;
    font-size: 36upx;
  }
}

.default-row {
  margin-top: 16upx;

  .tit {
    flex: 1;
  }

  switch {
    transform: translateX(16upx) scale(0.9);
  }
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 690upx;
  height: 80upx;
  margin: 60upx auto;
  border-radius: 10upx;
  background-color: #fa436a;
  box-shadow: 1px 2px 5px rgba(219, 63, 96, 0.4);
  color: #fff;
  font-size: 36upx;
}
</style>
