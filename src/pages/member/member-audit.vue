<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '会员审核',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="color-#666 text-32rpx text-center pt-48rpx bg-white">
      扫描会员申请码，再选择充值套餐
    </view>

    <view class="flex items-center justify-center pt-60rpx pb-60rpx bg-white">
      <view class="w-200rpx h-200rpx bg-#F7F7F7 rounded-100rpx flex justify-center items-center">
        <view class="i-ic:baseline-qr-code-scanner text-80rpx text-#666"></view>
      </view>
    </view>

    <view class="bg-#F7F7F7 pl-24rpx pr-24rpx flex items-center justify-between h-200rpx">
      <view class="text-28rpx text-#666 flex-1 flex flex-col items-center">
        <view>
          <view class="i-ic-twotone-storefront text-#00A3FF text-68rpx"></view>
        </view>
        <view class="text-28rpx text-#666666">店铺名称</view>
      </view>
      <view class="text-58rpx text-#666 font-bold i-carbon:arrows-horizontal"></view>
      <view class="text-28rpx text-#666 flex-1 flex flex-col items-center">
        <view>
          <view class="i-ic-twotone-storefront text-#00A3FF text-68rpx"></view>
        </view>
        <view class="text-28rpx text-#666666">会员昵称</view>
      </view>
    </view>

    <wd-picker
      :columns="shopGoods"
      label="选择套餐"
      required
      v-model="value"
      @confirm="handleConfirm"
    />

    <view class="p-96rpx">
      <wd-button size="large" block>提交</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
//

const value = ref('')
const shopGoods = ref([
  {
    value: '1',
    label: '直面屏 100元 10次',
  },
  {
    value: '2',
    label: '曲面屏 100元 10次',
  },
  {
    value: '3',
    label: '苹果手机 100元 10次',
  },
])

const handleConfirm = (e) => {
  console.log(e)
}
</script>

<style lang="scss" scoped>
//
</style>

<style lang="scss">
//
page {
  background-color: #f9f9f9;
}
</style>
