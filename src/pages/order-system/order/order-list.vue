<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '订单列表',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="order-list">
    <view class="status-filter">
      <view
        v-for="(item, index) in statusList"
        :key="index"
        class="status-item"
        :class="{ active: currentStatus === item.value }"
        @click="switchStatus(item.value)"
      >
        {{ item.label }}
      </view>
    </view>

    <view class="order-container">
      <view v-if="loading" class="loading-box">
        <wd-loading color="#00a3ff" />
      </view>

      <view v-else-if="orderList.length === 0" class="empty-box">
        <image class="empty-img" src="/static/images/empty.png" mode="aspectFit"></image>
        <view class="empty-text">暂无订单数据</view>
      </view>

      <view v-else>
        <view
          v-for="(order, index) in orderList"
          :key="index"
          class="order-item"
          @click="goToDetail(order.order_id)"
        >
          <view class="order-header">
            <view class="order-header-top">
              <view class="order-no">订单号：{{ order.order_no }}</view>
              <view class="order-status" :class="`status-${order.status}`">
                {{ getStatusText(order.status) }}
              </view>
            </view>
          </view>

          <!-- 分类商品列表 -->
          <view class="goods-container">
            <!-- 商品列表 -->
            <view class="goods-list">
              <view
                v-for="(item, itemIndex) in order.goods_list"
                :key="itemIndex"
                class="goods-item"
              >
                <image class="goods-image" :src="item.pic" mode="aspectFill"></image>
                <view class="goods-content">
                  <view class="goods-name">{{ item.goods_name }}</view>
                  <view class="goods-bottom">
                    <view class="goods-price">¥{{ item.goods_price }}</view>
                    <view class="goods-count">x{{ item.goods_num }}</view>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="order-footer">
            <view class="order-total">
              <text class="total-price">
                总数量：{{ order.total_goods_count }} 合计：¥{{ order.price }}
              </text>
            </view>

            <view class="order-actions">
              <view
                v-if="order.status === 0"
                class="action-btn cancel-btn"
                @click.stop="cancelOrder(order.order_id)"
              >
                取消订单
              </view>

              <view
                v-if="order.status === 0"
                class="action-btn detail-btn"
                @click.stop="payOrder(order)"
              >
                立即付款
              </view>

              <view class="action-btn detail-btn">查看详情</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <!-- 支付方式弹窗 -->
  <wd-popup v-model="showPaymentPopup" position="bottom" round>
    <view class="payment-popup">
      <view class="payment-popup-header">
        <text class="payment-popup-title">请选择支付方式</text>
        <wd-icon name="close" size="20px" @click="closePaymentPopup"></wd-icon>
      </view>
      <view class="payment-popup-content">
        <wd-radio-group v-model="selectedPayment">
          <wd-radio value="2">微信支付</wd-radio>
        </wd-radio-group>

        <view class="payment-amount">
          <text>支付金额：</text>
          <text class="payment-price">¥{{ currentOrderPrice.toFixed(2) }}</text>
        </view>
      </view>
      <view class="payment-popup-footer">
        <wd-button plain @click="closePaymentPopup">取消</wd-button>
        <wd-button type="primary" @click="confirmPayment">确定</wd-button>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { httpGet, httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { getOrderToken } from '@/utils/orderToken'

const toast = useToast()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

// 支付相关
const showPaymentPopup = ref(false)
const selectedPayment = ref('2')
const currentOrderNo = ref('')
const currentOrderPrice = ref(0)

// 订单状态列表
const statusList = [
  { label: '全部', value: 9999 },
  { label: '待付款', value: 0 },
  // { label: '待确认', value: 1 },
  { label: '待发货', value: 2 },
  { label: '待收货', value: 3 },
  { label: '已完成', value: 4 },
]

// 状态文本映射
const statusTextMap = {
  '0': '待付款',
  '2': '待发货',
  '3': '待收货',
  '4': '已完成',
}

// 数据相关
const currentStatus = ref(9999)
const orderList = ref<any[]>([])
const loading = ref(false)

// 切换订单状态
const switchStatus = (status: number) => {
  if (currentStatus.value === status) return
  currentStatus.value = status
  getOrderList()
}

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const params: any = {
      token: getOrderToken(),
    }

    // page: 1,
    // pageSize: 20,

    if (currentStatus.value !== 9999) {
      params.status = currentStatus.value
    }

    const res = await httpPost<any>('/Api/Order/GetOrderList', params)
    orderList.value = res.data || []

    orderList.value.forEach((item) => {
      // 计算订单商品总数
      item.total_goods_count = item.goods_list.reduce((total: number, goods: any) => {
        return total + (Number(goods.goods_num) || 0)
      }, 0)
      item.goods_list.forEach((goods: any) => {
        goods.pic = `${baseUrl}${goods.goods_img}`
      })
    })
  } catch (error) {
    console.error('获取订单列表失败', error)
    uni.showToast({
      title: '获取订单列表失败',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// 跳转到订单详情
const goToDetail = (orderId: string) => {
  uni.navigateTo({
    url: `/pages/order-system/order/order-detail?order_id=${orderId}`,
  })
}

// 取消订单
const cancelOrder = async (orderId: string) => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await httpPost('/Api/Order/QuxiaoOrder', {
            order_id: orderId,
            token: getOrderToken(),
          })
          uni.showToast({
            title: '订单取消成功',
            icon: 'success',
          })
          getOrderList()
        } catch (error) {
          uni.showToast({
            title: '订单取消失败',
            icon: 'error',
          })
        }
      }
    },
  })
}

