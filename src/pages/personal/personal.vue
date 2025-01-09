<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '我',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="flex items-center p-32rpx bg-white mb-24rpx">
      <view class="mr-32rpx">
        <wd-img width="48" height="48" round :src="avatar">
          <template #error>
            <view class="w-100% h-100% flex justify-center items-center">
              <wd-img width="48" height="48" round src="/static/images/1-man-lan.png"></wd-img>
            </view>
          </template>
          <template #loading>
            <view class="w-100% h-100% flex justify-center items-center">
              <wd-loading />
            </view>
          </template>
        </wd-img>
      </view>
      <view>
        <view class="text-32rpx">{{ nickname || '佚名' }}</view>
        <view class="text-32rpx">{{ phone || '手机号未设置' }}</view>
      </view>
    </view>

    <view class="bg-white p-32rpx">
      <view
        class="flex items-center justify-center font-bold h-88rpx text-36rpx border-rd-[50rpx] bg-#F1F1F1 text-#666666"
      >
        商家区
      </view>

      <view class="p-32rpx flex flex-col items-center" @click="goShop">
        <view>
          <view class="i-ic-twotone-storefront text-#00A3FF text-48rpx"></view>
        </view>
        <view class="text-32rpx text-#666666">我的店铺</view>
      </view>

      <view class="p-32rpx flex flex-col items-center" @click="goShopEdit">
        <view>
          <view class="i-ic-baseline-drive-file-rename-outline text-#00A3FF text-48rpx"></view>
        </view>
        <view class="text-32rpx text-#666666">店铺登记</view>
      </view>

      <view
        class="flex items-center justify-center font-bold h-88rpx text-36rpx border-rd-[50rpx] bg-#F1F1F1 text-#666666"
      >
        用户区
      </view>

      <view class="p-32rpx flex justify-between">
        <view class="p-32rpx flex flex-col items-center">
          <view>
            <view class="i-ic-twotone-storefront text-#00A3FF text-48rpx"></view>
          </view>
          <view class="text-32rpx text-#666666">个人信息</view>
        </view>
        <view class="p-32rpx flex flex-col items-center">
          <view>
            <view class="i-ic-baseline-drive-file-rename-outline text-#00A3FF text-48rpx"></view>
          </view>
          <view class="text-32rpx text-#666666">联系客服</view>
        </view>
        <view class="p-32rpx flex flex-col items-center">
          <view>
            <view class="i-ic-twotone-storefront text-#00A3FF text-48rpx"></view>
          </view>
          <view class="text-32rpx text-#666666">意见反馈</view>
        </view>
      </view>
    </view>

    <view class="p-32rpx">
      <wd-button :block="true" @click="logout" size="large">退出登录</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
//

const avatar = ref('111')
const nickname = ref('')
const phone = ref('')

const logout = () => {
  // uni.clearStorage()
  // uni.reLaunch({
  //   url: '/pages/login/login',
  // })
}

const goShop = () => {
  uni.reLaunch({
    url: '/pages/shop/shop',
  })
}

const goShopEdit = () => {
  uni.navigateTo({
    url: '/pages/shop/shop-edit',
  })
}
</script>

<style lang="scss" scoped>
//
</style>

<style>
page {
  background: #f9f9f9;
}
</style>
