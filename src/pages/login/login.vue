<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: 'Login',
  },
}
</route>

<template>
  <view class="login-page">
    <view style="padding-top: 10%; text-align: center">
      <wd-img width="100" height="100" round src="/images/use/search-btn.jpg" />
    </view>

    <view class="login-wrapper">
      <input
        class="loginInput"
        placeholder="username"
        placeholder-class="placeholderClass"
        v-model="username"
      />

      <input
        class="loginInput"
        type="password"
        placeholder="password"
        placeholder-class="placeholderClass"
        v-model="password"
      />

      <view class="login_button" @click="loginUser">Login</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const username = ref('')
const password = ref('')

const toast = useToast()

const loginUser = async () => {
  if (!username.value) {
    toast.error('Please enter username')
    return
  }

  if (!password.value) {
    toast.error('Please enter password')
    return
  }

  const res = await httpPost<any>('/api/Login/Login', {
    username: username.value,
    password: password.value,
  })

  const token = res.data.token

  if (token) {
    userStore.setToken(token)
    toast.success('Login successful')

    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 1500)
  }
}

//
</script>

<style>
/* page {
  background: linear-gradient(to top, #fff 0%, #fff 40%, #23b7eb 100%);
} */
</style>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background: linear-gradient(to top, #fff 0%, #fff 40%, #23b7eb 100%);
}

.login-wrapper {
  margin-top: 20%;
}

.loginInput {
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

.login_button {
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
.agree_img {
  width: 36rpx;
  height: 36rpx;
  margin-right: 18rpx;
}

.agreen_font {
  width: 600rpx;
}
.agreen_tip {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 600rpx;
  margin: 0 auto 50rpx;
  font-size: 24rpx;
  color: #999999;
}
.placeholderClass {
  font-size: 32rpx;
  color: #96b4dc;
}
.img_box {
  width: 60rpx;
  height: 100%;
}
.codeInput {
  width: 70%;
  height: 100%;
}

.border-error {
  border: 1px solid #ff3333;
}

.register-wrapper {
  width: 600rpx;
  padding: 10rpx 0;
  margin: 0rpx auto;
  font-size: 16px;
  color: #23b7eb;
  text-align: right;
}
</style>
