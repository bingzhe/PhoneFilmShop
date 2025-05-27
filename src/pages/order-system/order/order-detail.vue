<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '订单详情',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="order-detail">
    <view v-if="loading" class="loading-box">
      <wd-loading color="#23B7EB" />
    </view>

    <template v-else-if="orderInfo">
      <!-- 订单状态 -->
      <view class="status-card">
        <view class="status-title">{{ getStatusText(orderInfo.status) }}</view>
        <view class="status-desc">{{ getStatusDesc(orderInfo.status) }}</view>
      </view>

      <!-- 收货信息 -->
      <view class="info-card">
        <view class="card-title">
          <wd-icon name="location" color="#23B7EB" size="36rpx" />
          <text>收货信息</text>
        </view>
        <view class="address-info">
          <view class="user-info">{{ orderInfo.addressee }} {{ orderInfo.phone }}</view>
          <view class="address-detail">
            {{ orderInfo.province }}{{ orderInfo.city }}{{ orderInfo.area }}{{ orderInfo.address }}
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-card">
        <view class="card-title">
          <wd-icon name="document" color="#23B7EB" size="36rpx" />
          <text>订单信息</text>
        </view>
        <view class="info-item">
          <text class="item-label">订单编号</text>
          <text class="item-value">{{ orderInfo.order_no }}</text>
        </view>
        <view class="info-item">
          <text class="item-label">下单时间</text>
          <text class="item-value">{{ orderInfo.ctime }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.pay_time">
          <text class="item-label">付款时间</text>
          <text class="item-value">{{ orderInfo.pay_time }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.send_time">
          <text class="item-label">发货时间</text>
          <text class="item-value">{{ orderInfo.send_time }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.shou_time">
          <text class="item-label">签收时间</text>
          <text class="item-value">{{ orderInfo.shou_time }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.logistics_company">
          <text class="item-label">快递公司</text>
          <text class="item-value">{{ orderInfo.logistics_company }}</text>
        </view>
        <view class="info-item" v-if="orderInfo.logistics_no">
          <text class="item-label">快递单号</text>
          <view class="flex-row">
            <text class="item-value">{{ orderInfo.logistics_no }}</text>
            <view class="copy-btn" @click="copyText(orderInfo.logistics_no)">复制</view>
          </view>
        </view>
        <view class="info-item" v-if="orderInfo.remark">
          <text class="item-label">订单备注</text>
          <text class="item-value">{{ orderInfo.remark }}</text>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="info-card">
        <view class="card-title">
          <wd-icon name="cart" color="#23B7EB" size="36rpx" />
          <text>商品信息</text>
        </view>

        <!-- 商品列表格式 -->
        <view class="goods-container">
          <!-- 商品列表 -->
          <view class="goods-list">
            <view
              v-for="(item, itemIndex) in orderInfo.goods_list"
              :key="itemIndex"
              class="goods-item"
            >
              <image :src="item.pic" class="goods-image"></image>
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

        <view class="price-detail">
          <view class="price-item">
            <text>商品总数</text>
            <text>{{ orderInfo.total_goods_count }}</text>
          </view>
          <view class="price-item">
            <text>商品总价</text>
            <text>¥{{ orderInfo.price }}</text>
          </view>
          <!-- <view class="price-item">
            <text>运费</text>
            <text>¥{{ orderInfo.ship_price }}</text>
          </view> -->
          <view class="price-total">
            <text>实付金额</text>
            <text class="total-price">¥{{ orderInfo.price }}</text>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="footer-actions">
        <view v-if="orderInfo.status === 0" class="action-btn cancel-btn" @click="cancelOrder">
          取消订单
        </view>
        <view v-if="orderInfo.status === 0" class="action-btn pay-btn" @click="payOrder">
          立即付款
        </view>
      </view>
    </template>

    <view v-else class="empty-box">
      <image class="empty-img" src="/static/images/empty.png" mode="aspectFit"></image>
      <view class="empty-text">暂无订单数据</view>
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
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { httpGet, httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/store'
import { getOrderToken } from '@/utils/orderToken'

const toast = useToast()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

// 支付相关
const showPaymentPopup = ref(false)
const selectedPayment = ref('2')
const currentOrderPrice = ref(0)

// 数据相关
const orderId = ref('')
const orderInfo = ref<any>(null)
const loading = ref(false)

// 状态文本映射
const statusTextMap = {
  '0': '待付款',
  '2': '待发货',
  '3': '待收货',
  '4': '已完成',
}
// 状态描述映射
const statusDescMap = {
  0: '订单已提交，请及时付款',
  2: '商家已确认订单，等待发货',
  3: '商家已发货，等待收货',
  4: '订单已完成',
}

// 获取订单状态文本
const getStatusText = (status: number) => {
  return statusTextMap[status] || '未知状态'
}

// 获取订单状态描述
const getStatusDesc = (status: number) => {
  return statusDescMap[status] || ''
}

// 加载订单详情
const getOrderDetail = async () => {
  if (!orderId.value) return

  loading.value = true
  try {
    const res = await httpPost('/Api/Order/GetOrderInfo', {
      order_id: orderId.value,
      token: getOrderToken(),
    })
    orderInfo.value = res.data

    // 计算订单商品总数
    orderInfo.value.total_goods_count = orderInfo.value.goods_list.reduce(
      (total: number, goods: any) => {
        return total + (Number(goods.goods_num) || 0)
      },
      0,
    )

    orderInfo.value.goods_list.forEach((item: any) => {
      item.pic = `${baseUrl}${item.goods_img}`
    })
  } catch (error) {
    console.error('获取订单详情失败', error)
    uni.showToast({
      title: '获取订单详情失败',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// 取消订单
const cancelOrder = () => {
  uni.showModal({
    title: '提示',
    content: '确定要取消该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await httpPost('/Api/Order/QuxiaoOrder', {
            order_id: orderId.value,
            token: getOrderToken(),
          })
          uni.showToast({
            title: '订单取消成功',
            icon: 'success',
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
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

// 复制文本
const copyText = (text: string) => {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success',
      })
    },
  })
}

// 立即付款
const payOrder = () => {
  currentOrderPrice.value = Number(orderInfo.value.price)
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
    order_no: orderInfo.value.order_no,
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
          // 刷新订单详情
          getOrderDetail()
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

// 页面加载获取参数
onLoad((options) => {
  if (options.order_id) {
    orderId.value = options.order_id
    getOrderDetail()
  } else {
    uni.showToast({
      title: '订单ID不能为空',
      icon: 'error',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style lang="scss" scoped>
.order-detail {
  min-height: 100vh;
  padding-bottom: 120rpx;
  background-color: #f5f5f5;
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

.status-card {
  padding: 40rpx;
  color: white;
  background-color: #23b7eb;
}

.status-title {
  margin-bottom: 10rpx;
  font-size: 36rpx;
  font-weight: bold;
}

.status-desc {
  font-size: 28rpx;
  opacity: 0.8;
}

.info-card {
  padding: 30rpx;
  margin: 20rpx;
  background-color: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  font-weight: bold;

  text {
    margin-left: 10rpx;
  }
}

.address-info {
  padding: 20rpx 0;
}

.user-info {
  margin-bottom: 10rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.address-detail {
  font-size: 28rpx;
  line-height: 40rpx;
  color: #666;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  font-size: 28rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.item-label {
  flex-shrink: 0;
  margin-right: 20rpx;
  color: #999;
}

.item-value {
  color: #333;
}

.flex-row {
  display: flex;
  align-items: center;
}

.copy-btn {
  padding: 4rpx 12rpx;
  margin-left: 20rpx;
  font-size: 24rpx;
  color: #23b7eb;
  border: 1rpx solid #23b7eb;
  border-radius: 20rpx;
}
/* 商品列表样式 */
.goods-container {
  margin-bottom: 20rpx;
}

.category-section {
  padding: 20rpx;
  margin-bottom: 20rpx;
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
  margin-bottom: 15rpx;
}

.category-tag {
  width: 6rpx;
  height: 30rpx;
  margin-right: 12rpx;
  background-color: #23b7eb;
  border-radius: 3rpx;
}

.category-title {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
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
  border-left: 4rpx solid #23b7eb;
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

.price-detail {
  padding-top: 20rpx;
  margin-top: 30rpx;
  border-top: 1rpx solid #f5f5f5;
}

.price-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  color: #666;
}

.discount {
  color: #ff4400;
}

.price-total {
  display: flex;
  justify-content: space-between;
  padding-top: 20rpx;
  margin-top: 20rpx;
  font-size: 28rpx;
  border-top: 1rpx dashed #eee;
}

.total-price {
  font-size: 36rpx;
  font-weight: bold;
  color: #ff4400;
}

.footer-actions {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  justify-content: flex-end;
  padding: 20rpx 30rpx;
  background-color: white;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-btn {
  padding: 16rpx 40rpx;
  font-size: 28rpx;
  border-radius: 40rpx;
}

.cancel-btn {
  margin-right: 20rpx;
  color: #666;
  background-color: white;
  border: 1rpx solid #ddd;
}

.pay-btn {
  color: #fff;
  background-color: #23b7eb;
  border: 1rpx solid #23b7eb;
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
