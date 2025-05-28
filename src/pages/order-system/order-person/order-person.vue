<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '个人中心',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="person-container">
    <!-- 个人信息展示区 -->
    <view class="flex items-center p-32rpx bg-white mb-24rpx">
      <view class="mr-32rpx">
        <!-- <view class="w-[48px] h-[48px] flex justify-center items-center">
          <wd-img width="48" height="48" round src="/static/images/default_avatar.png"></wd-img>
        </view> -->
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
      <view class="flex-1" @click="goPersonalEdit">
        <view class="user-info-item">
          <text class="user-info-label">昵称：</text>
          <text class="user-info-value">{{ userInfo.nikename || '-' }}</text>
        </view>
        <view class="user-info-item mt-10rpx">
          <text class="user-info-label">用户名：</text>
          <text class="user-info-value">{{ userInfo.username || '-' }}</text>
        </view>
        <!-- <view class="user-info-item mt-10rpx">
          <text class="user-info-label">用户编号：</text>
          <text class="user-info-value">{{ userInfo.user_code || '-' }}</text>
        </view> -->
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

        <!-- 订单状态快捷入口 -->
        <view class="order-shortcuts">
          <view class="shortcut-item" @click="goToOrderStatus(0)">
            <view class="shortcut-icon">
              <view class="i-ri:bill-line"></view>
            </view>
            <text class="shortcut-text">待付款</text>
          </view>
          <view class="shortcut-item" @click="goToOrderStatus(2)">
            <view class="shortcut-icon">
              <view class="i-ri:truck-line"></view>
            </view>
            <text class="shortcut-text">待发货</text>
          </view>
          <view class="shortcut-item" @click="goToOrderStatus(3)">
            <view class="shortcut-icon">
              <view class="i-ri:inbox-archive-line"></view>
            </view>
            <text class="shortcut-text">待收货</text>
          </view>
          <view class="shortcut-item" @click="goToOrderStatus(4)">
            <view class="shortcut-icon">
              <view class="i-ri:checkbox-circle-line"></view>
            </view>
            <text class="shortcut-text">已完成</text>
          </view>
        </view>

        <wd-cell title="推广员" v-if="userInfo.is_yewu == 1">
          <template #icon>
            <view class="i-ri:user-line cell-icon"></view>
          </template>
        </wd-cell>

        <!-- 推广数据展示区 -->
        <view class="promotion-stats" v-if="userInfo.is_yewu == 1">
          <view class="stat-item" @click="goToPerformanceList(1)">
            <view class="stat-value">{{ performance.yao_num }}</view>
            <view class="stat-label">累计客户</view>
          </view>
          <view class="stat-item" @click="goToPerformanceList(2)">
            <view class="stat-value">{{ performance.all_performance }}</view>
            <view class="stat-label">总业绩</view>
          </view>
          <view class="stat-item" @click="goToPerformanceList(3)">
            <view class="stat-value">{{ performance.performance }}</view>
            <view class="stat-label">本月业绩</view>
          </view>
        </view>

        <wd-cell title="邀请ID" :value="userInfo.invitation_id" v-if="userInfo.is_yewu == 1">
          <template #icon>
            <view class="i-ri:pass-valid-line cell-icon"></view>
          </template>
        </wd-cell>

        <wd-cell title="地址管理" is-link @click="goToAddressList">
          <template #icon>
            <view class="i-ri:map-pin-line cell-icon"></view>
          </template>
        </wd-cell>
      </wd-cell-group>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-button-container">
      <wd-button size="large" @click="logout" class="logout-button">
        <view class="flex items-center justify-center">
          <view class="i-ri:logout-box-line mr-8rpx"></view>
          <text>退出商城</text>
        </view>
      </wd-button>
    </view>

    <OrderTabbar />
  </view>
</template>

<script lang="ts" setup>
import { httpPost } from '@/utils/http'
import OrderTabbar from '../components/order-tabbar.vue'
// import { useUserStore } from '@/store'
import { getOrderToken } from '@/utils/orderToken'
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

