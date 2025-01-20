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
    <view class="pb-128rpx">
      <view class="flex items-center justify-center pl-32rpx pr-32rpx pt-128rpx pb-24rpx">
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
      class="h-44px pl-15px pr-15px border-t-1rpx border-b-1rpx border-l-0 border-r-0 border-#E5E5E5 border-solid flex items-center"
    >
      <view class="text-14px text-label w-25% mr-15px">手机号</view>
      <view v-if="userInfo.phone" class="text-14px text-#333333">
        {{ userInfo.phone }}
      </view>
      <view v-if="!userInfo.phone">
        <wd-button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" size="small">
          绑定手机号
        </wd-button>
      </view>
    </view>

    <view class="fixed bottom-400rpx left-50rpx right-50rpx">
      <wd-button block size="large" @click="onSave">保存</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { getUserInfo } from '@/service/user'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const uploadUrl = import.meta.env.VITE_UPLOAD_BASEURL
const toast = useToast()

const userStore = useUserStore()

const userInfo = computed(() => {
  return userStore.userInfo
})

const nickname = ref(userInfo.value.nickname)
const avatar = ref(userInfo.value.avatar)

const avatarUrl = computed(() => {
  return `${baseUrl}${avatar.value}`
})

const onChooseAvatar = (e) => {
  const { avatarUrl } = e.detail
  toast.loading('加载中...')

  uni.uploadFile({
    url: uploadUrl,
    filePath: avatarUrl,
    name: 'file',
    formData: {},
    success: (uploadFileRes) => {
      const uploadData = JSON.parse(uploadFileRes.data)
      avatar.value = uploadData.data
    },
    fail: (err) => {
      console.error('uni.uploadFile err->', err)
    },
    complete: () => {
      toast.close()
    },
  })
}

const onSave = () => {
  const token = userStore.getToken()

  const params: any = {
    token,
  }
  if (nickname.value) {
    params.nikename = nickname.value
  }

  if (avatar.value) {
    params.avatar = avatar.value
  }

  httpPost('/api/UsersInfo/saveUserInfo', params).then((res) => {
    toast.success('保存成功')

    getUserInfo()
      .then(() => {
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      })
      .catch((err) => {
        console.error('getUserInfo err->', err)
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      })
  })
}

const getPhoneNumber = (e: any) => {
  const { code } = e
  const token = userStore.getToken()

  if (code) {
    httpPost('/api/WxLogin/savePhone', { code, token }).then((res) => {
      uni.showToast({
        icon: 'none',
        title: '绑定成功',
      })
      getUserInfo()
    })
  }
}
</script>

<style lang="scss" scoped>
.text-label {
  color: rgba(0, 0, 0, 0.85);
}
</style>
