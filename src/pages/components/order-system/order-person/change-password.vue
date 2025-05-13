<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '修改密码',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="change-password-container">
    <wd-form ref="form" :model="formData" :rules="rules">
      <view class="form-card">
        <wd-cell-group border size="large">
          <wd-input
            v-model="formData.oldPassword"
            label="旧密码"
            prop="oldPassword"
            placeholder="请输入旧密码"
            show-password
            clearable
          />
          <wd-input
            v-model="formData.newPassword"
            label="新密码"
            prop="newPassword"
            placeholder="请输入新密码"
            show-password
            clearable
          />
          <wd-input
            v-model="formData.confirmPassword"
            label="确认密码"
            prop="confirmPassword"
            placeholder="请再次输入新密码"
            show-password
            clearable
          />
        </wd-cell-group>
      </view>

      <view class="submit-button-container">
        <wd-button block size="large" type="primary" @click="submitForm" :loading="loading">
          确认修改
        </wd-button>
      </view>
    </wd-form>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const form = ref()
const loading = ref(false)

// 表单数据
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 定义表单校验规则
const rules = {
  oldPassword: [{ required: true, message: '请输入旧密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    {
      validator: (value) => {
        if (value.length < 6) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('密码长度不能少于6位')
        }
        return Promise.resolve()
      },
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码' },
    {
      validator: (value) => {
        if (value !== formData.newPassword) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
    },
  ],
}

// 提交表单
const submitForm = async () => {
  try {
    // 进行表单验证
    const { valid } = await form.value.validate()

    if (!valid) return

    loading.value = true

    const res = await httpPost('/api/Login/RevisePwdByPwd', {
      token_order: getOrderToken(),
      old_password: formData.oldPassword,
      new_password: formData.newPassword,
      again_password: formData.confirmPassword,
    })

    if (res.code === 200) {
      toast.success({
        msg: '密码修改成功',
      })

      // 修改成功后返回上一页
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      toast.error({
        msg: res.meg || '修改失败，请重试',
      })
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.change-password-container {
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
</style>
