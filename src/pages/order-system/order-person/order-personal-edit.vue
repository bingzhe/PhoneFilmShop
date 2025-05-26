<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '个人信息',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="pb-128rpx">
      <view class="flex items-center justify-center pl-32rpx pr-32rpx pt-128rpx pb-24rpx">
        <view class="w-[128rpx] h-[128rpx] flex justify-center items-center">
          <view class="i-carbon:user-avatar-filled text-128rpx text-#D1DBE2"></view>
        </view>
      </view>
    </view>

    <view
      class="border-t-1rpx border-b-1rpx border-l-0 border-r-0 border-#E5E5E5 border-solid mb-15px"
    >
      <wd-input
        type="nickname"
        label="昵称"
        v-model="nickname"
        placeholder="请输入昵称"
        label-width="25%"
      />
    </view>

    <view
      class="border-t-1rpx border-b-1rpx border-l-0 border-r-0 border-#E5E5E5 border-solid mb-15px"
    >
      <wd-input label="用户名" v-model="username" placeholder="请输入用户名" label-width="25%" />
    </view>

    <view class="fixed bottom-400rpx left-50rpx right-50rpx">
      <wd-button block size="large" @click="onSave">保存</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
// import { getUserInfo } from '@/service/user'
import { getOrderToken } from '@/utils/orderToken'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const uploadUrl = import.meta.env.VITE_UPLOAD_BASEURL
const toast = useToast()

const nickname = ref('')
const username = ref('')

const getUserInfo = async () => {
  const res: any = await httpPost('/api/UsersInfo/index', {
    token: getOrderToken(),
  })

  if (res.code === 200 && res.data) {
    nickname.value = res.data.nikename
    username.value = res.data.username
  }
}

const onSave = () => {
  const token = getOrderToken()

  const params: any = {
    token,
  }
  if (nickname.value) {
    params.nikename = nickname.value
  }

  if (username.value) {
    params.username = username.value
  }

  httpPost('/api/UsersInfo/saveUserInfo', params).then((res) => {
    toast.success('保存成功')
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  })
}

onMounted(() => {
  getUserInfo()
})
</script>

<style lang="scss" scoped>
.text-label {
  color: rgba(0, 0, 0, 0.85);
}
</style>
