<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  style: {
    navigationBarTitleText: '分类',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>
<template>
  <!-- :style="{ marginTop: safeAreaInsets?.top + 'px' }" -->
  <view class="category-page bg-white">
    <wd-sticky :offset-top="0" :z-index="19">
      <view class="category-header">
        <wd-search
          placeholder="请输入要查询内容"
          v-model="searchValue"
          cancel-txt="搜索"
          custom-class="important-pt10rpx important-pb10rpx w-700rpx"
          @search="handleSearch"
          @cancel="handleSearch"
          @change="handleSearchChange"
        />

        <scroll-view
          v-if="topCates.length > 0"
          scroll-x
          class="top-category-scroll"
          :show-scrollbar="false"
        >
          <view class="top-category-inner">
            <view
              v-for="(item, index) in topCates"
              :key="index"
              class="top-category-item"
              :class="{ active: item.category_id == topCateId }"
              @click="onTopCateClick(item.category_id)"
            >
              {{ item.cate_name }}
            </view>
          </view>
        </scroll-view>
      </view>
    </wd-sticky>

    <view class="category-body">
      <view class="category-left-container">
        <SliderMenu
          :menus="secondCates"
          :toggleCate="toggleCate"
          @slider-menu-item-click="onSliderClick"
        />
      </view>

      <view class="category-right-container">
        <view class="category-filter-stack">
          <CateMenu
            :menus="thirdCates"
            :activeId="thirdCateId"
            :sticky="false"
            @menu-item-click="onMenuClick"
          />

          <FourthCateMenu
            :menus="fourthCates"
            :activeId="fourthCateId"
            @menu-item-click="onFourthMenuClick"
          />
        </view>

        <view class="category-products">
          <ProductItem
            v-for="(product, index) in list"
            :key="index"
            :product="product"
            @toggle-expand="onToggleExpand(product)"
            @add-to-cart="onAddToCart(product)"
          />

          <view
            v-if="list.length === 0 && !loading"
            class="h-600rpx flex items-center justify-center"
          >
            <image class="w-300rpx h-300rpx" src="/static/images/empty.png"></image>
          </view>
        </view>
      </view>
    </view>

    <!-- <OrderTabbar /> -->

    <!-- 浮动电话图标 -->
    <!-- <view class="floating-phone" @click="makePhoneCall">
      <view class="i-ri:phone-fill phone-icon"></view>
    </view> -->

    <!-- 添加数量选择弹窗 -->
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
import { httpGet, httpPost } from '@/utils/http'
import CateMenu from './components/cate-menu.vue'
import FourthCateMenu from './components/fourth-cate-menu.vue'
import SliderMenu from './components/slider-menu.vue'
import ProductItem from './components/product-item.vue'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import OrderTabbar from '../components/order-tabbar.vue'
import { getOrderToken } from '@/utils/orderToken'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getWindowInfo()

const { projectName, setProjectName } = useProjectName()

defineOptions({
  name: 'Category',
})

const toggleCate = ref(false)
const topCates = ref<any[]>([])
const topCateId = ref<string | number | null>(null)

const secondCates = ref<any[]>([])
const secondCateId = ref<string | number | null>(null)

const thirdCates = ref<any[]>([])
const thirdCateId = ref<string | number | null>(null)

const fourthCates = ref<any[]>([])
const fourthCateId = ref<string | number | null>(null)

const searchValue = ref('')

const showSearchPanel = ref(false)
const searchNameList = ref<any[]>([])

const searchType = ref(1) // 1 输入框查询 2 本机查询

const list = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)

const userLevel = ref(1)

// 输入框查找
const handleSearch = () => {
  if (searchValue.value) {
    uni.navigateTo({
      url: `/pages/order-system/goods-search-list/goods-search-list?name=${searchValue.value}`,
    })
  } else {
    uni.navigateTo({
      url: '/pages/order-system/goods-search-list/goods-search-list',
    })
  }
}

const hasCateId = (id: string | number | null | undefined) => {
  return id !== null && id !== undefined && id !== ''
}

const getActiveCategoryId = () => {
  if (hasCateId(fourthCateId.value)) {
    return fourthCateId.value
  }
  if (hasCateId(thirdCateId.value)) {
    return thirdCateId.value
  }
  if (hasCateId(secondCateId.value)) {
    return secondCateId.value
  }
  return topCateId.value
}

