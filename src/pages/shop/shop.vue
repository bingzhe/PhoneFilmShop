<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTitleText: '',
    enablePullDownRefresh: true,
    // navigationStyle: 'custom',
    'mp-weixin': {
      homeButton: false,
    },
  },
}
</route>

<template>
  <view class="">
    <view class="bg-#00A3FF pl-32rpx pr-32rpx pb-16rpx flex w-750rpx">
      <view class="mr-32rpx">
        <wd-img width="60" height="60" round :src="shopLogo"></wd-img>
      </view>
      <view class="flex-1">
        <view class="text-white text-32rpx font-bold mb-16rpx">店铺名称</view>
        <view class="text-white text-28rpx">联系电话：13800138000</view>
        <view class="text-white text-28rpx mb-16rpx">地址：北京市海淀区</view>

        <view class="flex justify-between items-center">
          <view class="flex">
            <view
              class="w-48rpx h-48rpx flex justify-center items-center rounded-8rpx border-1 border-#fff border-solid mr-16rpx"
            >
              <view class="i-carbon:location-current text-32rpx text-#fff"></view>
            </view>
            <view
              class="w-48rpx h-48rpx flex justify-center items-center rounded-8rpx border-1 border-#fff border-solid mr-16rpx"
            >
              <view class="i-ic:baseline-local-phone text-32rpx text-#fff"></view>
            </view>
            <view
              class="w-48rpx h-48rpx flex justify-center items-center rounded-8rpx border-1 border-#fff border-solid mr-16rpx"
            >
              <view class="i-ic:twotone-storefront text-32rpx text-#fff"></view>
            </view>
          </view>
          <view>
            <view
              class="w-48rpx h-48rpx flex justify-center items-center rounded-8rpx border-1 border-#fff border-solid"
            >
              <view class="i-ic:baseline-account-circle text-32rpx text-#fff"></view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="mt-32rpx ml-24rpx mr-24rpx mb-24rpx bg-white rounded-32rpx h-300rpx">
      <view
        class="bg-#00A3FF text-white text-28rpx mr-24rpx ml-24rpx text-center rounded-b-32rpx pt-8rpx pb-8rpx"
      >
        您好，尊贵的会员
      </view>
      <view
        class="flex justify-around items-center h-170rpx border-b-#eee border-b-1 border-l-0 border-r-0 border-t-0 border-solid"
      >
        <view class="flex flex-col items-center">
          <view class="text-48rpx text-#00A3FF font-bold">1000</view>
          <view class="text-28rpx text-#666">剩余贴膜次数</view>
        </view>
        <view class="flex flex-col items-center">
          <view class="text-48rpx text-#00A3FF font-bold">1000</view>
          <view class="text-28rpx text-#666">积分</view>
        </view>
      </view>
      <view class="text-28rpx text-#666 text-center pt-16rpx pb-16rpx">
        您当前有
        <text class="text-red font-bold">0</text>
        条套餐
      </view>
    </view>

    <view class="flex justify-between items-center ml-24rpx mr-24rpx">
      <view
        class="w-223rpx bg-#023A44 h-140rpx rounded-16rpx flex flex-col justify-center items-center"
      >
        <view class="i-ic:baseline-qr-code-scanner text-48rpx text-#fff mb-8rpx"></view>
        <view class="text-24rpx text-#fff">我要核销</view>
      </view>
      <view
        class="w-223rpx bg-#00A3FF h-140rpx rounded-16rpx flex flex-col justify-center items-center"
      >
        <view class="i-ic:outline-document-scanner text-48rpx text-#fff mb-8rpx"></view>
        <view class="text-24rpx text-#fff">核销记录</view>
      </view>
      <view
        class="w-223rpx bg-#00A3FF h-140rpx rounded-16rpx flex flex-col justify-center items-center"
      >
        <view class="i-ic:outline-document-scanner text-48rpx text-#fff mb-8rpx"></view>
        <view class="text-24rpx text-#fff">我的套餐</view>
      </view>
    </view>

    <view class="ml-24rpx mr-24rpx mt-24rpx bg-white rounded-32rpx p-24rpx">
      <view class="text-center text-28rpx text-#666 font-bold pb-24rpx">门店活动</view>

      <view
        class="flex justify-between items-center text-32rpx text-#666 mb-16rpx pl-16rpx pr-16rpx"
      >
        <view>品类</view>
        <view>会员价</view>
      </view>

      <view
        class="flex justify-between items-center bg-#FFEAEA rounded-16rpx h-88rpx pl-16rpx pr-16rpx mb-8rpx text-32rpx"
        v-for="(item, i) in shopGoods"
        :key="i"
      >
        <view class="flex justify-center items-center">
          <view
            class="rounded-16rpx w-50rpx h-50rpx bg-#fff text-red font-bold text-28rpx flex items-center justify-center mr-8rpx"
          >
            {{ i + 1 }}
          </view>
          <view>{{ item.name }}</view>
        </view>
        <view>
          <text class="font-bold">{{ item.price }}</text>
          元/
          <text class="text-red font-bold">{{ item.count }}</text>
          次
        </view>
      </view>
    </view>

    <view class="p-32rpx">
      <wd-button :block="true" size="large">我要充会员</wd-button>
    </view>

    <ShopManageMenu :shop-id="shopId" />

    <view class="p-32rpx"></view>
  </view>
</template>

<script lang="ts" setup>
import ShopManageMenu from './components/shop-manage-menu.vue'

const shopLogo = ref('/static/images/1-man-lan.png')
const shopId = ref('')

const shopGoods = ref([
  {
    name: '直面屏',
    price: '100',
    count: '10',
  },
  {
    name: '曲面屏',
    price: '100',
    count: '10',
  },
  {
    name: '苹果手机',
    price: '100',
    count: '10',
  },
])
</script>

<style lang="scss" scoped></style>

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
