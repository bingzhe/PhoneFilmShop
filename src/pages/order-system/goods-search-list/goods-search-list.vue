<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '商品列表',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="min-h-100vh bg-#f5f5f5">
    <wd-sticky :offset-top="0" :z-index="19">
      <view class="flex items-center bg-white w-750rpx">
        <view class="flex-1">
          <wd-search
            placeholder="输入搜索关键词"
            v-model="searchValue"
            cancel-txt="搜索"
            custom-class="important-pt10rpx important-pb10rpx w-650rpx"
            @search="handleSearch"
            @cancel="handleSearch"
          />
        </view>
        <view
          class="flex items-center justify-center w-80rpx h-80rpx ml-20rpx"
          @click="changeShowType"
        >
          <wd-icon :name="listType === 1 ? 'view-list' : 'app'" size="40rpx" />
        </view>
      </view>
      <view class="bg-white">
        <wd-tabs v-model="orderBy" auto-line-width>
          <wd-tab title="综合" name="comprehensive"></wd-tab>
          <wd-tab title="价格" name="priceUp"></wd-tab>
        </wd-tabs>
      </view>
    </wd-sticky>

    <view v-if="goods.length === 0 && !loading" class="h-600rpx flex items-center justify-center">
      <image class="w-300rpx h-300rpx" src="/static/images/empty.png"></image>
    </view>

    <!-- 列表样式1：一行一个商品 -->
    <block v-if="listType === 1">
      <view
        class="relative flex w-718rpx m-16rpx overflow-hidden bg-white rounded-16rpx"
        v-for="item in goods"
        :key="item.goods_id"
      >
        <!-- <navigator :url="item.goodsUrl"> -->
        <image class="flex-shrink-0 w-220rpx h-220rpx" mode="aspectFill" :src="item.pic"></image>
        <!-- </navigator> -->
        <view class="flex flex-col justify-between w-full p-16rpx pr-32rpx pl-24rpx">
          <view class="mb-10rpx text-30rpx text-#333 ellipsis-text">
            <!-- <navigator :url="item.goodsUrl">{{ item.goods_name }}</navigator> -->
            {{ item.goods_name }}
          </view>
          <view class="flex items-center justify-between">
            <view class="text-34rpx font-500 text-#ff3b30">
              ¥ {{ item.goods_price }}
              <text
                v-if="item.originalPrice && item.originalPrice > 0"
                class="ml-20rpx text-26rpx font-normal text-#aaa line-through"
              >
                ¥ {{ item.originalPrice }}
              </text>
            </view>
            <view class="flex items-center justify-end my-16rpx">
              <wd-icon
                class="w-50rpx h-50rpx"
                name="cart"
                color="#e64340"
                size="48rpx"
                :data-id="item.goods_id"
                @click="addShopCar(item)"
              />
            </view>
          </view>
        </view>
      </view>
    </block>

    <!-- 列表样式2：一行两个商品 -->
    <view v-if="listType === 2" class="box-border flex flex-wrap justify-between w-full p-16rpx">
      <view
        class="relative w-345rpx mb-16rpx overflow-hidden bg-white rounded-16rpx"
        v-for="item in goods"
        :key="item.goods_id"
      >
        <!-- <navigator :url="item.goodsUrl"> -->
        <image class="w-345rpx h-345rpx" mode="aspectFill" :src="item.pic"></image>
        <!-- </navigator> -->
        <view class="box-border w-345rpx p-16rpx">
          <view class="h-70rpx text-28rpx text-#333 ellipsis-text">
            <!-- <navigator :url="item.goodsUrl">{{ item.goods_name }}</navigator> -->
            {{ item.goods_name }}
          </view>
          <view class="flex items-center justify-between">
            <view class="mt-10rpx text-32rpx font-500 text-#ff3b30">
              ¥ {{ item.goods_price }}
              <text
                v-if="item.originalPrice && item.originalPrice > 0"
                class="ml-20rpx text-26rpx font-normal text-#aaa line-through"
              >
                ¥ {{ item.originalPrice }}
              </text>
            </view>
            <view class="flex items-center justify-end">
              <wd-icon
                class="w-50rpx h-50rpx"
                name="cart"
                color="#e64340"
                size="48rpx"
                :data-id="item.goods_id"
                @click="addShopCar(item)"
              />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 数量选择弹窗 -->
    <wd-popup
      v-model="showQuantityPopup"
      custom-style="border-radius:16rpx;padding:32rpx;"
      custom-class="!top-30vh"
      :z-index="29"
    >
      <view class="w-600rpx">
        <view class="text-center text-18px font-bold mb-32rpx text-#333">选择数量</view>

        <view class="py-16rpx mb-32rpx">
          <view class="flex mb-16rpx">
            <image
              :src="currentProduct?.pic"
              mode="aspectFill"
              class="flex-shrink-0 w-160rpx h-160rpx rounded-8rpx mr-16rpx"
            />
            <view class="text-16px flex-1 w-350rpx text-#333 break-all ellipsis-text">
              {{ currentProduct?.goods_name || '' }}
            </view>
          </view>
          <view class="flex justify-between items-center">
            <text class="text-14px">数量：</text>
            <wd-input-number v-model="selectedQuantity" :min="1"></wd-input-number>
          </view>
        </view>

        <view class="flex justify-between mt-32rpx">
          <wd-button type="info" class="flex-1 mr-16rpx" @click="closeQuantityPopup">
            取消
          </wd-button>
          <wd-button type="primary" class="flex-1" @click="confirmAddToCart">加入购物车</wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import { httpGet, httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { getOrderToken } from '@/utils/orderToken'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const toast = useToast()

// 页面基础数据
const listType = ref(2) // 1为1个商品一行，2为2个商品一行
const searchValue = ref('') // 搜索关键词
const orderBy = ref('comprehensive') // 排序规则
const page = ref(1) // 读取第几页
const goods = ref<any[]>([])
const loading = ref(false)
const total = ref(0)

// 从路由获取参数

onLoad((options: any) => {
  if (options.name) {
    searchValue.value = options.name
  }
  console.log('onLoad')
  search()
})

// 数量选择弹窗相关状态
const showQuantityPopup = ref(false)
const selectedQuantity = ref(1)
const currentProduct = ref<any>(null)

// 搜索商品
const search = async () => {
  toast.loading('加载中...')
  loading.value = true

  const params: any = {
    order: 1,
    by: 1,
    page: page.value,
    size: 20,
  }

  if (orderBy.value === 'comprehensive') {
    params.order = 1
    // params.by = 0
  } else if (orderBy.value === 'priceUp') {
    params.order = 2
  } else {
    params.order = 0
  }

  if (searchValue.value) {
    params.name = searchValue.value
  }

  try {
    const result = await httpGet('/api/Ordergoods/getGoodsList', params)
    const data = result.data as { count: number; list: any[] }

    if (goods.value.length === data.count && page.value !== 1) {
      toast.warning('没有更多了')
      loading.value = false
      return
    }

    const goodsList = data.list.map((item: any) => {
      return {
        ...item,
        goodsUrl: `/pages/order-system/goods-detail/goods-detail?id=${item.goods_id}`,
        pic: `${baseUrl}${item.goods_img}`,
      }
    })

    if (page.value === 1) {
      goods.value = goodsList
    } else {
      goods.value = goods.value.concat(goodsList)
    }

    total.value = data.count
  } catch (error) {
    console.error('获取商品列表失败', error)
    toast.error('获取商品列表失败')
  } finally {
    toast.close()
    loading.value = false
  }
}

// 搜索输入框变化
// const handleSearchChange = (e: any) => {
//   searchValue.value = e.value
// }

// 搜索提交
const handleSearch = () => {
  page.value = 1
  search()
}

// 搜索输入框确认
const bindconfirm = (e: any) => {
  page.value = 1
  search()
}

// 切换列表样式
const changeShowType = () => {
  listType.value = listType.value === 1 ? 2 : 1
}

// 添加监听orderBy变化的函数
watch(orderBy, (newVal) => {
  page.value = 1
  search()
})

// 滚动到底部加载更多
onReachBottom(() => {
  if (goods.value.length >= total.value && page.value !== 1) {
    return
  }
  page.value = page.value + 1
  search()
})

// 添加到购物车
const addShopCar = (item: any) => {
  currentProduct.value = item
  selectedQuantity.value = 1
  showQuantityPopup.value = true
}

// 关闭数量选择弹窗
const closeQuantityPopup = () => {
  showQuantityPopup.value = false
}

// 确认添加到购物车
const confirmAddToCart = () => {
  if (!currentProduct.value) return

  if (selectedQuantity.value <= 0) {
    toast.warning('请添加数量')
    return
  }

  const cartList = [
    {
      goods_id: currentProduct.value.goods_id,
      goods_num: selectedQuantity.value,
    },
  ]

  httpPost('/api/Order/CreateCartBatch', {
    token: getOrderToken(),
    cart_list: JSON.stringify(cartList),
  })
    .then((res) => {
      uni.showToast({
        title: '已添加到购物车',
        icon: 'success',
      })
      showQuantityPopup.value = false
    })
    .catch((err) => {
      toast.error('添加失败，请重试')
      console.error(err)
    })
}
</script>

<style>
.ellipsis-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

:deep(.wd-tabs) {
  --wd-tabs-nav-background: #fff;
  --wd-tabs-nav-color: #333;
  --wd-tabs-nav-active-color: #fa4126;
  --wd-tabs-line-color: #fa4126;
}
</style>
