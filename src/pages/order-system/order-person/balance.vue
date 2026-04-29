<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '我的余额',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="balance-container">
    <view class="balance-card">
      <view>
        <view class="balance-label">当前余额</view>
        <view class="balance-value">￥{{ balanceMoney }}</view>
      </view>
      <view class="i-ri:wallet-3-line balance-icon"></view>
    </view>

    <view class="bill-section">
      <view class="section-header">
        <view class="section-title">余额明细</view>
        <view class="section-count">{{ billList.length }} 条</view>
      </view>

      <view v-if="loading" class="loading-box">
        <wd-loading />
        <view class="loading-text">加载中...</view>
      </view>

      <view v-else-if="billList.length === 0" class="empty-box">
        <image class="empty-img" src="/static/images/empty.png" mode="aspectFit"></image>
        <view class="empty-text">暂无余额明细</view>
      </view>

      <view v-else class="bill-list">
        <view v-for="(item, index) in billList" :key="item.id || index" class="bill-item">
          <view class="bill-main">
            <view class="bill-title">{{ getBillTitle(item) }}</view>
            <view class="bill-time">{{ getBillTime(item) }}</view>
          </view>
          <view class="bill-side">
            <view :class="['bill-money', getBillMoney(item).startsWith('-') ? 'is-minus' : '']">
              {{ getBillMoney(item) }}
            </view>
            <view v-if="getBillBalance(item)" class="bill-balance">
              余额 {{ getBillBalance(item) }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'

type OrderUserInfo = {
  balance_money?: string | number
}

type BillItem = Record<string, any>

const loading = ref(false)
const balance = ref<string | number>(0)
const billList = ref<BillItem[]>([])

const formatMoney = (value: unknown, withSign = true) => {
  const raw = value ?? 0
  const money = Number(raw)

  if (!Number.isFinite(money)) {
    return String(raw || '0.00')
  }

  const sign = withSign && money > 0 ? '+' : ''

  return `${sign}${money.toFixed(2)}`
}

const balanceMoney = computed(() => formatMoney(balance.value, false))

const pickFirst = (item: BillItem, keys: string[]) => {
  for (const key of keys) {
    const value = item[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return ''
}

const padDatePart = (value: number) => String(value).padStart(2, '0')

const formatBillTime = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  const raw = String(value).trim()
  if (!/^\d{10,13}$/.test(raw)) {
    return raw
  }

  const timestamp = raw.length === 10 ? Number(raw) * 1000 : Number(raw)
  const date = new Date(timestamp)

  if (Number.isNaN(date.getTime())) {
    return raw
  }

  const year = date.getFullYear()
  const month = padDatePart(date.getMonth() + 1)
  const day = padDatePart(date.getDate())
  const hours = padDatePart(date.getHours())
  const minutes = padDatePart(date.getMinutes())
  const seconds = padDatePart(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const normalizeBillList = (data: any): BillItem[] => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.list)) return data.list
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.items)) return data.items

  return []
}

const getBillTitle = (item: BillItem) => {
  return (
    pickFirst(item, [
      'title',
      'bill_title',
      'type_name',
      'name',
      'remark',
      'remarks',
      'content',
      'desc',
      'description',
    ]) || '余额变动'
  )
}

const getBillTime = (item: BillItem) => {
  const value =
    pickFirst(item, [
      'create_time',
      'created_at',
      'add_time',
      'time',
      'date',
      'updated_at',
      'update_time',
    ]) || '-'

  return formatBillTime(value)
}

const getBillMoney = (item: BillItem) => {
  const value = pickFirst(item, [
    'bill_data',
    'money',
    'amount',
    'price',
    'bill_money',
    'change_money',
    'balance_money',
    'withdraw_price',
  ])

  return formatMoney(value)
}

const getBillBalance = (item: BillItem) => {
  const value = pickFirst(item, ['after_money', 'after_balance', 'balance', 'current_balance'])

  return value === '' ? '' : formatMoney(value, false)
}

const getUserInfo = async () => {
  const res = await httpPost<OrderUserInfo>('/api/UsersInfo/index', {
    token_order: getOrderToken(),
  })

  balance.value = res.data?.balance_money ?? 0
}

const getUsersBill = async () => {
  const res = await httpPost('/api/UsersInfo/getUsersBill', {
    token_order: getOrderToken(),
  })

  billList.value = normalizeBillList(res.data)
}

const loadData = async () => {
  try {
    loading.value = true
    await Promise.all([getUserInfo(), getUsersBill()])
  } finally {
    loading.value = false
  }
}

onShow(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.balance-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 32rpx;
  background-color: #f5f5f5;
}

.balance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx;
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
  margin-top: 14rpx;
  font-size: 56rpx;
  font-weight: 700;
  line-height: 1.2;
}

.balance-icon {
  font-size: 78rpx;
  opacity: 0.75;
}

.bill-section {
  padding-bottom: 32rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2d3d;
}

.section-count {
  font-size: 26rpx;
  color: #8c8c8c;
}

.bill-list {
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.bill-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 120rpx;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.bill-item:last-child {
  border-bottom: 0;
}

.bill-main {
  flex: 1;
  min-width: 0;
  margin-right: 24rpx;
}

.bill-title {
  overflow: hidden;
  font-size: 30rpx;
  font-weight: 500;
  color: #1f2d3d;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bill-time {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #9ca3af;
}

.bill-side {
  flex-shrink: 0;
  text-align: right;
}

.bill-money {
  font-size: 32rpx;
  font-weight: 600;
  color: #00a3ff;
}

.bill-money.is-minus {
  color: #ef4444;
}

.bill-balance {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #9ca3af;
}

.loading-box,
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 360rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
}

.loading-text {
  margin-top: 16rpx;
  font-size: 28rpx;
  color: #8c8c8c;
}

.empty-img {
  width: 240rpx;
  height: 240rpx;
}

.empty-text {
  margin-top: 12rpx;
  font-size: 28rpx;
  color: #999999;
}
</style>
