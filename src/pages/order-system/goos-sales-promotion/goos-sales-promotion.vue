<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '促销',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
    enablePullDownRefresh: true,
  },
}
</route>

<template>
  <view class="bg-white min-h-100vh">
    <!-- 促销商品列表 -->
    <view>
      <PromotionProductItem
        v-for="(product, idx) in list"
        :key="product.goods_id || idx"
        :product="product"
        @add-to-cart="onAddToCart(product)"
      />
      <view v-if="list.length === 0 && !loading" class="h-400rpx flex items-center justify-center">
        <image class="w-200rpx h-200rpx" src="/static/images/empty.png" />
      </view>
    </view>

    <!-- 加入购物车弹窗 -->
    <wd-popup
      v-model="showQuantityPopup"
      custom-style="border-radius:16rpx;padding:32rpx;"
      custom-class="!top-30vh"
      :z-index="29"
    >
      <view class="quantity-popup">
        <view class="popup-title text-center text-18px font-bold mb-32rpx">选择数量</view>
        <view class="popup-content mb-32rpx">
          <view class="flex mb-16rpx">
            <image
              :src="currentProduct?.goods_img_full"
              mode="aspectFill"
              class="popup-product-image mr-16rpx"
            />
            <view class="product-name text-16px flex-1 w-350rpx">
              {{ currentProduct?.goods_name || '' }}
            </view>
          </view>
          <view class="flex justify-between items-center">
            <text class="text-14px">数量：</text>
            <wd-input-number v-model="selectedQuantity" :min="1"></wd-input-number>
          </view>
        </view>
        <view class="popup-footer flex justify-between">
          <wd-button type="info" class="flex-1 mr-16rpx" @click="closeQuantityPopup">
            取消
          </wd-button>
          <wd-button type="primary" class="flex-1" @click="confirmAddToCartBefore">
            加入购物车
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { httpGet, httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'
import { useToast } from 'wot-design-uni'
import PromotionProductItem from './components/promotion-product-item.vue'

const toast = useToast()
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const list = ref<any[]>([])
const loading = ref(false)
const showQuantityPopup = ref(false)
const selectedQuantity = ref(1)
const currentProduct = ref<any>(null)

const page = ref(1)
const total = ref(0)

// 获取促销商品列表
const fetchPromotionList = async (init?: boolean) => {
  if (init) {
    page.value = 1
    list.value = []
  }

  loading.value = true
  toast.loading('加载中...')
  try {
    const res = await httpGet<any>('/Api/OrderGoods/getChuList', {
      page: page.value,
      size: 50,
    })

    const data: any = res.data || {}
    const arr = (res.data?.list || []).map((item: any) => ({
      ...item,
      goods_img_full: `${baseUrl}${item.goods_img}?w=100&h=100`,
    }))

    total.value = data.count
    list.value = list.value.concat(arr)
  } finally {
    uni.stopPullDownRefresh()
    toast.close()
    loading.value = false
  }
}

// 加入购物车弹窗
const onAddToCart = (product: any) => {
  const token = getOrderToken()
  if (!token) {
    toast.warning('请先登录')
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/mall-login/mall-login' })
    }, 1000)
    return
  }
  currentProduct.value = product
  selectedQuantity.value = 1
  showQuantityPopup.value = true
}
const closeQuantityPopup = () => {
  showQuantityPopup.value = false
}
const confirmAddToCartBefore = () => {
  nextTick(() => {
    setTimeout(() => {
      confirmAddToCart()
    }, 100)
  })
}
const confirmAddToCart = () => {
  if (!currentProduct.value) return
  if (selectedQuantity.value === 0) {
    toast.warning('请添加数量')
    return
  }
  const cartList = [
    {
      goods_id: currentProduct.value.goods_id,
      goods_num: selectedQuantity.value,
    },
  ]
  httpPost<any[]>('/api/Order/CreateCartBatch', {
    token: getOrderToken(),
    cart_list: JSON.stringify(cartList),
  })
    .then(() => {
      uni.showToast({ title: '已添加到购物车', icon: 'success' })
      showQuantityPopup.value = false
    })
    .catch(() => {
      toast.error('添加失败，请重试')
    })
}

onMounted(() => {
  fetchPromotionList(true)
})

onReachBottom(() => {
  if (list.value.length >= total.value) {
    return
  }
  page.value = page.value + 1
  fetchPromotionList()
})

onPullDownRefresh(() => {
  fetchPromotionList(true)
})
</script>

<style>
.quantity-popup {
  width: 600rpx;
}
.popup-title {
  color: #333;
}
.product-name {
  color: #333;
  word-break: break-all;
}
.popup-content {
  padding: 16rpx 0;
}
.popup-footer {
  margin-top: 32rpx;
}
.popup-product-image {
  flex-shrink: 0;
  width: 160rpx;
  height: 160rpx;
  border-radius: 8rpx;
}
</style>
