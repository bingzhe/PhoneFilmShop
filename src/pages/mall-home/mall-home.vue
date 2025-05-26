<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '登录',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="login-page">
    <view class="logo-container">
      <image class="logo-image" src="/static/images/search-btn.jpg" mode="aspectFill"></image>
    </view>

    <view class="login-wrapper">
      <input
        class="login-input"
        placeholder="手机号"
        placeholder-class="placeholder-class"
        v-model="username"
        type="text"
      />

      <input
        class="login-input"
        type="password"
        placeholder="密码"
        placeholder-class="placeholder-class"
        v-model="password"
      />

      <view class="register-wrapper">
        <text @tap="goRegister">去注册</text>
      </view>

      <view class="login-button" @tap="loginUser">登录</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { registerGetOpenid } from '@/utils/wxLogin'
import { httpPost } from '@/utils/http'
import { getOrderToken, setOrderToken } from '@/utils/orderToken'

const toast = useToast()
const username = ref('')
const password = ref('')
const checked = ref(false)
const openid = ref('')

onMounted(async () => {
  // 获取订单令牌
  const token = getOrderToken()
  console.log('token', token)
  if (token) {
    // 登录成功后跳转到订单系统
    uni.reLaunch({
      url: '/pages/order-system/category/category',
    })
  }

  await getRegisterOpenid()
})

// 获取openid
const getRegisterOpenid = async () => {
  try {
    const result = await registerGetOpenid()
    // console.log('result', result)
    openid.value = result as string
  } catch (error) {
    console.error('获取openid失败', error)
  }
}

// 登录
const loginUser = async () => {
  //   if (!checked.value) {
  //     toast.warning('请同意用户协议和隐私协议再登录')
  //     return
  //   }

  if (!username.value) {
    toast.warning('请输入手机号')
    return
  }

  if (!password.value) {
    toast.warning('请输入密码')
    return
  }

  const params = {
    username: username.value,
    password: password.value,
    weapp_openid: openid.value,
  }

  try {
    // await phoneLoginApi(params)
    const result = await httpPost<any>('/api/Login/login', params)
    console.log('result', result)
    if (result.code === 200) {
      setOrderToken(result.data.token)

      toast.success('登录成功')

      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/order-system/category/category',
        })
      }, 1500)
    } else {
      toast.error(result.meg)
    }
  } catch (error) {
    console.error('登录失败', error)
    toast.error('登录失败，请重试')
  }
}

// 去注册
const goRegister = () => {
  uni.navigateTo({
    url: '/pages/order-system/register/register',
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(to top, #fff 0%, #fff 40%, #23b7eb 100%);
}

.logo-container {
  padding-top: 10%;
  text-align: center;
}

.logo-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
}

.login-wrapper {
  margin-top: 20%;
}

.login-input {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 600rpx;
  height: 88rpx;
  padding: 0rpx 40rpx;
  margin: 0 auto 40rpx;
  background: #eaf0f8;
  border-radius: 10rpx;
}

.login-button {
  width: 600rpx;
  height: 88rpx;
  margin: 0 auto 60rpx;
  font-size: 32rpx;
  line-height: 88rpx;
  color: #ffffff;
  text-align: center;
  background: linear-gradient(to right, #68cef1 0%, #23b7eb 100%);
  border-radius: 10rpx;
}

.agree-tip {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 600rpx;
  margin: 0 auto 50rpx;
  font-size: 24rpx;
  color: #999999;
}

.agree-font {
  margin-left: 10rpx;
}

.active-font {
  color: #23b7eb;
}

.placeholder-class {
  font-size: 32rpx;
  color: #96b4dc;
}

.register-wrapper {
  width: 600rpx;
  padding: 10rpx 0;
  margin: 0rpx auto;
  font-size: 32rpx;
  color: #23b7eb;
  text-align: right;
}
</style>
