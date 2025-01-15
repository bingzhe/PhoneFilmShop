<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '核销记录',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="table-wrapper">
      <wd-table :data="dataList" rowHeight="150rpx">
        <wd-table-col prop="combo_price" label="序号" width="100rpx" align="center">
          <template #value="{ index }">
            <view>{{ index + 1 }}</view>
          </template>
        </wd-table-col>
        <wd-table-col prop="combo_name" label="核销套餐" width="170rpx"></wd-table-col>
        <wd-table-col prop="combo_price" label="核销详情" width="480rpx">
          <template #value="{ row }">
            <view>
              <view>套餐详情：{{ row.combo_price }}元/{{ row.combo_num }}次</view>
              <view>核销店铺：{{ row.shop_name }}</view>
              <view>核销时间：{{ row.create_time_str }}</view>
            </view>
          </template>
        </wd-table-col>
      </wd-table>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import dayjs from 'dayjs'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const shopId = ref('')
const dataList = ref([])

// 获取核销记录
const getComboLog = () => {
  toast.loading('加载中...')
  httpPost(`/api/UsersInfo/getUsersComboLog`, {
    token: userInfo.value.token,
    shop_id: shopId.value,
  })
    .then((res) => {
      const data = (res.data || []) as any[]
      data.forEach((item) => {
        item.create_time_str = dayjs(item.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')
      })
      dataList.value = data
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
.table-wrapper {
  --wot-table-font-size: 14px;
}

::v-deep .wd-table__header {
  font-weight: bold;
}
</style>
