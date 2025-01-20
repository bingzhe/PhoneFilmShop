<route lang="json5" type="home">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<template>
  <view class="flex justify-center pt-30vh">
    <wd-img width="56" height="56" round src="/static/images/logo.png"></wd-img>
  </view>
</template>

<script lang="ts" setup>
import { wxLogin } from '@/utils/wxLogin'
import { getUserInfo } from '@/service/user'

onLoad(async (options) => {
  try {
    const shopId = options.shopId

    await wxLogin()
    await getUserInfo()

    if (shopId) {
      uni.reLaunch({
        url: `/pages/shop/shop?shopId=${shopId}`,
      })
    } else {
      uni.switchTab({
        url: '/pages/index/index',
      })
    }
  } catch (error) {
    console.log(error)
  }
})
</script>

<style lang="scss" scoped>
//
</style>
