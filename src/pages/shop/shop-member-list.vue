<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '门店会员',
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
import dayjs from 'dayjs'

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const shopId = ref('')

const dataList = ref([])

// 获取我的套餐
const getShopMemberList = async () => {
  try {
    toast.loading('加载中...')
    const res = await httpPost('/api/UsersInfo/getUsersComboList', {
      token: userInfo.value.token,
      shop_id: shopId.value,
    })

    const data = (res.data || []) as any[]
    data.forEach((item) => {
      item.use_time_str = dayjs(item.use_time * 1000).format('YYYY-MM-DD HH:mm:ss')
    })
    dataList.value = data

    console.log('dataList', dataList.value)
  } catch (error) {
    console.log(error)
  } finally {
    toast.close()
  }
}

onLoad((options) => {
  shopId.value = options.shopId

  getShopMemberList()
})
</script>

<style lang="scss" scoped>
//
</style>
