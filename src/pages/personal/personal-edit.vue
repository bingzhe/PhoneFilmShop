<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '个人信息',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="pb-64rpx">
      <view class="flex items-center justify-center pl-32rpx pr-32rpx pt-64rpx pb-24rpx">
        <button class="bg-#fff h-128rpx" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
          <wd-img width="64" height="64" round :src="avatarUrl">
            <template #error>
              <view class="w-100% h-100% flex justify-center items-center">
                <view class="i-carbon:user-avatar-filled text-128rpx text-#D1DBE2"></view>
              </view>
            </template>
          </wd-img>
        </button>
      </view>

      <view class="text-28rpx text-#999999 text-center">点击更换头像</view>
    </view>

    <view class="border-t-1rpx border-b-1rpx border-l-0 border-r-0 border-#E5E5E5 border-solid">
      <wd-input
        type="nickname"
        label="昵称"
        v-model="nickname"
        placeholder="请输入昵称"
        label-width="25%"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const nickname = ref('')
const avatar = ref('')

const avatarUrl = computed(() => {
  return `${baseUrl}${avatar.value}`
})

const onChooseAvatar = (e) => {
  console.log(e)
}
</script>

<style lang="scss" scoped>
//
</style>
