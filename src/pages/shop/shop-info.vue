<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '店铺详情',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="flex items-center justify-center p-80rpx">
      <wd-img width="180rpx" height="180rpx" round :src="shopLogoUrl">
        <template #error>
          <view class="w-100% h-100% flex justify-center items-center">
            <view class="i-ic:twotone-storefront text-80rpx text-#00A3FF"></view>
          </view>
        </template>
      </wd-img>
    </view>

    <view class="text-48rpx text-#666666 text-center mb-48rpx font-bold">
      {{ shopInfo.shop_name }}
    </view>

    <view class="text-32rpx text-center mb-24rpx" @click="callPhone">
      联系电话：{{ shopInfo.phone }}（点击拨打电话）
    </view>
    <view class="text-32rpx text-center mb-24rpx">联系人：{{ shopInfo.name }}</view>
    <view class="text-32rpx text-center mb-24rpx">地址：{{ shopInfo.full_address }}</view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const shopId = ref('')

const shopInfo = ref({
  shop_name: '',
  shop_logo: '',
  phone: '',
  name: '',
  full_address: '',
})

// 调起拨打电话
const callPhone = () => {
  if (shopInfo.value.phone) {
    uni.makePhoneCall({
      phoneNumber: shopInfo.value.phone,
    })
  }
}

const shopLogoUrl = computed(() => {
  return `${baseUrl}${shopInfo.value.shop_logo}`
})

function getShopInfo() {
  const token = userStore.getToken()

  httpPost('/api/Shop/getShopInfo', {
    token,
    shop_id: shopId.value,
  }).then((res) => {
    const resultData = res.data as any

    shopInfo.value.shop_name = resultData.shop_name
    shopInfo.value.phone = resultData.phone
    shopInfo.value.name = resultData.name
    shopInfo.value.shop_logo = resultData.shop_logo
    shopInfo.value.full_address = `${resultData.province_name}${resultData.city_name}${resultData.area_name}${resultData.address}`
  })
}

onLoad((options) => {
  if (options.shopId) {
    shopId.value = options.shopId
    // 获取店铺信息
    getShopInfo()
  }
})
</script>

<style lang="scss" scoped>
//
</style>
