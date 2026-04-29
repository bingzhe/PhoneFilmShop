<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '下单系统',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="login-container">
    <view class="logo-container">
      <view class="logo">
        <view class="title">下单系统</view>
      </view>
    </view>

    <view class="form-container">
      <wd-form ref="formRef" :model="formData" custom-class="form">
        <view class="input-wrapper">
          <wd-input
            placeholder="请输入用户名"
            v-model="formData.username"
            prop="username"
            clearable
            no-border
            custom-class="login-input"
            :rules="[{ required: true, message: '请输入用户名' }]"
          >
            <template #prefix>
              <view class="i-mingcute:profile-line text-#00A3FF text-48rpx"></view>
            </template>
          </wd-input>
        </view>
        <view class="input-wrapper">
          <wd-input
            placeholder="请输入密码"
            v-model="formData.password"
            prop="password"
            clearable
            show-password
            no-border
            custom-class="login-input"
            :rules="[{ required: true, message: '请输入密码' }]"
          >
            <template #prefix>
              <view class="i-ic:baseline-lock text-#00A3FF text-48rpx"></view>
            </template>
          </wd-input>
        </view>

        <view class="btn-container">
          <wd-button
            block
            size="large"
            type="primary"
            custom-class="login-btn"
            @click="handleLogin"
          >
            登录
          </wd-button>
        </view>
      </wd-form>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { getOrderToken, setOrderToken } from '@/utils/orderToken'
import { saveUsername, getLastUsername } from '@/utils/userStorage'
import { getWeappOpenid } from '@/utils/wxLogin'

// 表单引用
const formRef = ref()

// 提示组件
const toast = useToast()

// 表单数据
const formData = reactive({
  username: '',
  password: '',
})

// 登录处理
const getOrderLoginOpenid = async () => {
  let weappOpenid = ''

  // #ifdef MP-WEIXIN
  weappOpenid = await getWeappOpenid()
  // #endif

  return weappOpenid
}

const handleLogin = () => {
  formRef.value.validate().then(async ({ valid, errors }) => {
    if (valid) {
      toast.loading('登录中...')

      // eslint-disable-next-line camelcase
      let weapp_openid = ''
      try {
        // eslint-disable-next-line camelcase
        weapp_openid = await getOrderLoginOpenid()
      } catch (error) {
        toast.close()
        console.error('get weapp_openid failed:', error)
        return
      }

      httpPost('/Api/Login/Login', {
        username: formData.username,
        password: formData.password,
        // eslint-disable-next-line camelcase
        weapp_openid,
      })
        .then((res: any) => {
          toast.close()

          if (res.code === 200 && res.data) {
            // 保存登录token，设置7天有效期
            setOrderToken(res.data.token_order, 1)

            // 保存用户名到本地存储
            saveUsername(formData.username)

            toast.success('登录成功')

            // 登录成功后跳转到订单系统
            uni.reLaunch({
              url: '/pages/order-system/category/category',
            })
          } else {
            toast.error(res.msg || '登录失败')
          }
        })
        .catch((error) => {
          toast.close()
          console.error('登录失败:', error)
        })
    } else {
      console.log('表单校验失败:', errors)
    }
  })
}

onMounted(() => {
  // 获取订单令牌
  const token = getOrderToken()
  if (token) {
    // 登录成功后跳转到订单系统
    uni.reLaunch({
      url: '/pages/order-system/category/category',
    })
  } else {
    // 如果没有token，尝试从本地存储获取上次登录的用户名
    const username = getLastUsername()
    if (username) {
      formData.username = username
    }
  }
})

onShow(() => {
  const username = getLastUsername()
  if (username) {
    formData.username = username
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 40rpx;
  background-color: #f5f7fa;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0 60rpx;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 30rpx;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 10rpx 20rpx rgba(0, 163, 255, 0.1);
}

.title {
  margin-bottom: 16rpx;
  font-size: 52rpx;
  font-weight: bold;
  color: #00a3ff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.form-container {
  width: 100%;
  padding: 20rpx 0;
}

.form {
  padding: 40rpx 30rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
}

.input-wrapper {
  padding: 20rpx;
  margin-bottom: 30rpx;
  overflow: hidden;
  background-color: #fff;
  // border: 2rpx solid #e6edf5;
  border-radius: 16rpx;
}

.login-input {
  height: 100rpx;
  padding: 0 20rpx;
  margin: 0;
}

.btn-container {
  padding: 40rpx 0 20rpx;
}

.login-btn {
  height: 90rpx;
  font-size: 32rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #00a3ff, #0077cc);
  border-radius: 50rpx;
  box-shadow: 0 10rpx 20rpx rgba(0, 163, 255, 0.2);
}
</style>
