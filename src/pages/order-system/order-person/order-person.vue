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
        <view class="w-[48px] h-[48px] flex justify-center items-center">
          <wd-img width="48" height="48" round src="/static/images/default_avatar.png"></wd-img>
        </view>
        <!-- <wd-img width="48" height="48" round :src="avatarUrl" @click="goPersonalEdit">
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
        </wd-img> -->
      </view>
      <view class="flex-1">
        <view class="user-info-item">
          <text class="user-info-label">昵称：</text>
          <text class="user-info-value">{{ userInfo.nikename || '-' }}</text>
        </view>
        <view class="user-info-item mt-10rpx">
          <text class="user-info-label">用户名：</text>
          <text class="user-info-value">{{ userInfo.username || '-' }}</text>
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
        <!-- <wd-cell title="地址管理" is-link @click="goToAddressList">
          <template #icon>
            <view class="i-ri:map-pin-line cell-icon"></view>
          </template>
        </wd-cell> -->
      </wd-cell-group>
    </view>

    <OrderTabbar />
  </view>
</template>

<script lang="ts" setup>
import { httpPost } from '@/utils/http'
import OrderTabbar from '../components/order-tabbar.vue'
// import { useUserStore } from '@/store'
import { getOrderToken } from '@/utils/orderToken'
// const baseUrl = import.meta.env.VITE_SERVER_BASEURL

// const userStore = useUserStore()

const userInfo = ref<{
  nikename: string
  username: string
}>({
  nikename: '',
  username: '',
})

// const avatarUrl = computed(() => {
//   return `${baseUrl}${userStore.userInfo.avatar}`
// })

// const hidePhone = computed(() => {
//   if (userInfo.value.phone) {
//     return String(userInfo.value.phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
//   }
//   return '手机号未设置'
// })

const getUserInfo = async () => {
  const res = await httpPost('/api/UsersInfo/index', {
    token_order: getOrderToken(),
  })
  userInfo.value = res.data as {
    nikename: string
    username: string
  }
}

// const goPersonalEdit = () => {
//   uni.navigateTo({
//     url: '/pages/order-system/order-person/order-personal-edit',
//   })
// }

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

onShow(() => {
  getUserInfo()
})
</script>

<style lang="scss" scoped>
.person-container {
  min-height: 100vh;
  padding-bottom: 100rpx;
  background-color: #f5f5f5;
}

.user-info-item {
  display: flex;
  align-items: center;
}

.user-info-label {
  margin-right: 10rpx;
  font-size: 30rpx;
  color: #666;
}

.user-info-value {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
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