const getTopCateList = async () => {
  const res = await httpGet<any[]>('/api/Ordergoods/getCateList', {})
  topCates.value = res.data || []

  if (topCates.value.length > 0) {
    topCateId.value = topCates.value[0].category_id
    await getSecondCateList(topCateId.value)
  } else {
    getGoodsList(true)
  }
}

const getSecondCateList = async (cate) => {
  secondCates.value = []
  secondCateId.value = null
  thirdCates.value = []
  thirdCateId.value = null
  fourthCates.value = []
  fourthCateId.value = null

  const res = await httpGet<any[]>('/api/Ordergoods/getCateList', { category_id: cate })
  secondCates.value = res.data || []

  if (secondCates.value.length > 0) {
    secondCateId.value = secondCates.value[0].category_id
    await getThirdCateList(secondCateId.value)
  } else {
    getGoodsList(true)
  }
}

const getThirdCateList = async (cate) => {
  thirdCates.value = []
  thirdCateId.value = null
  fourthCates.value = []
  fourthCateId.value = null

  const res = await httpGet<any[]>('/api/Ordergoods/getCateList', { category_id: cate })
  thirdCates.value = res.data || []

  if (thirdCates.value.length > 0) {
    thirdCateId.value = thirdCates.value[0].category_id
    await getFourthCateList(thirdCateId.value)
  } else {
    getGoodsList(true)
  }
}

const getFourthCateList = async (cate) => {
  fourthCates.value = []
  fourthCateId.value = null

  const res = await httpGet<any[]>('/api/Ordergoods/getCateList', { category_id: cate })
  fourthCates.value = res.data || []

  if (fourthCates.value.length > 0) {
    fourthCateId.value = fourthCates.value[0].category_id
  }

  getGoodsList(true)
}

const onTopCateClick = (id) => {
  if (topCateId.value === id) {
    return
  }
  topCateId.value = id
  getSecondCateList(id)
}

const onMenuClick = (id) => {
  if (thirdCateId.value === id) {
    return
  }
  thirdCateId.value = id
  getFourthCateList(id)
}

const onSliderClick = (id) => {
  if (secondCateId.value === id) {
    return
  }
  secondCateId.value = id
  thirdCateId.value = null
  fourthCates.value = []
  fourthCateId.value = null
  // toggleCate.value = !toggleCate.value
  getThirdCateList(id)
}

const onFourthMenuClick = (id) => {
  if (fourthCateId.value === id) {
    return
  }
  fourthCateId.value = id
  getGoodsList(true)
}

const handleSearchChange = async ({ value }) => {
  // if (value) {
  //   showSearchPanel.value = true
  // } else {
  //   showSearchPanel.value = false
  // }
  // const getInf = (str, key) => str.replace(new RegExp(`${key}`, 'gi'), `%%$&%%`).split('%%')
  // httpGet<any[]>('/api/Goods/getNameList', { name: value }).then((res) => {
  //   const nameList = res.data.map((item) => {
  //     return getInf(item, value)
  //   })
  //   searchNameList.value = nameList
  // })
}

const onToggleExpand = (product) => {
  product.expand = !product.expand
}

const getGoodsList = async (init?: boolean) => {
  // console.log('userLevel', userLevel.value)
  if (init) {
    page.value = 1
    list.value = []
  }

  const params: { [key: string]: any } = {
    order: 1,
    by: 1,
    page: page.value,
    size: 50,
  }

  const categoryId = getActiveCategoryId()
  if (hasCateId(categoryId)) {
    params.category_id = categoryId
  }
  // else if (firstCateId.value) {
  //   // 1是一级菜单的全部分类
  //   // eslint-disable-next-line eqeqeq
  //   if (firstCateId.value !== 1) {
  //     params.pid = firstCateId.value
  //   }
  // }

  // if (searchType.value === 1 && searchValue.value) {
  //   params.name = searchValue.value
  // }

  toast.loading('加载中...')
  loading.value = true
  httpGet<any[]>('/api/Ordergoods/getGoodsList', params)
    .then((res) => {
      const data: any = res.data || {}
      const _list = data.list || []

      _list.forEach((item) => {
        item.goods_img_full = `${baseUrl}${item.goods_img}?w=100&h=100`
        // item.selectList = item.spec_list.filter((spec) => spec.is_checked === 1)
        // item.spec_list = item.spec_list.filter((spec) => spec.is_checked !== 1)
        // item.expand = false
        // eslint-disable-next-line eqeqeq
        // if (userLevel.value == 2) {
        //   item.goods_price = item.vip_price
        // }
      })

      total.value = data.count
      list.value = list.value.concat(_list)
    })
    .finally(() => {
      toast.close()
      loading.value = false
    })
}

