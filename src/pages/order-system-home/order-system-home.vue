<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '订单系统',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="p-64rpx">
    <view>
      <wd-button
        block
        size="large"
        type="success"
        custom-class="mb-64rpx custom-shadow"
        @click="handleOrderSystem"
      >
        下单系统
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleOrderSystem = () => {
  uni.navigateTo({
    url: '/pages/order-system/category/category',
  })
}
</script>

<style lang="scss" scoped>
//
</style>
