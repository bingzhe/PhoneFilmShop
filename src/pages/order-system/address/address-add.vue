<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '新增地址',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="container">
    <wd-form ref="formRef" :model="formModel" label-width="100px">
      <wd-cell-group border>
        <wd-input
          label="收货人"
          label-width="100px"
          prop="name"
          clearable
          v-model="formModel.name"
          placeholder="请输入收货人姓名"
          :rules="[{ required: true, message: '请填写收货人姓名' }]"
        />

        <wd-input
          label="手机号码"
          label-width="100px"
          prop="telephone"
          clearable
          v-model="formModel.telephone"
          placeholder="请输入手机号码"
          :rules="[{ required: true, message: '请填写手机号码' }]"
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
          label="详细地址"
          label-width="100px"
          prop="address"
          clearable
          v-model="formModel.address"
          placeholder="请输入详细地址信息"
          :rules="[{ required: true, message: '请填写详细地址' }]"
        />

        <wd-cell title="设为默认地址">
          <wd-switch v-model="formModel.is_default" size="20px"></wd-switch>
        </wd-cell>
      </wd-cell-group>

      <view class="submit-btn">
        <wd-button type="primary" size="large" block @click="handleSubmit">保存</wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { useColPickerData } from '@/hooks/useColPickerData'
import { getCurrentInstance } from 'vue'

const toast = useToast()

// 获取用户信息
const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

// 省市区选择器数据
const { colPickerData, findChildrenByCode } = useColPickerData()

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

// 表单引用
const formRef = ref()

// 地址ID，编辑时使用
const addressId = ref('')

// 表单数据
const formModel = ref({
  address_id: '',
  name: '',
  telephone: '',
  area_value: [],
  province_name: '',
  province_id: '',
  city_name: '',
  city_id: '',
  area_name: '',
  area_id: '',
  address: '',
  is_default: false,
})

// 事件通道
const eventChannel = ref(null)

// 省市区选择确认
const handleAreaConfirm = ({ value, selectedItems }) => {
  if (selectedItems && selectedItems.length >= 3) {
    formModel.value.province_name = selectedItems[0].label
    formModel.value.province_id = selectedItems[0].value
    formModel.value.city_name = selectedItems[1].label
    formModel.value.city_id = selectedItems[1].value
    formModel.value.area_name = selectedItems[2].label
    formModel.value.area_id = selectedItems[2].value
  }
}

// 省市区验证器
const validatorArea = (val: any) => {
  return val && val.length >= 3
}

// 获取地址详情
const getAddressDetail = () => {
  toast.loading('加载中...')
  httpPost('/Api/Usersinfo/getAddress', {
    token: userInfo.value.token,
  })
    .then((res: any) => {
      if (res.data && res.data.length > 0) {
        // eslint-disable-next-line eqeqeq
        const addressData = res.data.find((item: any) => item.address_id == addressId.value)

        formModel.value.name = addressData.name
        formModel.value.telephone = addressData.telephone
        formModel.value.address = addressData.address
        formModel.value.is_default = addressData.is_default === 1

        // 设置省市区数据
        formModel.value.province_name = addressData.province_name
        formModel.value.province_id = addressData.province_id
        formModel.value.city_name = addressData.city_name
        formModel.value.city_id = addressData.city_id
        formModel.value.area_name = addressData.area_name
        formModel.value.area_id = addressData.area_id

        // 尝试设置省市区选择器的值
        // 注意：这里需要根据实际情况调整，可能需要通过省市区ID来查找对应的值
        if (addressData.province_id && addressData.city_id && addressData.area_id) {
          formModel.value.area_value = [
            addressData.province_id,
            addressData.city_id,
            addressData.area_id,
          ]
        }
      }
    })
    .catch((err) => {
      console.error('获取地址详情失败', err)
      toast.error('获取地址详情失败')
    })
    .finally(() => {
      toast.close()
    })
}

// 提交表单
const handleSubmit = () => {
  formRef.value
    .validate()
    .then(({ valid, errors }: any) => {
      if (valid) {
        saveAddress()
      }
    })
    .catch((error: any) => {
      console.log(error, 'error')
    })
}

// 保存地址
const saveAddress = () => {
  toast.loading('保存中...')

  const params: any = {
    token: userInfo.value.token,
    // address_id: addressId.value || '',
    name: formModel.value.name,
    telephone: formModel.value.telephone,
    province_name: formModel.value.province_name,
    province_id: formModel.value.province_id,
    city_name: formModel.value.city_name,
    city_id: formModel.value.city_id,
    area_name: formModel.value.area_name,
    area_id: formModel.value.area_id,
    address: formModel.value.address,
    is_default: formModel.value.is_default ? 1 : 0,
  }

  if (addressId.value) {
    params.address_id = addressId.value
  }

  console.log(params, 'params')

  httpPost('/Api/Usersinfo/saveAddress', params)
    .then((_res) => {
      toast.success('保存成功')

      // 触发地址添加成功事件
      setTimeout(() => {
        if (eventChannel.value) {
          eventChannel.value.emit('addressAdded')
        }
        uni.navigateBack()
      }, 1500)
    })
    .catch((err) => {
      toast.error('保存失败' + err)
    })
    .finally(() => {
      toast.close()
    })
}

// 页面加载
onLoad((options) => {
  // 获取事件通道
  try {
    const instance = getCurrentInstance().proxy as any
    const channel = instance.getOpenerEventChannel()
    console.log(channel, 'channel')

    if (channel) {
      eventChannel.value = channel
    }
  } catch (e) {
    console.error('获取事件通道失败', e)
  }

  // 如果有地址ID，说明是编辑模式
  if (options.address_id) {
    addressId.value = options.address_id
    uni.setNavigationBarTitle({
      title: '编辑地址',
    })
    getAddressDetail()
  }
})
</script>

<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 40rpx;
  background-color: #f7f8fa;
}

.submit-btn {
  margin: 40rpx 30rpx;
}

::v-deep .wd-input__placeholder {
  color: var(--wot-input-placeholder-color, #bfbfbf);
}
</style>

<style lang="scss">
page {
  background: #f7f8fa;
}
</style>
