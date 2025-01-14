<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '会员贴膜核销',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="color-#666 text-32rpx text-center pt-48rpx bg-white pl-48rpx pr-48rpx">
      扫描会员核销码，每核销一次，当前会员剩余贴膜会减少一次
    </view>

    <view class="flex items-center justify-center pt-60rpx pb-60rpx bg-white">
      <view
        @click="handleScan"
        class="w-200rpx h-200rpx bg-#F7F7F7 rounded-100rpx flex justify-center items-center"
      >
        <view class="i-ic:baseline-qr-code-scanner text-80rpx text-#666"></view>
      </view>
    </view>

    <view class="bg-#F7F7F7 pl-24rpx pr-24rpx flex items-center justify-between h-200rpx">
      <view class="text-28rpx text-#666 flex-1 flex flex-col items-center">
        <wd-img width="80rpx" height="80rpx" round :src="shopLogoUrl">
          <template #error>
            <view class="w-100% h-100% flex justify-center items-center">
              <view class="i-ic:twotone-storefront text-80rpx text-#00A3FF"></view>
            </view>
          </template>
        </wd-img>
        <view class="text-28rpx text-#666666">{{ shopInfo.shop_name }}</view>
      </view>
      <view class="text-58rpx text-#666 font-bold i-carbon:arrows-horizontal"></view>
      <view class="text-28rpx text-#666 flex-1 flex flex-col items-center">
        <!-- <wd-img width="80rpx" height="80rpx" round :src="avatarUrl">
          <template #error>
            <view class="w-100% h-100% flex justify-center items-center">
              <view class="i-carbon:user-avatar-filled text-80rpx text-#00A3FF"></view>
            </view>
          </template>
        </wd-img> -->
        <view v-if="comboInfo.combo_name" class="text-28rpx text-#666666">
          {{ comboInfo.combo_name }}
        </view>
        <view v-if="comboInfo.spare_num" class="text-28rpx text-#666666">
          剩余次数：{{ comboInfo.spare_num }}次
        </view>
      </view>
    </view>

    <view class="p-96rpx">
      <wd-button size="large" block @click="handleSave">提交</wd-button>
    </view>
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
const comboId = ref('')

const shopInfo = ref({
  shop_logo: '',
  shop_name: '',
})

const shopLogoUrl = computed(() => {
  return `${baseUrl}${shopInfo.value.shop_logo}`
})

const comboInfo = ref({
  combo_name: '',
  combo_price: '',
  combo_num: '',
  spare_num: '',
})

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

// 调起来扫码
const handleScan = () => {
  uni.scanCode({
    success: (res) => {
      console.log('扫码信息', res)

      const { result } = res
      const scanResult = JSON.parse(result)

      const { shopId: scanShopId, comboId: scanComboId } = scanResult

      if (scanShopId !== shopId.value) {
        toast.error('店铺不匹配')
        return
      }

      comboId.value = scanComboId

      httpPost('/api/UsersInfo/getUsersComboInfo', {
        token: userInfo.value.token,
        id: scanComboId,
      })
        .then((res) => {
          // console.log('套餐详情', res)
          const data = res.data as any

          comboInfo.value = data
        })
        .catch((err) => {
          console.log('err', err)
        })
    },
    fail: (err) => {
      console.log(err)
    },
  })
}

const handleSave = () => {
  if (!comboId.value) {
    toast.error('请先扫描会员核销码')
    return
  }

  toast.loading('提交中...')

  httpPost('/api/Shop/checkCombo', {
    token: userInfo.value.token,
    id: comboId.value,
  })
    .then((res) => {
      console.log('res', res)
      toast.success('核销成功')
      setTimeout(() => {
        uni.navigateBack()
      }, 1000)
    })
    .catch((err) => {
      console.log('err', err)
    })
    .finally(() => {
      toast.close()
    })
}

onLoad((options) => {
  shopId.value = options.shopId

  getShopInfo()
})
</script>

<style lang="scss" scoped>
//
</style>

<style lang="scss">
//
// page {
//   background-color: #f9f9f9;
// }
</style>
