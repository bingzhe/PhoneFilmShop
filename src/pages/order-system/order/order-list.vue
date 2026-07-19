<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '订单列表',
    navigationBarBackgroundColor: '#00A3FF',
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
            <view class="order-header-bottom">
              <view class="order-no">客户信息：{{ order.user_code + '-' + order.nikename }}</view>
            </view>
          </view>

          <!-- 分类商品列表 -->
          <view class="goods-toggle" @click.stop="toggleGoods(order.order_id)">
            <view class="goods-toggle-summary">
              <text class="goods-toggle-title">商品明细</text>
              <text class="goods-toggle-count">
                共 {{ order.all_num }} 件，{{ getCategoryCount(order.goods_list) }} 类
              </text>
            </view>
            <view class="expand-control" :class="{ expanded: isGoodsExpanded(order.order_id) }">
              <text>{{ isGoodsExpanded(order.order_id) ? '收起明细' : '展开明细' }}</text>
              <view class="expand-arrow"></view>
            </view>
          </view>

          <view v-if="isGoodsExpanded(order.order_id)" class="goods-container">
            <view
              v-for="(category, cateIndex) in order.goods_list"
              :key="cateIndex"
              class="category-section"
            >
              <view class="category-header">
                <view class="category-tag"></view>
                <view class="category-title">
                  <view class="category-info">
                    <text class="category-name">{{ category.category_name }}</text>
                    <view class="category-stats">
                      <text class="category-count">总数量: {{ category.all_num }}</text>
                      <text class="category-price">总价: ¥{{ category.all_price }}</text>
                    </view>
                  </view>
                </view>
              </view>

              <!-- 商品列表 -->
              <view class="goods-list">
                <view
                  v-for="(item, itemIndex) in category.list"
                  :key="itemIndex"
                  class="goods-item"
                >
                  <view class="goods-content">
                    <view class="goods-name">{{ item.goods_name }}</view>
                    <view class="goods-bottom">
                      <view class="goods-price">¥{{ item.goods_price }}</view>
                      <view class="goods-count">x{{ item.goods_num }}</view>
                    </view>
                  </view>
                </view>

                <!-- 包装信息 -->
                <view v-if="category.bao" class="package-item">
                  <view class="package-name">包装信息</view>
                  <view class="package-detail">
                    {{ category.bao.goods_name }}
                    <text class="package-price">¥{{ category.bao.goods_price }}</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <view class="order-footer">
            <view class="order-total">
              <text class="total-price">总数量：{{ order.all_num }} 合计：¥{{ order.price }}</text>
            </view>

            <view class="order-actions">
              <view
                v-if="order.status === 1"
                class="action-btn pay-btn"
                :class="{ disabled: payingOrderNo === order.order_no }"
                @click.stop="payOrder(order)"
              >
                {{ payingOrderNo === order.order_no ? '支付中' : '去支付' }}
              </view>
              <view
                v-if="order.status === 1"
                class="action-btn cancel-btn"
                @click.stop="cancelOrder(order.order_id)"
              >
                取消订单
              </view>
              <view class="action-btn detail-btn">查看详情</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { httpGet, httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { getOrderToken } from '@/utils/orderToken'
import { getPaymentErrorMessage, isPaymentCancel, payGoodsOrder } from '@/utils/orderPay'

const toast = useToast()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

// 订单状态列表
const statusList = [
  { label: '全部', value: 0 },
  { label: '待支付', value: 1 },
  { label: '待发货', value: 2 },
  { label: '已发货', value: 3 },
  { label: '已完成', value: 4 },
]

// 状态文本映射
const statusTextMap = {
  '1': '待支付',
  '2': '待发货',
  '3': '已发货',
  '4': '已完成',
}

// 数据相关
const currentStatus = ref(0)
const orderList = ref<any[]>([])
const loading = ref(false)
const payingOrderNo = ref('')
const expandedOrders = ref<Record<string, boolean>>({})

const isGoodsExpanded = (orderId: string | number) => !!expandedOrders.value[orderId]
const toggleGoods = (orderId: string | number) => {
  expandedOrders.value[orderId] = !expandedOrders.value[orderId]
}
const getCategoryCount = (goodsList: unknown) => {
  if (Array.isArray(goodsList)) return goodsList.length
  return goodsList && typeof goodsList === 'object' ? Object.keys(goodsList).length : 0
}

// 切换订单状态
const switchStatus = (status: number) => {
  if (currentStatus.value === status) return
  currentStatus.value = status
  getOrderList()
}

// 订单中商品的数据接口
// goods_list  {
//   33: {
//     category_id: 33,
//     category_name: '九强高铝防静电',
//     bao: {
//       category_id: 33,
//       category_name: '九强高铝防静电',
//       goods_id: 2193,
//       goods_name: '直屏钢化膜九强高铝防静电九强高铝（5合1裸片）包装',
//       goods_num: 1,
//       goods_price: '1.30',
//       is_bao: 1,
//       price: 1.3,
//     },
//     list: [
//       {
//         category_id: 33,
//         category_name: '九强高铝防静电',
//         goods_id: 1080,
//         goods_name: '直屏钢化膜九强高铝防静电OPPO R17',
//         goods_num: 4,
//         goods_price: '1.30',
//         is_bao: 0,
//         price: 5.2,
//       },
//     ],
//   },
// }

// 获取订单列表
const getOrderList = async () => {
  loading.value = true
  try {
    const params: any = {
      token_order: getOrderToken(),
    }

    if (currentStatus.value !== 0) {
      params.status = currentStatus.value
    }

    const res = await httpPost<any>('/Api/Order/GetOrderList', params)
    orderList.value = res.data || []
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
            token_order: getOrderToken(),
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

const payOrder = async (order: any) => {
  if (payingOrderNo.value) return

  if (!order?.order_no) {
    toast.error('订单编号不存在')
    return
  }

  payingOrderNo.value = order.order_no
  toast.loading('调起支付中...')

  try {
    await payGoodsOrder(order.order_no)
    toast.close()
    toast.success('支付成功')
    getOrderList()
  } catch (error) {
    toast.close()
    if (isPaymentCancel(error)) {
      toast.warning('支付已取消')
    } else {
      toast.error(getPaymentErrorMessage(error))
    }
  } finally {
    payingOrderNo.value = ''
  }
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
.goods-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 24rpx;
  border-bottom: 1rpx solid #f0f3f5;
}

.goods-toggle-summary {
  display: flex;
  align-items: baseline;
  min-width: 0;
}

.goods-toggle-title {
  flex: 0 0 auto;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.goods-toggle-count {
  margin-left: 14rpx;
  overflow: hidden;
  font-size: 23rpx;
  color: #8a939e;
  text-overflow: ellipsis;
  white-space: nowrap;
}

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
  min-height: 58rpx;
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
}

.category-info {
  min-width: 0;
}

.category-name {
  display: block;
  overflow: hidden;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.expand-control {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 8rpx 0 8rpx 18rpx;
  margin-left: 12rpx;
  font-size: 22rpx;
  color: #00a3ff;
}

.expand-arrow {
  width: 10rpx;
  height: 10rpx;
  margin: 0 4rpx 4rpx 8rpx;
  border-right: 2rpx solid currentColor;
  border-bottom: 2rpx solid currentColor;
  transition: transform 0.2s ease;
  transform: rotate(45deg);
}

.expand-control.expanded .expand-arrow {
  margin-top: 4rpx;
  margin-bottom: 0;
  transform: rotate(225deg);
}

.goods-list {
  padding: 10rpx;
  margin-top: 12rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
}

.goods-item {
  position: relative;
  padding: 15rpx 10rpx;
  border-bottom: 1rpx dashed #eee;

  &:last-child {
    border-bottom: none;
  }
}

.goods-content {
  display: flex;
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
  -webkit-line-clamp: 1;
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

.pay-btn {
  color: white;
  background-color: #ff9800;
  border: none;
}

.pay-btn.disabled {
  opacity: 0.65;
}

.detail-btn {
  color: white;
  background-color: #00a3ff;
  border: none;
}
</style>
