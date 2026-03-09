<template>
  <view>
    <view class="notice-item">
      <text class="time">11:30</text>
      <view class="content">
        <text class="title">新品上市，全场满199减50</text>
        <view class="img-wrapper">
          <image
            class="pic"
            src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1556465765776&di=57bb5ff70dc4f67dcdb856e5d123c9e7&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01fd015aa4d95fa801206d96069229.jpg%401280w_1l_2o_100sh.jpg"
          ></image>
        </view>
        <text class="introduce">
          虽然做了一件好事，但很有可能因此招来他人的无端猜测，例如被质疑是否藏有其他利己动机等，乃至谴责。即便如此，还是要做好事。
        </text>
        <view class="bot b-t">
          <text>查看详情</text>
          <text class="more-icon yticon icon-you"></text>
        </view>
      </view>
    </view>
    <view class="notice-item">
      <text class="time">昨天 12:30</text>
      <view class="content">
        <text class="title">新品上市，全场满199减50</text>
        <view class="img-wrapper">
          <image
            class="pic"
            src="https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=3761064275,227090144&fm=26&gp=0.jpg"
          ></image>
          <view class="cover"> 活动结束 </view>
        </view>
        <view class="bot b-t">
          <text>查看详情</text>
          <text class="more-icon yticon icon-you"></text>
        </view>
      </view>
    </view>
    <view class="notice-item">
      <text class="time">2019-07-26 12:30</text>
      <view class="content">
        <text class="title">新品上市，全场满199减50</text>
        <view class="img-wrapper">
          <image
            class="pic"
            src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1556465765776&di=57bb5ff70dc4f67dcdb856e5d123c9e7&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01fd015aa4d95fa801206d96069229.jpg%401280w_1l_2o_100sh.jpg"
          ></image>
          <view class="cover"> 活动结束 </view>
        </view>
        <text class="introduce">
          新品上市全场2折起，新品上市全场2折起，新品上市全场2折起，新品上市全场2折起，新品上市全场2折起
        </text>
        <view class="bot b-t">
          <text>查看详情</text>
          <text class="more-icon yticon icon-you"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
definePage({
  style: {
    navigationBarTitleText: '消息通知',
  },
});
/**
 * 通知/公告页面
 * 显示系统通知和活动公告列表
 * 当前为静态展示页面
 */
</script>

<style lang="scss" scoped>
page {
  padding-bottom: 30upx;
  background-color: #f7f7f7;
}

.notice-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80upx;
  padding-top: 10upx;
  color: #7d7d7d;
  font-size: 26upx;
}

.content {
  width: 710upx;
  padding: 0 24upx;
  border-radius: 4upx;
  background-color: #fff;
}

.title {
  display: flex;
  align-items: center;
  height: 90upx;
  color: #303133;
  font-size: 32upx;
}

.img-wrapper {
  position: relative;
  width: 100%;
  height: 260upx;
}

.pic {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 6upx;
}

.cover {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 36upx;
}

.introduce {
  display: inline-block;
  padding: 16upx 0;
  color: #606266;
  font-size: 28upx;
  line-height: 38upx;
}

.bot {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: space-between;
  height: 80upx;
  color: #707070;
  font-size: 24upx;
}

.more-icon {
  font-size: 32upx;
}
</style>
