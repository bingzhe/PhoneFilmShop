<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '套餐管理',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="text-26rpx">
    <view class="table-wrapper pb-80rpx">
      <wd-table :data="dataList">
        <wd-table-col prop="combo_name" label="套餐名称" width="175rpx"></wd-table-col>
        <wd-table-col prop="unit_price" label="单价" width="100rpx" align="center"></wd-table-col>
        <wd-table-col prop="combo_price" label="总价" width="125rpx" align="center"></wd-table-col>
        <wd-table-col prop="combo_num" label="次数" width="100rpx" align="center"></wd-table-col>
        <wd-table-col prop="opr" label="操作" width="250rpx" align="center">
          <template #value="{ row, index }">
            <view class="flex items-center">
              <view
                v-if="index !== dataListLength - 1"
                class="flex items-center justify-center w-30px h-30px bg-#00A3FF rounded-4rpx text-#fff mr-24rpx"
                @click="handleArrowDown(row, index)"
              >
                <wd-icon name="arrow-thin-down" size="22px"></wd-icon>
              </view>

              <view
                v-if="index !== 0"
                class="flex items-center justify-center w-30px h-30px bg-#00A3FF rounded-4rpx text-#fff mr-24rpx"
                @click="handleArrowUp(row, index)"
              >
                <wd-icon name="arrow-thin-up" size="22px"></wd-icon>
              </view>

              <view
                class="flex items-center justify-center w-30px h-30px bg-red rounded-4rpx text-#fff"
                @click="handleDelete(row)"
              >
                <wd-icon name="delete" size="20px"></wd-icon>
              </view>
            </view>
          </template>
        </wd-table-col>
      </wd-table>
    </view>

    <view class="p-32rpx">
      <wd-form ref="formRef" :model="formModel">
        <view
          class="pt-24rpx"
          style="background: #fff; border-radius: 20rpx; box-shadow: rgb(0 0 0 / 15%) 0px 2px 4px"
        >
          <view class="text-28rpx font-bold text-center pt-12rpx pb-12rpx text-#333">添加套餐</view>
          <wd-cell-group border style="border-bottom: 1rpx solid #e8e8e8; border-radius: 20rpx">
            <wd-input
              label="套餐名称"
              label-width="80px"
              prop="combo_name"
              clearable
              v-model="formModel.combo_name"
              placeholder="请输入套餐名称"
              :rules="[{ required: true, message: '请填写套餐名称' }]"
            />
            <wd-input
              label="单价"
              type="number"
              label-width="80px"
              prop="unit_price"
              clearable
              v-model="formModel.unit_price"
              placeholder="请输入单价"
              :rules="[{ required: true, message: '请填写单价' }]"
            />
            <wd-input
              label="总价"
              type="number"
              label-width="80px"
              prop="combo_price"
              clearable
              v-model="formModel.combo_price"
              placeholder="请输入价格"
              :rules="[{ required: true, message: '请填写单价' }]"
            />

            <wd-input
              label="次数"
              type="number"
              label-width="80px"
              prop="combo_num"
              clearable
              v-model="formModel.combo_num"
              placeholder="请输入次数"
              :rules="[{ required: true, message: '请填写次数' }]"
            />
            <view class="p-24rpx">
              <wd-button type="primary" size="large" @click="handleSubmit" block>提交</wd-button>
            </view>
          </wd-cell-group>

          <view class="h-20rpx"></view>
        </view>
      </wd-form>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const toast = useToast()

const shopId = ref('')

const dataList = ref<any[]>([])

const dataListLength = computed(() => dataList.value.length)

const formModel = reactive({
  combo_name: '',
  unit_price: '',
  combo_price: '',
  combo_num: '',
})

const formRef = ref()

const handleSubmit = () => {
  formRef.value
    .validate()
    .then(({ valid, errors }) => {
      if (valid) {
        const token = userStore.getToken()

        const params = {
          token,
          shop_id: shopId.value,
          combo_name: formModel.combo_name,
          combo_price: formModel.combo_price,
          combo_num: formModel.combo_num,
          unit_price: formModel.unit_price,
        }

        toast.loading('加载中...')
        httpPost('/api/Shop/saveShopCombo', params)
          .then((res) => {
            getShopComboList()
            formModel.combo_name = ''
            formModel.unit_price = ''
            formModel.combo_price = ''
            formModel.combo_num = ''
          })
          .finally(() => {})
      }
    })
    .catch((error) => {
      console.log(error, 'error')
    })
}

const handleArrowDown = (row, index) => {
  if (index >= dataList.value.length - 1) return

  // 交换位置
  const dataListCopy = JSON.parse(JSON.stringify(dataList.value))

  const temp = dataListCopy[index]
  dataListCopy[index] = dataListCopy[index + 1]
  dataListCopy[index + 1] = temp

  // 获取新的id数组
  const ids = dataListCopy.map((item) => item.id)
  const sorts = dataListCopy.map((item, index) => index + 1)
  const token = userStore.getToken()

  toast.loading('加载中...')

  //   调用接口更新排序
  httpPost('/api/Shop/saveShopComboSort', {
    token,
    shop_id: shopId.value,
    ids: ids.join(','),
    sorts: sorts.join(','),
  })
    .then(() => {
      getShopComboList()
    })
    .finally(() => {})
}

const handleArrowUp = (row, index) => {
  if (index <= 0) return

  const dataListCopy = JSON.parse(JSON.stringify(dataList.value))

  const temp = dataListCopy[index]
  dataListCopy[index] = dataListCopy[index - 1]
  dataListCopy[index - 1] = temp

  const ids = dataListCopy.map((item) => item.id)
  const sorts = dataListCopy.map((item, index) => index + 1)
  const token = userStore.getToken()

  toast.loading('加载中...')

  //   调用接口更新排序
  httpPost('/api/Shop/saveShopComboSort', {
    token,
    shop_id: shopId.value,
    ids: ids.join(','),
    sorts: sorts.join(','),
  })
    .then(() => {
      getShopComboList()
    })
    .finally(() => {})
}

const handleDelete = (row) => {
  const id = row.id
  const token = userStore.getToken()

  toast.loading('加载中...')
  httpPost('/api/Shop/delShopCombo', {
    shop_id: shopId.value,
    token,
    id,
  })
    .then((res) => {
      getShopComboList()
    })
    .finally(() => {})
}

const getShopComboList = () => {
  // api/Shop/getShopComboList

  const token = userStore.getToken()

  toast.loading('加载中...')

  httpPost('/api/Shop/getShopComboList', {
    token,
    shop_id: shopId.value,
  })
    .then((res) => {
      dataList.value = res.data as any[]
    })
    .finally(() => {
      toast.close()
    })
}

onLoad((options) => {
  shopId.value = options.shopId
  getShopComboList()
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
  padding-right: 10rpx !important;
  padding-left: 10rpx !important;
}
</style>

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
