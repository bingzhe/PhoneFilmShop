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
  <view class="personal-info-container">
    <view class="profile-card">
      <view class="avatar-box">
        <wd-img width="72" height="72" round src="/static/images/default_avatar.png"></wd-img>
      </view>
      <view class="profile-content">
        <view class="nickname">{{ userInfo.nikename || '-' }}</view>
        <view class="username">用户名：{{ userInfo.username || '-' }}</view>
        <view class="user-code">用户编号：{{ userInfo.user_code || '-' }}</view>
      </view>
    </view>

    <view class="balance-card" @click="goToBalance">
      <view>
        <view class="balance-label">账户余额</view>
        <view class="balance-value">￥{{ balanceMoney }}</view>
      </view>
      <view class="balance-action">
        <view class="i-ri:wallet-3-line balance-icon"></view>
        <view class="i-ri:arrow-right-s-line balance-arrow"></view>
      </view>
    </view>

    <view class="info-section">
      <view class="section-title">基础信息</view>
      <view class="info-card">
        <view class="info-row">
          <view class="info-label">昵称</view>
          <view class="info-value">{{ userInfo.nikename || '-' }}</view>
        </view>
        <view class="info-row">
          <view class="info-label">用户名</view>
          <view class="info-value">{{ userInfo.username || '-' }}</view>
        </view>
        <view class="info-row">
          <view class="info-label">用户编号</view>
          <view class="info-value">{{ userInfo.user_code || '-' }}</view>
        </view>
      </view>
    </view>

    <view class="info-section">
      <view class="section-title">提现信息</view>
      <view class="info-card">
        <view class="info-row">
          <view class="info-label">姓名</view>
          <view class="info-value">{{ userInfo.real_name || '-' }}</view>
        </view>
        <view class="info-row">
          <view class="info-label">银行卡号</view>
          <view class="info-value">{{ userInfo.bank_code || '-' }}</view>
        </view>
        <view class="info-row">
          <view class="info-label">开户行</view>
          <view class="info-value">{{ userInfo.bank_address || '-' }}</view>
        </view>
      </view>
    </view>

    <view class="action-container">
      <wd-button block size="large" type="primary" @click="goToWithdrawBank">
        修改提现银行卡
      </wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'

type OrderUserInfo = {
  nikename: string
  username: string
  user_code: string
  balance_money: string | number
  real_name: string
  bank_code: string
  bank_address: string
}

const userInfo = ref<OrderUserInfo>({
  nikename: '',
  username: '',
  user_code: '',
  balance_money: 0,
  real_name: '',
  bank_code: '',
  bank_address: '',
})

const balanceMoney = computed(() => {
  const money = Number(userInfo.value.balance_money || 0)

  if (!Number.isFinite(money)) {
    return '0.00'
  }

  return money.toFixed(2)
})

const getUserInfo = async () => {
  const res = await httpPost<OrderUserInfo>('/api/UsersInfo/index', {
    token_order: getOrderToken(),
  })

  userInfo.value = {
    ...userInfo.value,
    ...res.data,
  }
}

const goToWithdrawBank = () => {
  uni.navigateTo({
    url: '/pages/order-system/order-person/withdraw-bank',
  })
}

const goToBalance = () => {
  uni.navigateTo({
    url: '/pages/order-system/order-person/balance',
  })
}

onShow(() => {
  getUserInfo()
})
</script>

<style lang="scss" scoped>
.personal-info-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f5f5f5;
}

.profile-card {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  margin-bottom: 24rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.avatar-box {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 144rpx;
  height: 144rpx;
  margin-right: 28rpx;
  background: #f1f8ff;
  border-radius: 72rpx;
}

.profile-content {
  flex: 1;
  min-width: 0;
}

.nickname {
  overflow: hidden;
  font-size: 40rpx;
  font-weight: 600;
  color: #1f2d3d;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.username,
.user-code {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #6b7280;
}

.balance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  margin-bottom: 32rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #00a3ff 0%, #38bdf8 100%);
  border-radius: 20rpx;
  box-shadow: 0 12rpx 28rpx rgba(0, 163, 255, 0.2);
}

.balance-label {
  font-size: 28rpx;
  opacity: 0.9;
}

.balance-value {
  margin-top: 12rpx;
  font-size: 52rpx;
  font-weight: 700;
  line-height: 1.2;
}

.balance-icon {
  font-size: 72rpx;
  opacity: 0.75;
}

.balance-action {
  display: flex;
  align-items: center;
}

.balance-arrow {
  margin-left: 8rpx;
  font-size: 44rpx;
  opacity: 0.85;
}

.info-section {
  margin-bottom: 28rpx;
}

.section-title {
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: #4b5563;
}

.info-card {
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  min-height: 96rpx;
  padding: 0 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: 0;
}

.info-label {
  flex-shrink: 0;
  width: 160rpx;
  font-size: 30rpx;
  color: #6b7280;
}

.info-value {
  flex: 1;
  font-size: 30rpx;
  line-height: 1.5;
  color: #1f2d3d;
  text-align: right;
  word-break: break-all;
}

.action-container {
  margin-top: 48rpx;
}
</style>
