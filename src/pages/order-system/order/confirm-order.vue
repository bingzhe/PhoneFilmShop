<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '订单确认',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="container">
    <!-- 地址模块 -->
    <!-- <view class="address-block" @click="navigateToAddress">
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
    </view> -->

    <!-- 商品信息模块 -->
    <view v-if="cartCategories.length > 0" class="goods-block">
      <!-- 分类商品列表 -->
      <view class="category-section" v-for="(category, index) in cartCategories" :key="index">
        <view class="category-title">{{ category.category_name }}</view>

        <!-- 商品列表 -->
        <view class="goods-list">
          <view class="goods-item" v-for="(item, itemIndex) in category.list" :key="itemIndex">
            <view class="goods-content">
              <view class="goods-name">{{ item.goods_name }}</view>
              <view class="goods-spec" v-if="item.spec_name">{{ item.spec_name }}</view>
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

    <!-- 汇总信息模块 -->
    <view class="summary-block">
      <view class="price-item">
        <text>商品金额</text>
        <text>¥{{ goodsPrice.toFixed(2) }}</text>
      </view>
      <view class="price-item">
        <text>包装费用</text>
        <text>¥{{ packagePrice.toFixed(2) }}</text>
      </view>
      <view class="price-item total-price">
        <text>订单总计</text>
        <text>¥{{ totalPrice.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 添加备注 -->
    <view class="remark-block">
      <view class="remark-title">添加备注</view>
      <view class="remark-input">
        <textarea class="remark-textarea" placeholder="请输入备注" v-model="remark"></textarea>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="order-footer">
      <view class="total-price">
        <text>合计：</text>
        <text class="price">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      <wd-button type="primary" round :disabled="!canSubmit" @click="submitOrder">
        提交订单
      </wd-button>
    </view>
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

// 备注
const remark = ref('')

// 获取购物车列表
const getCartList = () => {
  toast.loading('加载中...')
  httpPost<any>('/api/Order/GetCartList', {
    token_order: getOrderToken(),
  })
    .then((res) => {
      const data = res.data || {}

      // 如果有选中的商品
      if (cartIds.value.length > 0) {
        // 筛选出有选中商品的分类
        const filteredCategories: any[] = []

        // 遍历所有分类
        Object.values(data).forEach((category: any) => {
          if (category.list && category.list.length > 0) {
            // 筛选该分类中被选中的商品
            const selectedItems = category.list.filter((item: any) =>
              cartIds.value.includes(item.cart_id.toString()),
            )

            // 如果有选中的商品，保留该分类
            if (selectedItems.length > 0) {
              // 创建分类的副本
              const selectedCategory = {
                category_id: category.category_id,
                category_name: category.category_name,
                list: selectedItems,
                bao: category.bao,
              }

              filteredCategories.push(selectedCategory)
            }
          }
        })

        // 更新筛选后的分类数据
        cartCategories.value = filteredCategories

        console.log(cartCategories.value)

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
  let packageTotal = 0

  // 计算商品和包装总价
  cartCategories.value.forEach((category) => {
    // 计算当前分类下选中商品的总数量
    let categorySelectedCount = 0
    // 计算商品价格
    category.list.forEach((item) => {
      goodsTotal += Number(item.goods_price) * Number(item.goods_num)
      // 累加该分类下选中商品的数量
      categorySelectedCount += Number(item.goods_num)
    })

    // 计算包装价格
    if (category.bao) {
      packageTotal += Number(category.bao.goods_price)
    }
  })

  goodsPriceValue.value = goodsTotal
  packagePriceValue.value = packageTotal
}

// 存储计算后的价格
const goodsPriceValue = ref(0)
const packagePriceValue = ref(0)

// 价格计算属性
const goodsPrice = computed(() => {
  return goodsPriceValue.value
})

const packagePrice = computed(() => {
  return packagePriceValue.value
})

const totalPrice = computed(() => {
  return goodsPrice.value + packagePrice.value
})

// 是否可以提交订单
const canSubmit = computed(() => {
  return cartCategories.value.length > 0
})

// 获取默认地址
// const getDefaultAddress = () => {
//   httpPost('/Api/Usersinfo/getDefaultAddress', {
//     token_order: getOrderToken(),
//   })
//     .then((res) => {
//       if (res.data) {
//         defaultAddress.value = res.data
//       }
//     })
//     .catch((err) => {
//       console.error('获取默认地址失败', err)
//     })
// }

// 跳转到地址选择页面
// const navigateToAddress = () => {
//   uni.navigateTo({
//     url: '/pages/order-system/address/address-list?select=1',
//     events: {
//       // 监听地址选择事件
//       selectAddress: function (address: any) {
//         defaultAddress.value = address
//       },
//     },
//   })
// }

// 提交订单
const submitOrder = () => {
  // if (!defaultAddress.value) {
  //   toast.warning('请选择收货地址')
  //   return
  // }

  toast.loading('提交订单中...')
  const cartIdList = []
  cartCategories.value.forEach((category) => {
    category.list.forEach((item) => {
      cartIdList.push(item.cart_id)
    })

    if (category.bao) {
      cartIdList.push(category.bao.cart_id)
    }
  })
  console.log(cartIdList)
  httpPost('/api/Order/CreateOrder', {
    token_order: getOrderToken(),
    cart_list: cartIdList.join(','),
    order_price: totalPrice.value.toFixed(2),
    // address_id: defaultAddress.value.address_id,
    delivery_type: 0,
    remark: remark.value,
  })
    .then((res: any) => {
      // 调用上个页面的resetCart

      const pages = getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage) {
        prevPage.$vm.resetCart()
      }

      toast.success('订单提交成功')
      const orderId = res.data?.order_id
      // 跳转到订单详情或支付页面
      setTimeout(() => {
        uni.redirectTo({
          url: `/pages/order-system/order/order-detail?order_id=${orderId}`,
        })
      }, 1500)
    })
    .catch((err) => {
      toast.error(err || '提交订单失败')
    })
    .finally(() => {
      toast.close()
    })
}

onMounted(() => {
  getSafeArea() // 获取安全区域
})

onLoad((options: any) => {
  getSafeArea() // 获取安全区域
  if (options.cart_ids) {
    cartIds.value = options.cart_ids.split(',')
    getCartList()
    // getDefaultAddress()
  } else {
    toast.error('参数错误')
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style lang="scss" scoped>
.container {
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
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.goods-item:last-child {
  border-bottom: none;
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
  font-size: 28rpx;
  line-height: 1.4;
  color: #333;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
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
</style>
