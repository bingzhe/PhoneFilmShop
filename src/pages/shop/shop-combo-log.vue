<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '店铺核销记录',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class=""></view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const shopId = ref('')

const getComboLog = () => {
  toast.loading('加载中...')
  httpPost(`/api/Shop/getShopComboLog`, {
    token: userInfo.value.token,
    shop_id: shopId.value,
  })
    .then((res) => {
      console.log('res', res)
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

  getComboLog()
})
</script>

<style lang="scss" scoped>
//
</style>