// 立即付款
const payOrder = (order: any) => {
  currentOrderNo.value = order.order_no
  currentOrderPrice.value = Number(order.price)
  showPaymentPopup.value = true
}

// 关闭支付弹窗
const closePaymentPopup = () => {
  showPaymentPopup.value = false
}

// 确认支付
const confirmPayment = () => {
  toast.loading('支付处理中...')

  const params = {
    token: getOrderToken(),
    order_no: currentOrderNo.value,
    pay_type: selectedPayment.value,
  }

  httpPost('/api/OrderPay/goodsOrderPay', params)
    .then((res: any) => {
      console.log('支付成功', res)

      const result = JSON.parse(res.data)
      // 发起支付
      wx.requestPayment({
        timeStamp: result.timeStamp,
        nonceStr: result.nonceStr,
        package: result.package,
        signType: result.signType,
        paySign: result.paySign,
        fail: function (err: any) {
          console.error(err)
          toast.error('支付失败')
        },
        success: function () {
          // 提示支付成功
          toast.success('支付成功')
          // 刷新订单列表
          getOrderList()
        },
      })
    })
    .catch((err) => {
      toast.error(err || '支付失败')
    })
    .finally(() => {
      toast.close()
      closePaymentPopup()
    })
}

// 获取订单状态文本
const getStatusText = (status: number) => {
  return statusTextMap[status] || '未知状态'
}

// 获取商品总数量
const getTotalCount = (products: any[]) => {
  return products.reduce((total, product) => total + (product.count || 0), 0)
}

// 页面加载
onShow(() => {
  getOrderList()
})

// 处理页面参数
onLoad((options) => {
  if (options.status) {
    currentStatus.value = Number(options.status)
  }
})
</script>

<style lang="scss" scoped>
.order-list {
  min-height: 100vh;
  padding-bottom: 30rpx;
  background-color: #f5f5f5;
}

.status-filter {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  padding: 20rpx 10rpx;
  background-color: white;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
}

.status-item {
  position: relative;
  padding: 12rpx 24rpx;
  font-size: 28rpx;
  color: #333;
  border-radius: 30rpx;

  &.active {
    font-weight: bold;
    color: #00a3ff;

    &::after {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 40rpx;
      height: 6rpx;
      content: '';
      background-color: #00a3ff;
      border-radius: 3rpx;
      transform: translateX(-50%);
    }
  }
}

