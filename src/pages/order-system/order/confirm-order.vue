<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '订单确认',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="page-container">
    <!-- 地址模块 -->
    <view class="address-block" @click="navigateToAddress">
      <view v-if="defaultAddress" class="address-info">
        <view class="address-header">
          <view class="address-name">{{ defaultAddress.name }}</view>
          <view class="address-phone">{{ defaultAddress.telephone }}</view>
        </view>
        <view class="address-detail">
          {{ defaultAddress.province_name }}{{ defaultAddress.city_name
          }}{{ defaultAddress.area_name }}{{ defaultAddress.address }}
        </view>
      </view>
      <view v-else class="no-address">
        <view class="no-address-text">请选择收货地址</view>
      </view>
      <view class="address-right">
        <wd-icon name="arrow-right" size="18px"></wd-icon>
      </view>
    </view>

    <!-- 商品信息模块 -->
    <view v-if="cartCategories.length > 0" class="goods-block">
      <!-- 商品列表 -->
      <view class="goods-list">
        <view class="goods-item" v-for="item in cartCategories" :key="item.cart_id">
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

    <!-- 汇总信息模块 -->
    <view class="summary-block">
      <view class="price-item">
        <text>配送方式</text>
        <text>快递</text>
      </view>
    </view>

    <!-- 添加备注 -->
    <!-- <view class="remark-block">
      <view class="remark-title">添加备注</view>
      <view class="remark-input">
        <textarea class="remark-textarea" placeholder="请输入备注" v-model="remark"></textarea>
      </view>
    </view> -->

    <!-- 底部结算栏 -->
    <view class="order-footer">
      <view class="total-price">
        <text>合计：</text>
        <text class="price">¥{{ goodsPriceValue.toFixed(2) }}</text>
      </view>
      <wd-button type="primary" round :disabled="!canSubmit" @click="submitOrder">
        提交订单
      </wd-button>
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
            <text class="payment-price">¥{{ goodsPriceValue.toFixed(2) }}</text>
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
// 可能用到的接口
// /api/Usersinfo/getDefaultAddress  获取用户默认地址
// /api/Order/GetCartList 购物车列表
// /api/Order/CreateOrder 创建购物车 参数token，cart_list，order_price，address_id
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { getLastPage } from '@/utils/index'
import { getOrderToken } from '@/utils/orderToken'

const toast = useToast()
const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

// 监听屏幕安全区域变化
const safeAreaInsetBottom = ref(0)

// 获取安全区域高度
const getSafeArea = () => {
  try {
    const { safeArea, screenHeight } = uni.getSystemInfoSync()
    if (safeArea && screenHeight) {
      safeAreaInsetBottom.value = screenHeight - safeArea.bottom
    }
  } catch (e) {
    console.error('获取安全区域失败', e)
  }
}

// 页面参数
const cartIds = ref<string[]>([])
const defaultAddress = ref<any>(null)

// 保存筛选后的购物车分类
const cartCategories = ref<any[]>([])

const orderNo = ref('')

// 备注
// const remark = ref('')

// 支付相关
const showPaymentPopup = ref(false)
const selectedPayment = ref('2')

// 获取购物车列表
const getCartList = () => {
  toast.loading('加载中...')
  httpPost<any>('/api/Order/GetCartList', {
    token: getOrderToken(),
  })
    .then((res) => {
      const data = res.data || []

      // 如果有选中的商品
      if (cartIds.value.length > 0) {
        // 筛选出有选中商品的分类
        const filteredCategories: any[] = []

        data.forEach((cart: any) => {
          cart.pic = `${baseUrl}${cart.goods_img}`

          // 筛选该分类中被选中的商品
          if (cartIds.value.includes(cart.cart_id.toString())) {
            filteredCategories.push(cart)
          }
        })

        // 更新筛选后的分类数据
        cartCategories.value = filteredCategories

        // 重新计算价格
        calculatePrices()
      }
    })
    .finally(() => {
      toast.close()
    })
}

// 计算总价方法
const calculatePrices = () => {
  let goodsTotal = 0

  // 计算商品价格
  cartCategories.value.forEach((item) => {
    goodsTotal += Number(item.goods_price) * Number(item.goods_num)
  })

  goodsPriceValue.value = goodsTotal
}

// 存储计算后的价格
const goodsPriceValue = ref(0)

// 是否可以提交订单
const canSubmit = computed(() => {
  return cartCategories.value.length > 0
})

// 获取默认地址
const getDefaultAddress = () => {
  httpPost('/Api/Usersinfo/getDefaultAddress', {
    token: getOrderToken(),
  })
    .then((res) => {
      if (res.data) {
        defaultAddress.value = res.data
      }
    })
    .catch((err) => {
      console.error('获取默认地址失败', err)
    })
}

// 跳转到地址选择页面
const navigateToAddress = () => {
  uni.navigateTo({
    url: '/pages/order-system/address/address-list?select=1',
  })
}

