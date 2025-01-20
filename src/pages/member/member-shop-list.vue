<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '购买过的店铺',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view
      class="bg-#fff p-32rpx flex w-702rpx box-border m-24rpx rounded-24rpx custom-shadow"
      v-for="item in dataList"
      :key="item.shop_id"
      @click="goShop(item.shop_id)"
    >
      <view class="mr-32rpx">
        <view class="h-140rpx w-140rpx bg-#fff rounded-70rpx flex justify-center items-center">
          <wd-img width="64" height="64" round :src="item.shopLogoUrl">
            <template #error>
              <view class="w-100% h-100% flex justify-center items-center">
                <view class="i-ic:twotone-storefront text-64rpx text-#00A3FF"></view>
              </view>
            </template>
          </wd-img>
        </view>
      </view>
      <view class="flex-1">
        <view class="text-#333333 text-32rpx font-bold mb-16rpx">{{ item.shop_name }}</view>
        <view class="text-#333333 text-28rpx">联系电话：{{ item.phone }}</view>
        <view class="text-#333333 text-28rpx mb-16rpx">地址：{{ item.fullAddress }}</view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const dataList = ref([])

// api/Shop/getShopList

const getShopList = async () => {
  try {
    toast.loading('加载中...')
    const res = await httpPost('/api/Shop/getShopList', {
      token: userInfo.value.token,
    })

    const data = (res.data || []) as any[]
    data.forEach((item) => {
      item.shopLogoUrl = `${baseUrl}${item.shop_logo}`
      item.fullAddress = `${item.province_name}${item.city_name}${item.area_name}${item.address}`
    })
    dataList.value = data

    // console.log('dataList', dataList.value)
  } catch (error) {
    console.log(error)
  } finally {
    toast.close()
  }
}

const goShop = (shopId: string) => {
  uni.navigateTo({
    url: `/pages/shop/shop?shopId=${shopId}`,
  })
}

onLoad(() => {
  getShopList()
})
</script>

<style lang="scss" scoped>
.custom-shadow {
  box-shadow:
    0 3px 1px -2px rgb(0 0 0 / 20%),
    0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
}
</style>

<style lang="scss">
page {
  background-color: #f9f9f9;
}
</style>