.order-container {
  padding: 20rpx;
}

.loading-box,
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-img {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

.order-item {
  margin-bottom: 20rpx;
  overflow: hidden;
  background-color: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.order-header {
  padding: 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.order-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 26rpx;
  color: #666;
}

.order-status {
  font-size: 26rpx;
  font-weight: bold;

  &.status-1 {
    color: #ff9800;
  }

  &.status-2 {
    color: #2196f3;
  }

  &.status-3 {
    color: #ff5722;
  }

  &.status-4 {
    color: #4caf50;
  }
}
/* 新商品列表样式 */
.goods-container {
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.category-section {
  padding: 15rpx;
  margin-bottom: 15rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.03);

  &:last-child {
    margin-bottom: 0;
  }
}

.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.category-tag {
  width: 6rpx;
  height: 28rpx;
  margin-right: 12rpx;
  background-color: #00a3ff;
  border-radius: 3rpx;
}

.category-title {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.category-stats {
  display: flex;
  align-items: center;
  font-weight: normal;
}

.category-count {
  margin-right: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.category-price {
  font-size: 24rpx;
  font-weight: bold;
  color: #ff4400;
}

.goods-list {
  padding: 10rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
}

.goods-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 15rpx 10rpx;
  border-bottom: 1rpx dashed #eee;

  &:last-child {
    border-bottom: none;
  }
}

.goods-image {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.goods-content {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.goods-name {
  display: -webkit-box;
  width: 100%;
  margin-bottom: 10rpx;
  overflow: hidden;
  font-size: 26rpx;
  line-height: 1.4;
  color: #333;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}

.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.goods-price {
  font-size: 26rpx;
  font-weight: bold;
  color: #ff4400;
}

.goods-count {
  padding: 2rpx 12rpx;
  font-size: 24rpx;
  color: #666;
  background-color: #f0f0f0;
  border-radius: 20rpx;
}

.package-item {
  padding: 15rpx 10rpx;
  margin: 15rpx 0 10rpx;
  background-color: #fff;
  border-left: 4rpx solid #00a3ff;
  border-radius: 8rpx;
}

.package-name {
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #666;
}

.package-detail {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #333;
}

.package-price {
  font-weight: bold;
  color: #ff4400;
}

.order-footer {
  padding: 24rpx;
}

.order-total {
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #666;
  text-align: right;
}

.total-price {
  margin-left: 10rpx;
  font-weight: bold;
  color: #ff4400;
}

.order-actions {
  display: flex;
  gap: 20rpx;
  justify-content: flex-end;
}

.action-btn {
  padding: 10rpx 30rpx;
  font-size: 26rpx;
  border: 1rpx solid #ddd;
  border-radius: 30rpx;
}

.cancel-btn {
  color: #666;
}

.detail-btn {
  color: white;
  background-color: #00a3ff;
  border: none;
}
/* 支付弹窗样式 */
.payment-popup {
  padding: 30rpx;
}

.payment-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
  border-bottom: 1px solid #f5f5f5;
}

.payment-popup-title {
  font-size: 32rpx;
  font-weight: bold;
}

.payment-popup-content {
  padding: 20rpx 0;
}

.payment-method {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.payment-method-left {
  display: flex;
  align-items: center;
}

.wechat-icon {
  margin-right: 20rpx;
  color: #07c160;
}

.payment-method-name {
  font-size: 30rpx;
}

.payment-amount {
  display: flex;
  justify-content: space-between;
  padding: 30rpx 0;
  margin-top: 20rpx;
  font-size: 30rpx;
  border-top: 1px solid #f5f5f5;
}

.payment-price {
  font-weight: bold;
  color: #ff4400;
}

.payment-popup-footer {
  display: flex;
  gap: 20rpx;
  justify-content: space-between;
  margin-top: 30rpx;
  margin-bottom: 30rpx;
}

.payment-popup-footer .wd-button {
  flex: 1;
}
</style>
