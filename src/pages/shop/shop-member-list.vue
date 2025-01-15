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
  <view class="pt-24rpx pb-24rpx">
    <view class="table-wrapper">
      <!-- <wd-table :data="dataList" rowHeight="200rpx">
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
        <wd-table-col prop="combo_price" label="套餐信息" width="480rpx">
          <template #value="{ row }">
            <view v-for="item in row.list" :key="item.id" class="mb-12rpx">
              <view class="text-red font-bold">
                {{ item.combo_name }} {{ item.combo_price }}元 {{ item.combo_num }}次
              </view>
              <view class="text-#666666 font-bold">剩余 {{ item.spare_num }}次</view>
              <view class="text-#666666 font-bold">核销 {{ item.use_num }}次</view>
              <view class="text-#666666 text-24rpx">开卡时间：{{ item.create_time_str }}</view>
            </view>
          </template>
        </wd-table-col>
      </wd-table> -->

      <wd-card v-for="row in dataList" :key="row.id">
        <template #title>
          <view class="flex items-center">
            <view class="mr-24rpx">
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

        <view class="text-#666666 font-bold mb-12rpx">会员拥有{{ row.list.length }}条套餐：</view>
        <view
          v-for="item in row.list"
          :key="item.id"
          class="bg-#F8F9FA rounded-12rpx p-24rpx mb-12rpx"
        >
          <view class="text-red font-bold">
            {{ item.combo_name }} {{ item.combo_price }}元 {{ item.combo_num }}次
          </view>
          <view class="text-#666666 font-bold">剩余 {{ item.spare_num }}次</view>
          <view class="text-#666666 font-bold">核销 {{ item.use_num }}次</view>
          <view class="text-#666666 text-24rpx">开卡时间：{{ item.create_time_str }}</view>
        </view>
      </wd-card>

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
const size = ref<number>(5)
const total = ref<number>(10)

const dataList = ref([])

type ResDataType = {
  count: number
  list: any[]
}

// 获取我的套餐
const getShopMemberList = () => {
  toast.loading('加载中...')
  httpPost(`/api/Shop/getShopUsers`, {
    token: userInfo.value.token,
    shop_id: shopId.value,
    page: page.value,
    size: size.value,
  })
    .then((res) => {
      const data = res.data as ResDataType

      total.value = data.count

      data.list = data.list || []

      data.list.forEach((item) => {
        item.create_time_str = dayjs(item.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')
        item.avatarUrl = `${baseUrl}${item.avatar}`

        item.list = item.list || []
        item.list.forEach((combo) => {
          combo.create_time_str = dayjs(combo.create_time * 1000).format('YYYY-MM-DD HH:mm:ss')
        })
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
  getShopMemberList()
})

onLoad((options) => {
  shopId.value = options.shopId

  getShopMemberList()
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

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
