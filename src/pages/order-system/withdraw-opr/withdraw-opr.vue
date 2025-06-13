<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '提现',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="min-h-100vh bg-#f5f5f5 px-24rpx py-24rpx">
    <!-- 可提现余额卡片 -->
    <view class="bg-white rounded-12rpx p-32rpx mb-32rpx flex flex-col items-center shadow">
      <view class="text-16px color-#888 mb-8rpx">可提现余额</view>
      <view class="text-32px font-bold color-#23B7EB">{{ balance }}</view>
    </view>
    <view class="bg-white rounded-12rpx p-32rpx mb-32rpx shadow">
      <wd-form ref="formRef" :model="formData" :rules="rules">
        <wd-cell-group border size="large">
          <wd-input
            v-model="formData.real_name"
            label="姓名"
            prop="real_name"
            placeholder="请先绑定真实姓名"
            readonly
            disabled
          />
          <wd-input
            v-model="formData.bank_code"
            label="银行卡号"
            prop="bank_code"
            placeholder="请先绑定银行卡号"
            readonly
            disabled
          />
          <wd-input
            v-model="formData.bank_address"
            label="开户行"
            prop="bank_address"
            placeholder="请先绑定开户行"
            readonly
            disabled
          />
          <wd-input
            v-model="formData.withdraw_price"
            label="提现金额"
            prop="withdraw_price"
            placeholder="请输入提现金额"
            clearable
            type="number"
            class="mt-16rpx"
          />
        </wd-cell-group>
        <view class="mt-32rpx">
          <wd-button block size="large" type="primary" :loading="loading" @click="submitForm">
            提交提现
          </wd-button>
        </view>
      </wd-form>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'

const toast = useToast()
const formRef = ref()
const loading = ref(false)

const balance = ref('0.00')
const formData = reactive({
  real_name: '',
  bank_code: '',
  bank_address: '',
  withdraw_price: '',
})

const rules: any = {
  withdraw_price: [
    { required: true, message: '请输入提现金额' },
    {
      validator: (value: string) => {
        if (!/^\d+(\.\d{1,2})?$/.test(value) || Number(value) <= 0) {
          return Promise.reject(new Error('请输入正确的提现金额'))
        }
        return Promise.resolve()
      },
    },
  ],
}

const getUserInfo = async () => {
  toast.loading('加载中...')
  const res = await httpPost('/api/UsersInfo/index', {
    token: getOrderToken(),
  })
  toast.close()
  if (res.code === 200 && res.data) {
    const data = res.data as {
      real_name: string
      bank_code: string
      bank_address: string
      balance?: string | number
    }
    formData.real_name = data.real_name || ''
    formData.bank_code = data.bank_code || ''
    formData.bank_address = data.bank_address || ''
    balance.value = data.balance !== undefined ? String(data.balance) : '0.00'
  }
}

const submitForm = () => {
  formRef.value.validate().then(({ valid, errors }) => {
    if (!valid) return
    if (!formData.real_name || !formData.bank_code || !formData.bank_address) {
      toast.error('请先绑定提现信息')
      return
    }
    loading.value = true
    toast.loading('提交中...')
    httpPost('/Api/UsersWithdraw/index', {
      token: getOrderToken(),
      real_name: formData.real_name,
      bank_code: formData.bank_code,
      bank_address: formData.bank_address,
      withdraw_price: formData.withdraw_price,
    })
      .then((res: any) => {
        if (res.code === 200) {
          toast.success('提现申请成功')
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        } else {
          toast.error(res.meg || '提现失败')
        }
      })
      .catch((err) => {
        toast.error('提现失败')
        console.error(err)
      })
      .finally(() => {
        loading.value = false
        toast.close()
      })
  })
}

onMounted(() => {
  getUserInfo()
})
</script>
