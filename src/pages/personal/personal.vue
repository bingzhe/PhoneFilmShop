<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '我',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="">
    <view class="flex items-center p-32rpx bg-white mb-24rpx">
      <view class="mr-32rpx">
        <wd-img width="48" height="48" round :src="avatarUrl" @click="goPersonalEdit">
          <template #error>
            <view class="w-100% h-100% flex justify-center items-center">
              <wd-img width="48" height="48" round src="/static/images/default_avatar.png"></wd-img>
            </view>
          </template>
          <template #loading>
            <view class="w-100% h-100% flex justify-center items-center">
              <wd-loading />
            </view>
          </template>
        </wd-img>
      </view>
      <view class="flex-1">
        <view class="text-32rpx" @click="goPersonalEdit">{{ userInfo.nickname || '佚名' }}</view>
        <view class="flex justify-between items-center" @click="goPersonalEdit">
          <view class="text-32rpx">{{ hidePhone }}</view>
        </view>
      </view>
    </view>

    <view class="bg-white p-32rpx">
      <view
        class="flex items-center justify-center font-bold h-88rpx text-36rpx border-rd-[50rpx] bg-#F1F1F1 text-#666666"
      >
        商家区
      </view>
      <!--  -->
      <view class="p-64rpx flex flex-col items-center" @click="goShop" v-if="!!userInfo.shop_id">
        <view>
          <view class="i-ic-twotone-storefront text-#00A3FF text-48rpx"></view>
        </view>
        <view class="text-32rpx text-#666666">我的店铺</view>
      </view>
      <!--  -->
      <view class="p-32rpx flex flex-col items-center" @click="goShopEdit" v-if="!userInfo.shop_id">
        <view>
          <view class="i-ic:baseline-drive-file-rename-outline text-#00A3FF text-48rpx"></view>
        </view>
        <view class="text-32rpx text-#666666">店铺登记</view>
      </view>

      <view
        class="flex items-center justify-center font-bold h-88rpx text-36rpx border-rd-[50rpx] bg-#F1F1F1 text-#666666"
      >
        用户区
      </view>

      <view class="p-32rpx flex justify-between">
        <view class="p-32rpx flex flex-col items-center" @click="goPersonalEdit">
          <view>
            <view class="i-mingcute:profile-line text-#00A3FF text-48rpx"></view>
          </view>
          <view class="text-32rpx text-#666666">个人信息</view>
        </view>
        <view class="p-32rpx flex flex-col items-center" @click="goShopList">
          <view>
            <view class="i-ic-twotone-storefront text-#00A3FF text-48rpx"></view>
          </view>
          <view class="text-32rpx text-#666666">购买过的店铺</view>
        </view>
      </view>
    </view>

    <view class="p-32rpx">
      <wd-button :block="true" @click="logout" size="large">返回首页</wd-button>
    </view>

    <complete-userinfo-tip type="personal" />
  </view>
</template>

<script lang="ts" setup>
import { getUserInfoAPI } from '@/service/user'
import { httpPost } from '@/utils/http'
import { useUserStore } from '@/store/user'
import { useMessage } from 'wot-design-uni'
import CompleteUserinfoTip from '@/components/complete-userinfo-tip.vue'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const message = useMessage()

// avatar: ""
// invitation_code: null
// nikename: ""
// shop_id: 0
// status: 0
// username: ""
// users_id: 1
// weapp_openid: "oT0Hy63pryxuZiq2ISm-8acWq5N4"

const userStore = useUserStore()

const userInfo = computed(() => {
  return userStore.userInfo
})

const avatarUrl = computed(() => {
  return `${baseUrl}${userStore.userInfo.avatar}`
})

const hidePhone = computed(() => {
  if (userInfo.value.phone) {
    return String(userInfo.value.phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return '手机号未设置'
})

onShow(() => {})

const logout = () => {
  uni.reLaunch({
    url: '/pages/index/index',
  })
}

const goShop = () => {
  uni.reLaunch({
    url: '/pages/shop/shop?shopId=' + userInfo.value.shop_id,
  })
}

const goShopEdit = () => {
  uni.navigateTo({
    url: '/pages/shop/shop-edit',
  })
}

const goPersonalEdit = () => {
  uni.navigateTo({
    url: '/pages/personal/personal-edit',
  })
}

const goShopList = () => {
  uni.navigateTo({
    url: '/pages/member/member-shop-list',
  })
}
</script>

<style lang="scss" scoped>
//
</style>

<style>
page {
  background: #f9f9f9;
}
</style>
