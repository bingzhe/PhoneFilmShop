<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '购物车',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="page-container">
    <view v-if="cartList.length > 0" class="cart-list">
      <!-- 商品块 -->
      <view class="goods-item" v-for="item in cartList" :key="item.cart_id">
        <view class="goods-checkbox" @click.stop>
          <wd-checkbox size="large" v-model="item.checked" @change="updateTotalPrice"></wd-checkbox>
        </view>
        <image :src="item.pic" class="goods-image" @click="toggleItemChecked(item)"></image>
        <view class="goods-content" @click="toggleItemChecked(item)">
          <view class="goods-name mb-20rpx">{{ item.goods_name }}</view>

          <view class="goods-bottom">
            <view class="goods-price">¥{{ item.goods_price }}</view>
            <view class="goods-count" @click.stop>
              <wd-input-number
                v-model="item.goods_num"
                :min="1"
                @change="updateGoodsNum(item)"
              ></wd-input-number>
            </view>
          </view>
        </view>
        <view class="goods-delete" @click.stop="removeCartItem(item.cart_id)">
          <wd-icon name="delete" size="22px"></wd-icon>
        </view>
      </view>
    </view>

    <!-- 空购物车提示 -->
    <view v-if="cartList.length === 0 && !cartLoading" class="empty-cart">
      <image class="empty-image" src="/static/images/empty.png"></image>
      <view class="empty-text">购物车还是空的</view>
      <wd-button type="primary" round @click="goToCategory">去购物</wd-button>
    </view>

    <!-- 底部结算栏 -->
    <view class="cart-footer">
      <view class="select-all">
        <wd-checkbox size="large" v-model="isAllSelected" @change="selectAll">全选</wd-checkbox>
      </view>
      <view class="total-price">
        <text>合计：</text>
        <text class="price">¥{{ totalPrice.toFixed(2) }}</text>
      </view>
      <view class="action-buttons">
        <wd-button type="error" :disabled="selectedCount === 0" @click="batchDeleteItems">
          删除
        </wd-button>
        <wd-button type="primary" round :disabled="selectedCount === 0" @click="submitOrder">
          结算({{ selectedCount }})
        </wd-button>
      </view>
    </view>

    <!-- <OrderTabbar /> -->
  </view>
</template>

<script lang="ts" setup>
// import OrderTabbar from '../components/order-tabbar.vue'
import { httpPost } from '@/utils/http'
import { useUserStore } from '@/store'
import { useToast } from 'wot-design-uni'
import { nextTick, onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { getOrderToken } from '@/utils/orderToken'

const toast = useToast()
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const cartLoading = ref(true)

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const cartList = ref<any[]>([])
const isAllSelected = ref(false)
const totalPrice = ref(0)
const selectedCount = ref(0)

const selectedCartIds = ref<number[]>([])

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

// 获取购物车列表
const getCart = () => {
  cartLoading.value = true
  toast.loading('加载中...')
  httpPost<any[]>('/api/Order/GetCartList', {
    token: getOrderToken(),
  })
    .then((res) => {
      console.log('getCart', res)
      const data = res.data || []

      data.forEach((item: any) => {
        item.checked = true

        const select = cartList.value.find((goods) => goods.cart_id === item.cart_id)
        if (select) {
          item.checked = select.checked
        }

        // 处理商品图片路径
        item.pic = `${baseUrl}${item.goods_img}`
      })

      cartList.value = data
      updateTotalPrice()
    })
    .finally(() => {
      cartLoading.value = false
      toast.close()
    })
}

// 更新商品数量
const updateGoodsNum = (item: any) => {
  httpPost('/api/Order/CreateCart', {
    token: getOrderToken(),
    cart_id: item.cart_id,
    goods_num: item.goods_num,
    goods_id: item.goods_id,
  })
    .then(() => {
      updateTotalPrice()
    })
    .catch((res) => {
      toast.error(res)
      setTimeout(() => {
        toast.close()
      }, 2000)
    })
}

// 删除购物车商品
const removeCartItem = (cartId: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这个商品吗？',
    success: (res) => {
      if (res.confirm) {
        httpPost('/api/Order/DelCart', {
          token: getOrderToken(),
          cart_list: cartId,
        }).then(() => {
          toast.success('删除成功')
          getCart()
        })
      }
    },
  })
}

// 批量删除选中的商品
const batchDeleteItems = () => {
  if (selectedCartIds.value.length === 0) {
    toast.warning('请选择要删除的商品')
    return
  }

  uni.showModal({
    title: '提示',
    content: `确定要删除选中的${selectedCartIds.value.length}件商品吗？`,
    success: (res) => {
      if (res.confirm) {
        httpPost('/api/Order/DelCart', {
          token: getOrderToken(),
          cart_list: selectedCartIds.value.join(','),
        })
          .then(() => {
            toast.success('删除成功')
            getCart()
          })
          .catch((err) => {
            toast.error('删除失败，请重试')
            console.error(err)
          })
      }
    },
  })
}

// 更新总价和选中商品数量
const updateTotalPrice = () => {
  let price = 0
  let count = 0
  selectedCartIds.value = [] // 重置选中项

  cartList.value.forEach((cart) => {
    // 计算当前分类下选中商品的总数量
    let categorySelectedCount = 0
    if (cart.checked) {
      price += Number(cart.goods_price) * Number(cart.goods_num)
      count += 1
      // 更新选中的商品ID列表
      selectedCartIds.value.push(cart.cart_id)
      // 累加该分类下选中商品的数量
      categorySelectedCount += Number(cart.goods_num)
    }
  })

  totalPrice.value = price
  selectedCount.value = count
  // 保存选中的商品到本地存储
  // saveSelectedItems()

  // 检查是否全选
  const allSelected = cartList.value.length > 0 && cartList.value.every((cart) => cart.checked)
  isAllSelected.value = allSelected
}

