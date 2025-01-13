<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '店铺登记',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
  'mp-alipay': {
    usingComponents: {},
  },
}
</route>

<template>
  <view class="">
    <view class="pb-32rpx">
      <view class="flex items-center justify-center pl-32rpx pr-32rpx pt-32rpx pb-24rpx">
        <view
          class="h-140rpx w-140rpx bg-#fff rounded-70rpx flex justify-center items-center"
          @click="uploadShopLogo"
        >
          <wd-img width="64" height="64" round :src="shopLogoUrl">
            <template #error>
              <view class="w-100% h-100% flex justify-center items-center">
                <view class="i-ic:twotone-storefront text-64rpx text-#00A3FF"></view>
              </view>
            </template>
          </wd-img>
        </view>
      </view>

      <view class="text-28rpx text-#999999 text-center">点击更换店铺Logo</view>
    </view>

    <wd-form ref="formRef" :model="formModel">
      <wd-cell-group border>
        <wd-input
          label="店铺名称"
          label-width="100px"
          prop="shop_name"
          clearable
          v-model="formModel.shop_name"
          placeholder="请输入店铺名称"
          :rules="[{ required: true, message: '请输入店铺名称' }]"
        />

        <wd-input
          label="联系电话"
          label-width="100px"
          prop="phone"
          clearable
          v-model="formModel.phone"
          placeholder="请输入联系电话"
          :rules="[{ required: true, message: '请填写联系电话' }]"
        />

        <wd-input
          label="联系人"
          label-width="100px"
          prop="name"
          clearable
          v-model="formModel.name"
          placeholder="请输入联系人"
          :rules="[{ required: true, message: '请填写联系人' }]"
        />

        <wd-col-picker
          label="省市区"
          label-width="100px"
          prop="area_value"
          v-model="formModel.area_value"
          auto-complete
          :columns="area"
          :column-change="columnChange"
          @confirm="handleAreaConfirm"
          placeholder="请选择省市区"
          :rules="[{ required: true, message: '请选择省市区', validator: validatorArea }]"
        ></wd-col-picker>

        <wd-input
          label="地址"
          label-width="100px"
          prop="address"
          clearable
          v-model="formModel.address"
          placeholder="请输入地址"
          :rules="[{ required: true, message: '请填写地址' }]"
        />

        <wd-input
          label="经度"
          label-width="100px"
          prop="longitude"
          clearable
          v-model="formModel.longitude"
          placeholder="请选择位置"
          :rules="[{ required: true, message: '请选择位置' }]"
        >
          <template #suffix>
            <wd-button size="small" custom-class="button" @click="chooseLocation">
              地图定位
            </wd-button>
          </template>
        </wd-input>

        <wd-input
          label="纬度"
          label-width="100px"
          prop="latitude"
          clearable
          v-model="formModel.latitude"
          placeholder="请选择位置"
          :rules="[{ required: true, message: '请选择位置' }]"
        />

        <wd-input
          v-if="!isEdit"
          label="邀请码"
          label-width="100px"
          prop="invitation_code"
          clearable
          v-model="formModel.invitation_code"
          placeholder="请输入邀请码"
          :rules="[{ required: true, message: '请输入邀请码' }]"
        />
      </wd-cell-group>
      <view class="p-24px">
        <wd-button type="primary" size="large" @click="handleSubmit" block>提交</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { useColPickerData } from '@/hooks/useColPickerData'
import { httpPost } from '@/utils/http'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const { loading: shopLoading, data: shopLogo, run: uploadShopLogo } = useUpload<string>({})

const { colPickerData, findChildrenByCode } = useColPickerData()

const formRef = ref()

const shopId = ref('')
const isEdit = computed(() => {
  return !!shopId.value
})

const formModel = ref({
  invitation_code: '',
  shop_name: '',
  shop_logo: '',
  phone: '',
  name: '',
  area_value: [],
  province_name: '',
  province_id: '',
  city_name: '',
  city_id: '',
  area_name: '',
  area_id: '',
  address: '',
  latitude: null,
  longitude: null,
})

const shopLogoUrl = computed(() => {
  return `${baseUrl}${formModel.value.shop_logo}`
})

watch(shopLogo, (newVal) => {
  if (newVal) {
    console.log(newVal, 'newVal')
    const uploadData = JSON.parse(newVal)
    formModel.value.shop_logo = uploadData.data
  }
})

watch(shopLoading, (newVal) => {
  if (newVal) {
    toast.loading('加载中...')
  }
})

const area = ref<any[]>([])

const columnChange = async ({ selectedItem, resolve, finish }) => {
  // 模拟异步请求
  await sleep(0.1)
  const areaData = findChildrenByCode(colPickerData, selectedItem.value)
  if (areaData && areaData.length) {
    resolve(
      areaData.map((item) => {
        return {
          value: item.value,
          label: item.text,
        }
      }),
    )
  } else {
    finish()
  }
}

function sleep(second: number = 1) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 1000 * second)
  })
}

function handleAreaConfirm({ value, selectedItems }) {
  formModel.value.province_name = selectedItems[0].label
  formModel.value.province_id = selectedItems[0].value
  formModel.value.city_name = selectedItems[1].label
  formModel.value.city_id = selectedItems[1].value
  formModel.value.area_name = selectedItems[2].label
  formModel.value.area_id = selectedItems[2].value
}

function validatorArea(value: any) {
  if (!value || value.length !== 3) {
    return false
  } else {
    return true
  }
}

function handleSubmit() {
  formRef.value
    .validate()
    .then(({ valid, errors }) => {
      if (valid) {
        const token = userStore.getToken()

        const params: any = {
          token,
          ...formModel.value,
        }

        if (shopId.value) {
          params.shop_id = shopId.value

          delete params.invitation_code
        }

        // 排除area_value
        delete params.area_value

        console.log(params, 'params')

        httpPost('/api/Shop/saveShopInfo', params).then((res) => {
          toast.success('保存成功')
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        })
      }
    })
    .catch((error) => {
      console.log(error, 'error')
    })
}

function getShopInfo() {
  const token = userStore.getToken()

  httpPost('/api/Shop/getShopInfo', {
    token,
    shop_id: shopId.value,
  }).then((res) => {
    const resultData = res.data as any

    formModel.value.shop_name = resultData.shop_name
    formModel.value.phone = resultData.phone
    formModel.value.name = resultData.name
    formModel.value.area_value = [resultData.province_id, resultData.city_id, resultData.area_id]
    formModel.value.province_name = resultData.province_name
    formModel.value.city_name = resultData.city_name
    formModel.value.area_name = resultData.area_name
    formModel.value.address = resultData.address
    formModel.value.latitude = resultData.latitude
    formModel.value.longitude = resultData.longitude
    formModel.value.invitation_code = resultData.invitation_code
    formModel.value.shop_logo = resultData.shop_logo
  })
}

function chooseLocation() {
  // #ifdef MP-WEIXIN
  wx.chooseLocation({
    success: function (res) {
      formModel.value.latitude = res.latitude
      formModel.value.longitude = res.longitude
    },
    fail: function (err) {
      console.log(err)
    },
  })
  // #endif
}

onLoad((options) => {
  if (options.shopId) {
    shopId.value = options.shopId
  }

  if (shopId.value) {
    uni.setNavigationBarTitle({
      title: '店铺编辑',
    })

    // 获取店铺信息
    getShopInfo()
  } else {
    formModel.value.phone = userInfo.value.phone
  }
})
</script>

<style lang="scss" scoped>
::v-deep .wd-input__placeholder {
  color: var(--wot-input-placeholder-color, #bfbfbf);
}
</style>

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
