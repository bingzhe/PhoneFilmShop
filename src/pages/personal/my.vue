<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: 'my',
  },
}
</route>

<template>
  <view class="p-64rpx">
    <view>
      <wd-button
        block
        size="large"
        type="success"
        custom-class="mb-64rpx custom-shadow"
        @click="handleLogout"
      >
        Logout
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

const handleLogout = () => {
  userStore.clearUserInfo()

  uni.navigateTo({
    url: '/pages/login/login',
  })
}

const handleFilm = () => {
  uni.navigateTo({
    url: '/pages/video-course/video-course',
  })
}

const handleMemberSystem = () => {
  uni.navigateTo({
    url: '/pages/personal/personal',
  })
}

const handleContact = () => {}
</script>

<style lang="scss" scoped>
:deep(.custom-shadow) {
  box-shadow:
    0 3px 1px -2px rgb(0 0 0 / 20%),
    0 2px 2px 0 rgb(0 0 0 / 14%),
    0 1px 5px 0 rgb(0 0 0 / 12%);
}
//
</style>
