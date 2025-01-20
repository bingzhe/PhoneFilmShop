<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '增值服务',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
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
        @click="handleMemberSystem"
      >
        会员系统
      </wd-button>
      <wd-button
        block
        size="large"
        type="warning"
        custom-class="mb-64rpx custom-shadow"
        @click="handleFilm"
      >
        贴膜教程
      </wd-button>
      <wd-button
        block
        size="large"
        type="primary"
        custom-class="mb-64rpx custom-shadow"
        @click="handleFeedback"
      >
        意见反馈
      </wd-button>

      <wd-button
        block
        open-type="contact"
        size="large"
        type="success"
        custom-class="mb-64rpx custom-shadow"
        @click="handleContact"
      >
        联系客服
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
const handleFeedback = () => {
  uni.navigateTo({
    url: '/pages/feedback/feedback',
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
