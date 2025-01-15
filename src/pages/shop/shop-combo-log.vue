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
  <view class="">
    <view class="table-wrapper">
      <wd-table :data="dataList" rowHeight="150rpx">
        <wd-table-col prop="combo_price" label="序号" width="100rpx" align="center">
          <template #value="{ index }">
            <view>{{ index + 1 }}</view>
          </template>
        </wd-table-col>
        <wd-table-col prop="combo_name" label="会员" width="170rpx" align="center">
          <template #value="{ row }">
            <view>
              <view class="flex justify-center">
                <wd-img width="32" height="32" round :src="row.avatarUrl">
                  <template #error>
                    <view class="w-100% h-100% flex justify-center items-center">
                      <wd-img
                        width="32"
                        height="32"
                        round
                        src="/static/images/default_avatar.png"
                      ></wd-img>
                    </view>
                  </template>
                </wd-img>
              </view>
              <view class="text-#666666 font-bold">{{ row.nikename }}</view>
            </view>
          </template>
        </wd-table-col>
        <wd-table-col prop="combo_price" label="核销信息" width="480rpx">
          <template #value="{ row }">
            <view>
              <view>套餐名称：{{ row.combo_name }}</view>
              <view>套餐详情：{{ row.combo_price }}元/{{ row.combo_num }}次</view>
              <view>核销时间：{{ row.create_time_str }}</view>
            </view>
          </template>
        </wd-table-col>
      </wd-table>

      <wd-pagination v-model="page" :page-size="size" :total="total" show-message></wd-pagination>
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

const page = ref<number>(1)
const size = ref<number>(6)
const total = ref<number>(10)

const dataList = ref([])

// avatar: '/public/uploads/img/1736867526.jpeg'
// check_users_id: 1
// combo_name: '套餐1'
// combo_num: 5
// combo_price: '100.00'
// create_time: 1736911805
// id: null
// nikename: 'skyblue'
// shop_id: 2
// shop_logo: '/public/uploads/img/1736848257.png'
// shop_name: '测试店铺1'
// users_combo_id: 3
// users_id: 2

type ResDataType = {
  count: number
  list: any[]
}

const getComboLog = () => {
  toast.loading('加载中...')
  httpPost(`/api/Shop/getShopComboLog`, {
    token: userInfo.value.token,
    shop_id: shopId.value,
    page: page.value,
    size: size.value,
  })
    .then((res) => {
      const data = res.data as ResDataType

      total.value = data.count

      data.list.forEach((item) => {
        item.create_time_str = dayjs(item.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')
        item.avatarUrl = `${baseUrl}${item.avatar}`
      })
      dataList.value = data.list
      // console.log('res', res)
    })
    .catch((err) => {
      console.log('err', err)
    })
    .finally(() => {
      toast.close()
    })
}

watch(page, () => {
  getComboLog()
})

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