// const userStore = useUserStore()

const userInfo = ref<{
  nikename: string
  username: string
  user_code: string
  level: number
  avatar: string
  invitation_id: string
  is_yewu: number
}>({
  nikename: '',
  username: '',
  user_code: '',
  level: 1,
  avatar: '',
  invitation_id: '',
  is_yewu: 0,
})

const performance = ref<{
  yao_num: number
  all_performance: number
  performance: number
}>({
  yao_num: 0, // 累计客户
  all_performance: 0, // 总业绩
  performance: 0, // 本月业绩
})

const avatarUrl = computed(() => {
  return `${baseUrl}${userInfo.value.avatar}`
})

// const hidePhone = computed(() => {
//   if (userInfo.value.phone) {
//     return String(userInfo.value.phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
//   }
//   return '手机号未设置'
// })

const getUserInfo = async () => {
  const res = await httpPost('/api/UsersInfo/index', {
    token: getOrderToken(),
  })
  userInfo.value = res.data as {
    nikename: string
    username: string
    level: number
    user_code: string
    avatar: string
    invitation_id: string
    is_yewu: number
  }
  // uni.setStorageSync('userLevel', userInfo.value.level)
}

const getPerformance = async () => {
  const postData = {
    token: getOrderToken(),
  }
  const result = await httpPost('/api/usersinfo/getPerformance', postData)

  performance.value = result.data as {
    yao_num: number
    all_performance: number
    performance: number
  }
}

const goPersonalEdit = () => {
  uni.navigateTo({
    url: '/pages/order-system/order-person/order-personal-edit',
  })
}

// 跳转到订单列表
const goToOrderList = () => {
  uni.navigateTo({
    url: '/pages/order-system/order/order-list',
  })
}

// 跳转到指定状态的订单列表
const goToOrderStatus = (status: number) => {
  uni.navigateTo({
    url: `/pages/order-system/order/order-list?status=${status}`,
  })
}

const goToPerformanceList = (type: number) => {
  uni.navigateTo({
    url: `/pages/order-system/performance-list/performance-list?type=${type}`,
  })
}

// 跳转到修改密码
const handleChangePassword = () => {
  uni.navigateTo({
    url: '/pages/order-system/order-person/change-password',
  })
}

// 跳转到地址列表
const goToAddressList = () => {
  uni.navigateTo({
    url: '/pages/order-system/address/address-list',
  })
}

// 退出登录
const logout = () => {
  // 清除登录相关的存储
  // uni.removeStorageSync('orderToken')
  // uni.removeStorageSync('userLevel')

  // 延迟跳转到登录页
  setTimeout(() => {
    uni.reLaunch({
      url: '/pages/start/start',
    })
  }, 1500)

  // 显示退出成功提示
  // uni.showToast({
  //   title: '已退出登录',
  //   icon: 'success',
  //   duration: 1500,
  // })
}

onShow(() => {
  getUserInfo()
  getPerformance()
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
  color: #23b7eb;
}

.logout-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  margin: 60rpx 40rpx;
}

.logout-button {
  border-radius: 12rpx;
}

.order-shortcuts {
  display: flex;
  justify-content: space-between;
  padding: 30rpx 20rpx;
  background-color: #fff;
  border-top: 1px solid #f5f5f5;
}

.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
  cursor: pointer;
}

.shortcut-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 10rpx;
  font-size: 48rpx;
  color: #23b7eb;
}

.shortcut-text {
  font-size: 26rpx;
  color: #333;
}

.promotion-stats {
  display: flex;
  justify-content: space-around;
  padding: 30rpx 20rpx;
  background-color: #fff;
  border-top: 1px solid #f5f5f5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 33.33%;
}

.stat-value {
  font-size: 36rpx;
  font-weight: bold;
  color: #23b7eb;
}

.stat-label {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #666;
}
</style>
