<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '提现绑定',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="min-h-100vh bg-#f5f5f5 px-24rpx py-24rpx">
    <view class="bg-white rounded-12rpx p-32rpx mb-32rpx shadow">
      <wd-form ref="formRef" :model="formData" :rules="rules">
        <wd-cell-group border size="large">
          <wd-input
            v-model="formData.real_name"
            label="姓名"
            prop="real_name"
            placeholder="请输入真实姓名"
            clearable
          />
          <wd-input
            v-model="formData.bank_code"
            label="银行卡号"
            prop="bank_code"
            placeholder="请输入银行卡号"
            clearable
            type="number"
          />
          <wd-input
            v-model="formData.bank_address"
            label="开户行"
            prop="bank_address"
            placeholder="请输入开户行名称"
            clearable
          />
        </wd-cell-group>
        <view class="mt-32rpx">
          <wd-button block size="large" type="primary" :loading="loading" @click="submitForm">
            提交绑定
          </wd-button>
        </view>
      </wd-form>
    </view>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'

const toast = useToast()
const formRef = ref()
const loading = ref(false)

const formData = reactive({
  real_name: '',
  bank_code: '',
  bank_address: '',
})

const rules: any = {
  real_name: [{ required: true, message: '请输入真实姓名' }],
  bank_code: [{ required: true, message: '请输入银行卡号' }],
  bank_address: [{ required: true, message: '请输入开户行名称' }],
}

const submitForm = () => {
  formRef.value.validate().then(({ valid, errors }) => {
    if (!valid) return
    loading.value = true
    toast.loading('提交中...')
    httpPost('/Api/Usersinfo/saveWithdrawInfo', {
      token: getOrderToken(),
      ...formData,
    })
      .then((res: any) => {
        if (res.code === 200) {
          toast.success('绑定成功')
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        } else {
          toast.error(res.meg || '绑定失败')
        }
      })
      .catch((err) => {
        toast.error('绑定失败')
        console.error(err)
      })
      .finally(() => {
        loading.value = false
        // toast.close()
      })
  })
}

const getUserInfo = async () => {
  const res = await httpPost('/api/UsersInfo/index', {
    token: getOrderToken(),
  })

  const data = res.data as {
    real_name: string
    bank_code: string
    bank_address: string
  }

  formData.real_name = data.real_name
  formData.bank_code = data.bank_code
  formData.bank_address = data.bank_address
}

onMounted(() => {
  getUserInfo()
})
</script>
