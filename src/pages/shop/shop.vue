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
    <view class="bg-#00A3FF pl-32rpx pr-32rpx pb-16rpx flex w-750rpx box-border">
      <view class="mr-32rpx">
        <view class="h-140rpx w-140rpx bg-#fff rounded-70rpx flex justify-center items-center">
          <wd-img width="64" height="64" round :src="shopLogoUrl">
            <template #error>
              <view class="w-100% h-100% flex justify-center items-center">
                <view class="i-ic:twotone-storefront text-64rpx text-#00A3FF"></view>
              </view>
            </template>
          </wd-img>
        </view>
      </view>
      <view class="flex-1">
        <view class="text-white text-32rpx font-bold mb-16rpx">{{ shopInfo.shop_name }}</view>
        <view class="text-white text-28rpx">联系电话：{{ shopInfo.phone }}</view>
        <view class="text-white text-28rpx mb-16rpx">地址：{{ fullAddress }}</view>

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
          <view class="text-48rpx text-#00A3FF font-bold">{{ comboSpareNumTotal }}</view>
          <view class="text-28rpx text-#666">剩余贴膜次数</view>
        </view>
        <!-- <view class="flex flex-col items-center">
          <view class="text-48rpx text-#00A3FF font-bold">1000</view>
          <view class="text-28rpx text-#666">积分</view>
        </view> -->
      </view>
      <view class="text-28rpx text-#666 text-center pt-16rpx pb-16rpx">
        您当前有
        <text class="text-red font-bold">{{ myComboList.length }}</text>
        条套餐
      </view>
    </view>

    <view class="flex justify-between items-center ml-24rpx mr-24rpx">
      <view
        class="w-223rpx bg-#023A44 h-140rpx rounded-16rpx flex flex-col justify-center items-center"
        @click="jumperPage('/pages/member/member-combo-qr')"
      >
        <view class="i-ic:baseline-qr-code-scanner text-48rpx text-#fff mb-8rpx"></view>
        <view class="text-24rpx text-#fff">我要核销</view>
      </view>
      <view
        class="w-223rpx bg-#00A3FF h-140rpx rounded-16rpx flex flex-col justify-center items-center"
        @click="jumperPage('/pages/member/member-combo-log')"
      >
        <view class="i-ic:outline-document-scanner text-48rpx text-#fff mb-8rpx"></view>
        <view class="text-24rpx text-#fff">核销记录</view>
      </view>
      <view
        class="w-223rpx bg-#00A3FF h-140rpx rounded-16rpx flex flex-col justify-center items-center"
        @click="jumperPage('/pages/member/member-combo-list')"
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
        <view class="w-300rpx">套餐名称</view>
        <view>单价</view>
        <view class="flex-1 text-right">会员价</view>
      </view>

      <view
        class="flex justify-between items-center bg-#FFEAEA rounded-16rpx h-88rpx pl-16rpx pr-16rpx mb-8rpx text-28rpx"
        v-for="(item, i) in comboList"
        :key="i"
      >
        <view class="flex items-center w-300rpx">
          <view
            class="flex-shrink-0 rounded-16rpx w-50rpx h-50rpx bg-#fff text-red font-bold text-28rpx flex items-center justify-center mr-8rpx"
          >
            {{ i + 1 }}
          </view>
          <view>{{ item.combo_name }}</view>
        </view>
        <view>{{ item.unit_price }}</view>
        <view class="flex-1 text-right">
          <text class="font-bold">{{ item.combo_price }}</text>
          元/
          <text class="text-red font-bold">{{ item.combo_num }}</text>
          次
        </view>
      </view>
    </view>

    <view class="p-32rpx">
      <wd-button :block="true" size="large" @click="jumperPage('/pages/member/member-purchase')">
        我要充会员
      </wd-button>
    </view>

    <ShopManageMenu :shopId="shopId" />

    <view class="p-32rpx"></view>
  </view>
</template>

<script lang="ts" setup>
import ShopManageMenu from './components/shop-manage-menu.vue'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { wxLogin } from '@/utils/wxLogin'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const shopId = ref('')

const shopInfo = ref({
  shop_logo: '',
  shop_name: '',
  name: '',
  phone: '',
  address: '',
  province_id: null,
  province_name: '',
  city_id: null,
  city_name: '',
  area_id: null,
  area_name: '',
  latitude: '',
  longitude: '',
  shop_id: '',
  shop_qrcode: '',
  users_id: '',
})

const shopLogoUrl = computed(() => {
  return `${baseUrl}${shopInfo.value.shop_logo}`
})

const fullAddress = computed(() => {
  return `${shopInfo.value.province_name}${shopInfo.value.city_name}${shopInfo.value.area_name}${shopInfo.value.address}`
})

const comboList = ref([]) // 店铺套餐
const myComboList = ref([]) // 我的套餐

const comboSpareNumTotal = ref(0) // 套餐剩余次数

const getShopInfo = async () => {
  try {
    toast.loading('加载中...')
    const res = await httpPost('/api/Shop/getShopInfo', {
      token: userInfo.value.token,
      shop_id: shopId.value,
    })

    shopInfo.value = res.data as any
  } catch (error) {
    console.log(error)
  } finally {
    toast.close()
  }
}

// 店铺套餐
const getComboList = async () => {
  const res = await httpPost('/api/Shop/getShopComboList', {
    token: userInfo.value.token,
    shop_id: shopId.value,
  })

  comboList.value = res.data as any[]
}

// 获取我的套餐
const getMyComboList = async () => {
  try {
    const res = await httpPost('/api/UsersInfo/getUsersComboList', {
      token: userInfo.value.token,
      shop_id: shopId.value,
    })

    const data = (res.data || []) as any[]
    myComboList.value = data

    comboSpareNumTotal.value = data.reduce((total, item) => {
      return total + item.spare_num
    }, 0)

    console.log('getMyComboList', res)
  } catch (error) {
    console.log(error)
  } finally {
    toast.close()
  }
}

const jumperPage = (path: string) => {
  const fullPath = `${path}?shopId=${shopId.value}`

  uni.navigateTo({
    url: fullPath,
  })
}

const getShopData = () => {
  getShopInfo()
  getComboList()
  getMyComboList()
}

onLoad((options) => {
  shopId.value = options.shopId

  if (!userInfo.value.token) {
    wxLogin().then(() => {
      getShopData()
    })
  } else {
    getShopData()
  }
})
</script>

<style lang="scss" scoped></style>

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