const resetCart = () => {
  selectedCartIds.value = [] // 重置选中项
  getCart()
}

// 全选/取消全选
const selectAll = () => {
  cartList.value.forEach((item) => {
    item.checked = isAllSelected.value
  })
  updateTotalPrice()
}

// 跳转到分类页
const goToCategory = () => {
  uni.switchTab({
    url: '/pages/order-system/category/category',
  })
}

// 提交订单
const submitOrder = () => {
  const selectedItems = cartList.value
    .filter((cart) => cart.checked)
    .map((item: any) => item.cart_id)

  if (selectedItems.length === 0) {
    toast.warning('请选择要结算的商品')
    return
  }

  // 有选择的结算的商品的分类必须存在包装
  // console.log(
  //   cartList.value.filter(
  //     (category) => category.list && category.list.some((item) => item.checked),
  //   ),
  // )

  const url = `/pages/order-system/order/confirm-order?cart_ids=${selectedItems.join(',')}`

  uni.navigateTo({
    url,
  })
}

// 切换商品选中状态
const toggleItemChecked = (item: any) => {
  item.checked = !item.checked
  updateTotalPrice()
}

onShow(() => {
  // 获取订单令牌
  const token = getOrderToken()
  // console.log('token', token)
  if (!token) {
    toast.warning('请先登录')

    // 没有登录跳转到登录
    setTimeout(() => {
      uni.reLaunch({
        url: '/pages/mall-login/mall-login',
      })
    }, 1000)
    return
  }

  // 获取本地存储的选中商品
  // getSelectedItems()
  getCart()
  getSafeArea()
  // setupResizeObserver()
})

defineExpose({
  resetCart,
})

onBeforeUnmount(() => {
  // if (resizeObserver) {
  //   resizeObserver.disconnect()
  // }
})
</script>

<style lang="scss" scoped>
.page-container {
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 150rpx;
  background-color: #f7f8fa;
}

.cart-list {
  padding: 20rpx;
}

.category-section {
  margin-bottom: 20rpx;
}

.category-title {
  padding: 20rpx 0;
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.goods-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 20rpx;
  cursor: pointer;
  background-color: #fff;
  border-radius: 12rpx;
  -webkit-tap-highlight-color: transparent;
  /* stylelint-disable-next-line property-no-unknown */
  tap-highlight-color: transparent;
}

.goods-checkbox {
  flex-shrink: 0; /* 防止图片容器被压缩 */
  margin-right: 20rpx;
}

.goods-image {
  flex-shrink: 0; /* 防止图片容器被压缩 */
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
  border-radius: 8rpx;
}

.goods-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  -webkit-tap-highlight-color: transparent;
  /* stylelint-disable-next-line property-no-unknown */
  tap-highlight-color: transparent;
}

.goods-name {
  display: -webkit-box;
  width: calc(100% - 44rpx);
  overflow: hidden;
  font-size: 30rpx;
  line-height: 1.4;
  color: #333;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  word-break: break-all;
}

.goods-spec {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #999;
}

.goods-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.goods-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff4400;
}

.goods-delete {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-image {
  width: 300rpx;
  height: 300rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  margin-bottom: 30rpx;
  font-size: 30rpx;
  color: #999;
}

.cart-footer {
  position: fixed;
  right: 0;
  /* 固定设置Tabbar高度为50px */
  bottom: 0;
  left: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  height: 100rpx;
  padding: 0 20rpx;
  /* 安全区域padding */
  // padding-bottom: v-bind('safeAreaInsetBottom + "px"');
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.select-all {
  margin-right: 20rpx;
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

.action-buttons {
  display: flex;
  gap: 10rpx;
  align-items: center;
}

::v-deep .wd-button.is-medium.is-round {
  min-width: 88px !important;
}

.package-section {
  padding: 20rpx;
  margin-top: 10rpx;
  margin-bottom: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.package-title {
  margin-bottom: 20rpx;
  font-size: 28rpx;
  color: #666;
}

.package-list {
  display: flex;
  flex-wrap: wrap;
  // gap: 20rpx;
}

.package-item {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  min-height: 100rpx; /* 确保有足够的高度显示两行文本 */
  padding: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden; /* 防止内容溢出 */
  border: 1px solid #eee;
  border-radius: 8rpx;
  transition: all 0.3s;
}

.package-item-active {
  color: #00a3ff;
  background-color: rgba(0, 163, 255, 0.05);
  border-color: #00a3ff;
}

.package-img {
  flex-shrink: 0; /* 防止图片容器被压缩 */
  width: 80rpx;
  height: 80rpx;
  margin-right: 15rpx;
}

.package-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  width: 0; /* 这个设置很重要，确保flex子元素可以正确应用overflow */
  min-width: 0;
}

.package-name {
  display: -webkit-box;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  font-size: 24rpx;
  line-height: 1.3;
  text-align: left;
  text-overflow: ellipsis;
  white-space: normal; /* 允许换行 */
  -webkit-line-clamp: 2; /* 显示2行 */
  -webkit-box-orient: vertical;
}

.package-price {
  margin-top: 8rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #ff4400;
  text-align: left;
}
</style>
