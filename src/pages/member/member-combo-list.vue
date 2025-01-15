<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '我的套餐',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view>
    <view class="table-wrapper">
      <wd-table :data="dataList" rowHeight="200rpx">
        <wd-table-col prop="combo_name" label="套餐名称" width="200rpx"></wd-table-col>
        <wd-table-col prop="combo_price" label="套餐详情" width="550rpx">
          <template #value="{ row }">
            <view>
              <view>套餐详情：{{ row.combo_price }}元/{{ row.combo_num }}次</view>
              <view>核销次数：{{ row.use_num }}次</view>
              <view>
                剩余次数：
                <text class="font-bold text-#00A3FF">{{ row.spare_num }}次</text>
              </view>
              <view>最后核销时间：{{ row.use_time_str }}</view>
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

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const shopId = ref('')

const dataList = ref([]) // 我的套餐

// 获取我的套餐
const getMyComboList = async () => {
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

  getMyComboList()
})
</script>

<style lang="scss" scoped>
.table-wrapper {
  --wot-table-font-size: 14px;
}

::v-deep .wd-table__header {
  font-weight: bold;
}

::v-deep .wd-table__cell {
  //   padding-right: 10rpx !important;
  //   padding-left: 10rpx !important;
}
</style>

<style lang="scss">
page {
  //   background: #f9f9f9;
}
</style>
