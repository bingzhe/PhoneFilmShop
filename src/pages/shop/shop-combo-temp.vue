<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '套餐模板',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="p-24rpx pb-160rpx">
    <wd-checkbox-group v-model="selectList" @change="handleChange">
      <view class="p-24rpx bg-white rounded-16rpx mb-24rpx" v-for="item in dataList" :key="item.id">
        <wd-checkbox :modelValue="item.id">
          <view>
            <view>
              <text class="text-28rpx text-#000">{{ item.combo_name }}</text>
            </view>
            <view class="flex justify-between">
              <view class="mr-16rpx">
                <text class="text-28rpx text-#666">单价：</text>
                <text class="text-28rpx text-#000">{{ item.unit_price }}</text>
              </view>
              <view class="mr-16rpx">
                <text class="text-28rpx text-#666">会员价：</text>
                <text class="text-28rpx text-#000">{{ item.combo_price }}</text>
              </view>
              <view>
                <text class="text-28rpx text-#666">次数:</text>
                <text class="text-28rpx text-#000">{{ item.combo_num }}</text>
              </view>
            </view>
          </view>
        </wd-checkbox>
      </view>
    </wd-checkbox-group>

    <view
      class="position-fixed bottom-0 left-0 right-0 p-24rpx bg-white flex justify-center items-center"
    >
      <wd-button type="info" size="large" class="mr-24rpx" @click="goBack">返回</wd-button>
      <wd-button type="primary" size="large" @click="onSelectComboTemp">确定</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'

const userStore = useUserStore()
const toast = useToast()

const shopId = ref('')

const dataList = ref<any[]>([])

const selectList = ref<any[]>([])

const handleChange = ({ value }: any) => {
  // console.log(value, 'value1')
}

// api/Shop/saveShopComboById
const onSelectComboTemp = () => {
  console.log(selectList.value, 'selectList')

  toast.loading('保存中...')
  httpPost('/api/Shop/saveShopComboById', {
    token_order: userStore.getToken(),
    shop_id: shopId.value,
    ids: selectList.value.join(','),
  })
    .then((res) => {
      toast.success('保存成功')

      setTimeout(() => {
        toast.close()
        uni.navigateBack()
      }, 1000)
    })
    .finally(() => {})
}

const goBack = () => {
  uni.navigateBack()
}

// api/Shop/getComboList  套餐模板列表
const getComboTempList = () => {
  const token = userStore.getToken()

  httpPost('/api/Shop/getComboList', {
    token_order: token,
    shop_id: shopId.value,
  })
    .then((res) => {
      // console.log(res, 'res')
      dataList.value = res.data as any[]

      dataList.value.forEach((item) => {
        item.checked = false
      })
    })
    .finally(() => {})
}

onLoad((options) => {
  shopId.value = options.shopId
  getComboTempList()
})
</script>

<style lang="scss" scoped>
::v-deep .wd-checkbox-group {
  background: transparent !important;
}

::v-deep .wd-checkbox {
  margin-bottom: 0 !important;
}
</style>

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