// 测试 uni API 自动引入
onLoad(async () => {
  // await getUserInfo()
  getTopCateList()

  // uni.setNavigationBarTitle({
  //   title: projectName.value,
  // })
})

onReachBottom(() => {
  if (loading.value || list.value.length >= total.value) {
    return
  }
  page.value = page.value + 1
  getGoodsList()
})

// const onShareAppMessage = () => ({})
// const onShareTimeline = () => ({})

// 数量选择弹窗相关状态
const showQuantityPopup = ref(false)
const selectedQuantity = ref(1)
const currentProduct = ref<any>(null)

// 打开数量选择弹窗
const onAddToCart = (product) => {
  currentProduct.value = product
  selectedQuantity.value = 1 // 重置数量为1
  showQuantityPopup.value = true
}

// 关闭数量选择弹窗
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
// 确认添加到购物车
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
    .then((res) => {
      console.log(res)
      uni.showToast({
        title: '已添加到购物车',
        icon: 'success',
      })
      showQuantityPopup.value = false // 关闭弹窗
    })
    .catch((err) => {
      toast.error('添加失败，请重试')
      console.error(err)
    })
}

const handleQuantityChange = (value) => {
  console.log(value)
}

// 添加浮动电话图标功能
const makePhoneCall = () => {
  // 实现拨打电话的逻辑
  uni.makePhoneCall({
    phoneNumber: '15206354555',
    success: () => {
      console.log('拨打电话成功')
    },
    fail: (err) => {
      console.error('拨打电话失败', err)
    },
  })
}
</script>

<script lang="ts">
// export default {
//   onShareAppMessage,
//   onShareTimeline,
// }
</script>

<style lang="scss">
:root,
page {
  --wot-search-cancel-color: #5ac3f3;
  --wd-sidebar-active-color: #5ac3f3;
}

.category-page {
  min-height: 100vh;
  background-color: #ffffff;
}

.category-header {
  width: 750rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #eeeeee;
}

.top-category-scroll {
  width: 750rpx;
  height: 84rpx;
  background-color: #ffffff;
}

.top-category-inner {
  display: flex;
  height: 84rpx;
  white-space: nowrap;
}

.top-category-item {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  color: #333333;

  &.active {
    font-weight: 700;
    color: #23b7eb;
  }

  &.active::after {
    position: absolute;
    bottom: 10rpx;
    left: 50%;
    width: 36rpx;
    height: 6rpx;
    content: '';
    background-color: #23b7eb;
    border-radius: 4rpx;
    transform: translateX(-50%);
  }
}

.category-body {
  display: flex;
  min-height: calc(100vh - 168rpx);
  background-color: #ffffff;
}

.category-right-container {
  position: relative;
  flex: 1;
  width: 570rpx;
  min-width: 0;
  background-color: #ffffff;
}

.category-filter-stack {
  position: sticky;
  top: 168rpx;
  z-index: 18;
  background-color: #ffffff;
}

.category-products {
  min-height: 600rpx;
}

.main-title-color {
  color: #d14328;
}

:deep(.wd-swiper__track) {
  border-radius: 0 !important;
}

:deep(.wd-sidebar__padding) {
  width: 180rpx !important;
}
:deep(.wd-sidebar) {
  width: 180rpx !important;
}
/* 数量选择弹窗样式 */
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

.category-left-container {
  position: sticky;
  top: 168rpx;
  left: 0;
  z-index: 10;
  width: 180rpx;
  height: calc(100vh - 168rpx);
  overflow-y: auto;
  background-color: #f8f8f8;
  border-right: 1rpx solid #eeeeee;
}
/* 浮动电话图标样式 */
.floating-phone {
  position: fixed;
  right: 30rpx;
  bottom: 200rpx;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100rpx;
  height: 100rpx;
  background-color: #23b7eb;
  border-radius: 50%;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.phone-icon {
  font-size: 50rpx;
  color: #fff;
}
</style>
