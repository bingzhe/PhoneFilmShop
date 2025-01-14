<template>
  <view class="ml-24rpx mr-24rpx mt-24rpx bg-white rounded-32rpx p-24rpx">
    <view class="text-center text-28rpx text-#666 font-bold pb-24rpx">门店管理</view>

    <view
      class="flex flex-wrap justify-center items-center border-b-#eee border-b-1 border-l-0 border-r-0 border-t-0 border-solid pb-12rpx"
    >
      <view
        class="w-25% flex flex-col items-center pt-12rpx pb-12rpx"
        @click="jumperPage('/pages/member/member-audit')"
      >
        <view class="mb-12rpx">
          <view class="i-mingcute:vip-1-line text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">会员审核</view>
      </view>

      <view
        class="w-25% flex flex-col items-center pt-12rpx pb-12rpx"
        @click="jumperPage('/pages/shop/shop-combo-check')"
      >
        <view class="mb-12rpx">
          <view class="i-ic:baseline-qr-code-scanner text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">贴膜核销</view>
      </view>

      <view
        class="w-25% flex flex-col items-center pt-12rpx pb-12rpx"
        @click="jumperPage('/pages/shop/shop-combo-log')"
      >
        <view class="mb-12rpx">
          <view class="i-ic:outline-document-scanner text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">核销记录</view>
      </view>

      <view
        class="w-25% flex flex-col items-center pt-12rpx pb-12rpx"
        @click="jumperPage('/pages/shop/shop-member-list')"
      >
        <view class="mb-12rpx">
          <view class="i-mingcute:vip-1-line text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">门店会员</view>
      </view>
    </view>

    <view class="flex flex-wrap pt-12rpx justify-center items-center">
      <view
        class="w-25% flex flex-col items-center pt-12rpx pb-12rpx"
        @click="jumperPage('/pages/shop/shop-combo')"
      >
        <view class="mb-12rpx">
          <view class="i-ic:baseline-addchart text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">套餐定制</view>
      </view>

      <view class="w-25% flex flex-col items-center pt-12rpx pb-12rpx">
        <view class="mb-12rpx">
          <view class="i-ic:outline-cloud-download text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">下载店码</view>
      </view>

      <!-- <view class="w-25% flex flex-col items-center pt-12rpx pb-12rpx">
        <view class="mb-12rpx">
          <view class="i-ic:baseline-drive-folder-upload text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">设置店标</view>
      </view> -->

      <view
        class="w-25% flex flex-col items-center pt-12rpx pb-12rpx"
        @click="jumperPage('/pages/shop/shop-edit')"
      >
        <view class="mb-12rpx">
          <view class="i-ic:outline-edit-calendar text-#666 text-48rpx"></view>
        </view>
        <view class="text-24rpx text-#666666">基本信息</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  shopId: any
}>()

const jumperPage = (path: string) => {
  const fullPath = `${path}?shopId=${props.shopId}`

  uni.navigateTo({
    url: fullPath,
  })
}
</script>

<style lang="scss" scoped>
//
</style>
