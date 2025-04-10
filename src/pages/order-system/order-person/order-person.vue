<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '个人中心',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="person-container">
    <!-- 个人信息展示区 -->
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

    <!-- 功能菜单 -->
    <view class="menu-section">
      <wd-cell-group border size="large">
        <wd-cell title="订单管理" is-link @click="goToOrderList">
          <template #icon>
            <view class="i-ri:file-list-3-line cell-icon"></view>
          </template>
        </wd-cell>
        <wd-cell title="地址管理" is-link @click="goToAddressList">
          <template #icon>
            <view class="i-ri:map-pin-line cell-icon"></view>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <OrderTabbar />
  </view>
</template>

<script lang="ts" setup>
import OrderTabbar from '../components/order-tabbar.vue'
import { useUserStore } from '@/store'
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const avatarUrl = computed(() => {
  return `${baseUrl}${userStore.userInfo.avatar}`
})

const hidePhone = computed(() => {
  if (userInfo.value.phone) {
    return String(userInfo.value.phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return '手机号未设置'
})

const goPersonalEdit = () => {
  uni.navigateTo({
    url: '/pages/personal/personal-edit',
  })
}

// 跳转到订单列表
const goToOrderList = () => {
  uni.navigateTo({
    url: '/pages/order-system/order/order-list',
  })
}

// 跳转到地址列表
const goToAddressList = () => {
  uni.navigateTo({
    url: '/pages/order-system/address/address-list',
  })
}
</script>

<style lang="scss" scoped>
.person-container {
  min-height: 100vh;
  padding-bottom: 100rpx;
  background-color: #f5f5f5;
}

.menu-section {
  margin: 20rpx;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.cell-icon {
  margin-right: 10rpx;
  font-size: 40rpx;
  color: #3c9cff;
}
</style>
