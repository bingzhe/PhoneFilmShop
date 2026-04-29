<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '提现申请',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="withdraw-apply-container">
    <wd-form ref="formRef" :model="formModel" label-width="100px">
      <view class="form-card">
        <wd-cell-group border size="large">
          <wd-input
            v-model="formModel.withdraw_price"
            label="提现金额"
            label-width="100px"
            prop="withdraw_price"
            clearable
            type="digit"
            placeholder="请输入提现金额"
            :rules="[
              { required: true, message: '请填写提现金额' },
              { validator: validateWithdrawPrice, message: '提现金额必须大于0' },
            ]"
          />
          <wd-input
            v-model="formModel.real_name"
            label="真实姓名"
            label-width="100px"
            prop="real_name"
            clearable
            placeholder="请输入真实姓名"
            :rules="[{ required: true, message: '请填写真实姓名' }]"
          />
          <wd-input
            v-model="formModel.bank_code"
            label="银行卡号"
            label-width="100px"
            prop="bank_code"
            clearable
            type="number"
            placeholder="请输入银行卡号"
            :rules="[{ required: true, message: '请填写银行卡号' }]"
          />
          <wd-input
            v-model="formModel.bank_address"
            label="开户地址"
            label-width="100px"
            prop="bank_address"
            clearable
            placeholder="请输入开户地址"
            :rules="[{ required: true, message: '请填写开户地址' }]"
          />
        </wd-cell-group>
      </view>

      <view class="submit-button-container">
        <wd-button block size="large" type="primary" :loading="loading" @click="handleSubmit">
          提交申请
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'

const toast = useToast()
const formRef = ref()
const loading = ref(false)

const formModel = reactive({
  withdraw_price: '',
  real_name: '',
  bank_code: '',
  bank_address: '',
})

const normalizeForm = () => {
  formModel.withdraw_price = formModel.withdraw_price.trim()
  formModel.real_name = formModel.real_name.trim()
  formModel.bank_code = formModel.bank_code.replace(/\s/g, '')
  formModel.bank_address = formModel.bank_address.trim()
}

const validateWithdrawPrice = (value: string) => {
  const price = Number(value)

  return Number.isFinite(price) && price > 0
}

const handleSubmit = async () => {
  normalizeForm()

  const { valid } = await formRef.value.validate()
  if (!valid) return

  try {
    loading.value = true
    await httpPost('/api/UsersWithdraw/index', {
      token_order: getOrderToken(),
      withdraw_price: formModel.withdraw_price,
      real_name: formModel.real_name,
      bank_code: formModel.bank_code,
      bank_address: formModel.bank_address,
    })

    toast.success('提交成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.withdraw-apply-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f5f5f5;
}

.form-card {
  margin-bottom: 40rpx;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.submit-button-container {
  margin-top: 60rpx;
}

::v-deep .wd-input__placeholder {
  color: var(--wot-input-placeholder-color, #bfbfbf);
}
</style>
