<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '店员管理',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="text-26rpx">
    <view class="table-wrapper pb-80rpx">
      <wd-table :data="dataList" :rowHeight="68">
        <wd-table-col prop="combo_name" label="头像" width="200rpx" align="center">
          <template #value="{ row }">
            <wd-img width="48" height="48" round :src="row.avatarUrl">
              <template #error>
                <view class="w-100% h-100% flex justify-center items-center">
                  <view class="i-carbon:user-avatar-filled text-64rpx text-#00A3FF"></view>
                </view>
              </template>
            </wd-img>
          </template>
        </wd-table-col>
        <wd-table-col prop="nikename" label="昵称" width="215rpx" align="center"></wd-table-col>
        <wd-table-col prop="phone" label="手机号" width="215rpx" align="center"></wd-table-col>
        <wd-table-col prop="opr" label="操作" width="120rpx" align="center">
          <template #value="{ row }">
            <view class="flex items-center flex-wrap justify-center w-100rpx">
              <view
                class="flex items-center justify-center w-60rpx h-60rpx bg-red rounded-4rpx text-#fff"
                @click="handleDelete(row)"
              >
                <wd-icon name="delete" size="40rpx"></wd-icon>
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
          <view class="text-28rpx font-bold text-center pt-12rpx pb-12rpx text-#333">添加店员</view>
          <wd-cell-group border style="border-bottom: 1rpx solid #e8e8e8; border-radius: 20rpx">
            <wd-input
              label="手机号"
              label-width="80px"
              prop="phone"
              clearable
              v-model="formModel.phone"
              placeholder="请输入员工手机号"
              :rules="[{ required: true, message: '请填写手机号' }]"
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

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const toast = useToast()

const shopId = ref('')

const dataList = ref<any[]>([])

const formModel = reactive({
  phone: '',
})

const formRef = ref()

const handleSubmit = () => {
  formRef.value
    .validate()
    .then(({ valid, errors }) => {
      if (valid) {
        const token = userStore.getToken()

        const params: any = {
          token,
          shop_id: shopId.value,
          phone: formModel.phone,
        }

        toast.loading('加载中...')
        httpPost('/api/Shop/addAdmin', params)
          .then(() => {
            getList()
            formModel.phone = ''
          })
          .finally(() => {
            toast.close()
          })
      }
    })
    .catch((error) => {
      console.log(error, 'error')
    })
}

const handleDelete = (row) => {
  // console.log(row, 'row')
  const id = row.id
  const token = userStore.getToken()

  toast.loading('加载中...')
  httpPost('/api/Shop/delAdmin', {
    shop_id: shopId.value,
    token,
    admin_id: id,
  })
    .then((res) => {
      getList()
    })
    .finally(() => {
      toast.close()
    })
}

const getList = () => {
  const token = userStore.getToken()

  toast.loading('加载中...')

  httpPost('/api/Shop/getAdminUsers', {
    token,
    shop_id: shopId.value,
    page: 1,
    size: 100,
  })
    .then((res) => {
      dataList.value = ((res.data || {}) as any).list as any[]

      dataList.value.forEach((item) => {
        item.avatarUrl = `${baseUrl}${item.avatar}`
      })

      console.log(res, 'res')
    })
    .finally(() => {
      toast.close()
    })
}

onLoad((options) => {
  shopId.value = options.shopId
  getList()
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
