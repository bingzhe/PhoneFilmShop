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
      <view
        @click="handleScan"
        class="w-200rpx h-200rpx bg-#F7F7F7 rounded-100rpx flex justify-center items-center"
      >
        <view class="i-ic:baseline-qr-code-scanner text-80rpx text-#666"></view>
      </view>
    </view>

    <view class="bg-#F7F7F7 pl-24rpx pr-24rpx flex items-center justify-between h-200rpx">
      <view class="text-28rpx text-#666 flex-1 flex flex-col items-center">
        <view>
          <view class="i-ic-twotone-storefront text-#00A3FF text-68rpx"></view>
        </view>
        <view class="text-28rpx text-#666666">{{ shopInfo.shop_name }}</view>
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
      :columns="comboList"
      label="选择套餐"
      required
      v-model="selectCombo"
      @confirm="handleConfirm"
    />

    <view class="p-96rpx">
      <wd-button size="large" block>提交</wd-button>
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

const selectCombo = ref('')
const comboList = ref([])

const shopInfo = ref({
  shop_logo: '',
  shop_name: '',
})

const memberUserInfo = ref({})

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

  const data = (res.data || []) as any[]

  comboList.value = data.map((item) => {
    return {
      value: item.id,
      label: `${item.combo_name} ${item.combo_price}元 ${item.combo_num}次`,
    }
  })
}

// 调起来扫码
const handleScan = () => {
  uni.scanCode({
    success: (res) => {
      console.log('success', res)

      const { result } = res
      const resultObj = JSON.parse(result)

      console.log('resultObj', resultObj)
    },
    fail: (err) => {
      console.log(err)
    },
  })
}

const handleConfirm = (e) => {
  console.log(e)
}

onLoad((options) => {
  shopId.value = options.shopId

  getShopInfo()
  getComboList()
})
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