// 设置选择的地址
const setAddress = (address: any) => {
  defaultAddress.value = address
}

// 关闭支付弹窗
const closePaymentPopup = () => {
  showPaymentPopup.value = false
  // 跳转到订单列表
  setTimeout(() => {
    uni.redirectTo({
      url: '/pages/order-system/order/order-list',
    })
  }, 300)
}

// 确认支付
const confirmPayment = () => {
  toast.loading('支付处理中...')

  const params = {
    token: getOrderToken(),
    order_no: orderNo.value,
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

          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/order-system/order/order-list',
            })
          }, 1000)
        },
        success: function () {
          // 提示支付成功
          toast.success('支付成功')

          // 跳转到订单列表
          setTimeout(() => {
            uni.redirectTo({
              url: '/pages/order-system/order/order-list',
            })
          }, 1000)
        },
      })
    })
    .catch((err) => {
      toast.error(err || '支付失败')
    })
}

// 提交订单
const submitOrder = () => {
  if (!defaultAddress.value) {
    toast.warning('请选择收货地址')
    return
  }

  toast.loading('提交订单中...')
  const cartIdList = []
  cartCategories.value.forEach((cart) => {
    cartIdList.push(cart.cart_id)
  })
  console.log(cartIdList)
  httpPost('/api/Order/CreateOrder', {
    token: getOrderToken(),
    cart_list: cartIdList.join(','),
    order_price: goodsPriceValue.value.toFixed(2),
    pay_price: goodsPriceValue.value.toFixed(2),
    address_id: defaultAddress.value.address_id,
    delivery_type: 0,
    // remark: remark.value,
  })
    .then((res: any) => {
      // 调用上个页面的resetCart
      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage) {
        prevPage.$vm.resetCart()
      }

      toast.success('订单提交成功')
      console.log('提交订单', res)
      orderNo.value = res.data?.order_no

      // 显示支付弹窗
      setTimeout(() => {
        showPaymentPopup.value = true
        toast.close()
      }, 300)
    })
    .catch((err) => {
      toast.error(err || '提交订单失败')
    })
    .finally(() => {
      toast.close()
    })
}

defineExpose({
  setAddress,
})

onMounted(() => {
  // getSafeArea() // 获取安全区域
})

onLoad((options: any) => {
  getSafeArea() // 获取安全区域
  if (options.cart_ids) {
    cartIds.value = options.cart_ids.split(',')
    getCartList()
    getDefaultAddress()
  } else {
    toast.error('参数错误')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style lang="scss" scoped>
.page-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding-top: 20rpx;
  padding-bottom: 150rpx;
  background-color: #f7f8fa;
}

// 地址模块样式
.address-block {
  position: relative;
  display: flex;
  align-items: center;
  padding: 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.address-name {
  margin-right: 20rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.address-phone {
  font-size: 28rpx;
  color: #666;
}

.address-detail {
  font-size: 28rpx;
  line-height: 1.4;
  color: #333;
}

.no-address {
  flex: 1;
  padding: 20rpx 0;
}

.no-address-text {
  font-size: 30rpx;
  color: #00a3ff;
}

.address-right {
  color: #999;
}

// 商品模块样式
.goods-block {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.category-section {
  padding: 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.category-section:last-child {
  border-bottom: none;
}

.category-title {
  padding: 20rpx 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.goods-list {
  padding: 0 10rpx;
}

.goods-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.goods-item:last-child {
  border-bottom: none;
}

.goods-image {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
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
  font-size: 28rpx;
  line-height: 1.4;
  color: #333;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}

.goods-spec {
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #999;
}

.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.goods-price {
  font-size: 28rpx;
  font-weight: bold;
  color: #ff4400;
}

.goods-count {
  font-size: 26rpx;
  color: #666;
}

// 包装项
.package-item {
  padding: 20rpx;
  margin-top: 20rpx;
  background-color: #f9f9f9;
  border-radius: 8rpx;
}

.package-name {
  margin-bottom: 10rpx;
  font-size: 26rpx;
  color: #666;
}

.package-detail {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #333;
}

.package-price {
  font-weight: bold;
  color: #ff4400;
}

// 汇总模块
.summary-block {
  padding: 20rpx 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.price-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 0;
  font-size: 28rpx;
  color: #666;
}

.total-price {
  padding-top: 20rpx;
  margin-top: 10rpx;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  border-top: 1px solid #f5f5f5;
}

// 底部提交栏
.order-footer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 30rpx;
  padding-bottom: v-bind('safeAreaInsetBottom + "px"');
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.total-price {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.price {
  font-weight: bold;
  color: #ff4400;
}

// 备注模块
.remark-block {
  padding: 20rpx 30rpx;
  margin: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.remark-title {
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #333;
}

.remark-input {
  padding: 20rpx;
  border: 1rpx solid #f5f5f5;
  border-radius: 12rpx;
}

// 支付弹窗样式
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
