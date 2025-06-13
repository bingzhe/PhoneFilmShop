<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '我的余额',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="min-h-100vh bg-#f5f5f5 px-24rpx py-24rpx">
    <!-- 余额卡片 -->
    <view class="bg-white rounded-12rpx p-32rpx mb-32rpx flex flex-col items-center shadow">
      <view class="text-16px color-#888 mb-8rpx">余额</view>
      <view class="text-32px font-bold color-#23B7EB">{{ balance }}</view>

      <view class="flex justify-between mt-32rpx">
        <wd-button type="primary" class="flex-1" @click="onWithdraw">提现</wd-button>
      </view>
    </view>

    <!-- 操作按钮 -->

    <!-- tab切换 -->
    <wd-tabs v-model="activeTab" @change="onTabChange" class="mb-16rpx">
      <wd-tab title="余额明细" name="balance" />
      <wd-tab title="提现明细" name="withdraw" />
    </wd-tabs>

    <!-- 明细列表 -->
    <view v-if="activeTab === 'balance'">
      <view v-if="balanceList.length === 0" class="text-center color-#bbb py-32rpx">
        暂无余额明细
      </view>
      <view
        v-for="item in balanceList"
        :key="item.id"
        class="bg-white rounded-8rpx p-24rpx mt-16rpx"
      >
        <view class="flex justify-between items-center mb-8rpx">
          <view class="text-16px font-bold color-#333">{{ item.remark }}</view>
          <view
            :class="Number(item.bill_data) > 0 ? 'color-#23B7EB' : 'color-#fa4126'"
            class="text-16px font-bold"
          >
            {{ Number(item.bill_data) > 0 ? '+' : '' }}{{ item.bill_data }}
          </view>
        </view>
        <view class="text-12px color-#888">{{ item.time }}</view>
      </view>
    </view>
    <view v-else>
      <view v-if="withdrawList.length === 0" class="text-center color-#bbb py-32rpx">
        暂无提现明细
      </view>
      <view
        v-for="item in withdrawList"
        :key="item.id"
        class="bg-white rounded-8rpx p-24rpx mt-16rpx"
      >
        <view class="flex justify-between items-center mb-8rpx">
          <view class="text-16px font-bold color-#333">提现 {{ item.withdraw_price }}</view>
          <view
            :class="
              item.status === 1
                ? 'color-#23B7EB'
                : item.status === 0
                  ? 'color-#888'
                  : 'color-#fa4126'
            "
            class="text-14px font-bold"
          >
            {{ item.status === 1 ? '审核通过' : item.status === 0 ? '审核中' : '未通过' }}
          </view>
        </view>
        <view class="text-12px color-#888 mb-4rpx">{{ item.time }}</view>
        <view v-if="item.status === -1 && item.fail_msg" class="text-12px color-#fa4126">
          失败原因：{{ item.fail_msg }}
        </view>
      </view>
    </view>
    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'
import dayjs from 'dayjs'

const toast = useToast()
const balance = ref('0.00')
const activeTab = ref('balance')
const balanceList = ref<any[]>([])
const withdrawList = ref<any[]>([])

const canWithdraw = ref(true)

const getUserInfo = async () => {
  const res = await httpPost('/api/UsersInfo/index', {
    token: getOrderToken(),
  })

  const data = res.data as {
    balance: string
    real_name: string
    bank_code: string
    bank_address: string
  }

  balance.value = data.balance

  canWithdraw.value = !!(data.real_name && data.bank_code && data.bank_address)
}

function getBalanceList() {
  toast.loading('加载中...')
  httpPost('/Api/Usersinfo/getUsersBill', {
    token: getOrderToken(),
    type: 2, // 可提现余额
  })
    .then((res: any) => {
      if (res.code === 200) {
        balanceList.value = (res.data || []).map((item: any) => ({
          id: item.bill_id,
          remark: item.remark,
          bill_data: item.bill_data,
          time: dayjs.unix(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
        }))
      } else {
        balanceList.value = []
      }
    })
    .finally(() => {
      toast.close()
    })
}

function getWithdrawList() {
  toast.loading('加载中...')
  httpPost('/Api/UsersWithdraw/withdrawBill', {
    token: getOrderToken(),
  })
    .then((res: any) => {
      if (res.code === 200) {
        // create_time: 1749809059
        // fail_msg: null
        // status: 0 //-1 未通过 0 审核中 1审核通过
        // withdraw_price: "100.00"
        withdrawList.value = (res.data || []).map((item: any) => ({
          id: item.id,
          withdraw_price: item.withdraw_price,
          status: item.status,
          fail_msg: item.fail_msg,
          time: dayjs.unix(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
        }))
      } else {
        withdrawList.value = []
      }
    })
    .finally(() => {
      toast.close()
    })
}

function onTabChange({ index, name }) {
  console.log(index, name)
  if (name === 'balance') {
    getBalanceList()
  } else {
    getWithdrawList()
  }
}

function onWithdraw() {
  if (!canWithdraw.value) {
    // 跳转到提现绑定页面（如有）
    toast.info('请先绑定提现账户')

    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/order-system/withdraw-bind/withdraw-bind',
      })
    }, 1000)
  } else {
    // 跳转到提现页面
    uni.navigateTo({
      url: '/pages/order-system/withdraw-opr/withdraw-opr',
    })
  }
}

onShow(() => {
  getUserInfo()
  getBalanceList()
  getWithdrawList()
})
</script>
