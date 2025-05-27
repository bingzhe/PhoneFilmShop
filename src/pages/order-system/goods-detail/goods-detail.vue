<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '商品详情',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="bg-#f2f2f2 min-h-100vh pb-100rpx">
    <wd-sticky :offset-top="0" :z-index="19" v-if="createTabs">
      <view class="w-full bg-white">
        <wd-tabs v-model="active" sticky @change="onTabsChange">
          <wd-tab
            v-for="(item, index) in tabs"
            :key="index"
            :title="item.tabs_name"
            :name="item.tabs_name"
          ></wd-tab>
        </wd-tabs>
      </view>
    </wd-sticky>

    <scroll-view
      class="scroll-container h-100vh box-border pb-64rpx"
      :scroll-into-view="toView"
      scroll-y="true"
      scroll-with-animation="true"
      @scroll="bindscroll"
    >
      <!-- 商品轮播图 -->
      <view class="swiper-container w-full relative" id="swiper-container">
        <wd-swiper
          class="h-748rpx"
          height="748rpx"
          indicator-color="#fff"
          indicator-active-color="#23B7EB"
          :list="goodsDetail.pics"
        ></wd-swiper>
      </view>

      <!-- 商品信息 -->
      <view class="bg-white pt-35rpx w-full relative">
        <view class="flex justify-between">
          <view class="flex items-center">
            <view class="text-#e64340 text-20pt ml-30rpx">
              <text class="text-12pt">¥</text>
              {{ goodsDetail.goods_price }}
            </view>
          </view>
        </view>
        <view class="px-30rpx text-32rpx text-#000 mt-16rpx break-all">
          {{ goodsDetail.goods_name }}
        </view>
      </view>

      <!-- 购买数量 -->
      <view class="bg-white mt-20rpx p-30rpx">
        <view class="flex justify-between items-center">
          <text class="text-28rpx text-#333">购买数量</text>
          <wd-input-number v-model="buyNumber" :min="1"></wd-input-number>
        </view>
      </view>

      <!-- 商品详情 -->
      <view class="bg-white mt-20rpx w-full" id="goods-des-info">
        <view class="p-30rpx">
          <view class="border-l-3px border-l-solid border-l-#e64340 pl-10px text-28rpx text-#000">
            商品详情
          </view>
        </view>
        <view class="px-30rpx pb-30rpx text-32rpx">
          <rich-text :nodes="goodsDetail.goods_info"></rich-text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="fixed bottom-30rpx left-0 right-0 w-full z-10 box-border pl-20rpx pr-20rpx">
      <wd-button block size="large" type="primary" @click="directAddToCart">加入购物车</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { httpGet, httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'
import { getOrderToken } from '@/utils/orderToken'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const toast = useToast()

// 页面状态
const createTabs = ref(false)
const active = ref('商品简介')
const toView = ref('')
const tabsHeight = ref(0)

// 商品信息
const goodsDetail = ref<any>({})
const goodsId = ref('')

// 购买数量
const buyNumber = ref(1)

// 标签页配置
const tabs = ref([
  {
    tabs_name: '商品简介',
    view_id: 'swiper-container',
    topHeight: 0,
  },
  {
    tabs_name: '商品详情',
    view_id: 'goods-des-info',
    topHeight: 0,
  },
])

// 生命周期
onLoad((options: any) => {
  if (options && options.id) {
    goodsId.value = options.id
    getGoodsDetail(options.id)
  }
})

onShow(() => {
  createTabs.value = true

  // 计算tabs高度
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query
      .select('.wd-tabs')
      .boundingClientRect((rect) => {
        if (rect) {
          tabsHeight.value = rect.height
        }
      })
      .exec()
  })
})

onReady(() => {
  // 确保tabs组件已经渲染完成
  setTimeout(() => {
    getTopHeightFunction()
  }, 500)
})

// 监听页面滚动
const bindscroll = (e) => {
  // 计算页面各部分高度
  getTopHeightFunction()

  // 根据滚动位置更新当前标签
  const scrollTop = e.detail.scrollTop

  if (
    tabs.value[0].topHeight - tabsHeight.value <= scrollTop &&
    scrollTop < tabs.value[1].topHeight - tabsHeight.value
  ) {
    active.value = tabs.value[0].tabs_name
  } else if (scrollTop >= tabs.value[1].topHeight - tabsHeight.value) {
    active.value = tabs.value[1].tabs_name
  }
}

// 获取各部分高度
const getTopHeightFunction = () => {
  tabs.value.forEach((element, index) => {
    const viewId = `#${element.view_id}`
    getTopHeight(viewId, index)
  })
}

const getTopHeight = (viewId, index) => {
  const query = uni.createSelectorQuery()
  query
    .select(viewId)
    .boundingClientRect((rect) => {
      if (!rect) {
        return
      }
      const top = rect.top
      tabs.value[index].topHeight = top
    })
    .exec()
}

// 标签页切换
const onTabsChange = (e) => {
  active.value = e.name

  // 滚动到对应位置
  const targetTab = tabs.value.find((tab) => tab.tabs_name === e.name)
  if (targetTab) {
    toView.value = targetTab.view_id
  }
}

// 获取商品详情
const getGoodsDetail = async (id) => {
  toast.loading('加载中...')

  try {
    const result = await httpGet('/api/Ordergoods/getGoodsInfo', {
      goods_id: id,
      token: getOrderToken(),
    })

    const goodsInfo = result.data || ({} as any)

    // 处理图片和视频
    goodsInfo.pics = goodsInfo.img_list?.map((item) => `${baseUrl}${item}`)

    goodsDetail.value = goodsInfo
  } catch (error) {
    console.error(error)
    toast.error('获取商品信息失败')
  } finally {
    toast.close()
  }
}

// 直接添加到购物车
const directAddToCart = () => {
  if (buyNumber.value <= 0) {
    toast.warning('请选择购买数量')
    return
  }

  if (!goodsDetail.value) return

  const cartList = [
    {
      goods_id: goodsDetail.value.goods_id,
      goods_num: buyNumber.value,
    },
  ]

  toast.loading('添加中...')
  httpPost('/api/Order/CreateCartBatch', {
    token: getOrderToken(),
    cart_list: JSON.stringify(cartList),
  })
    .then((res) => {
      uni.showToast({
        title: '已添加到购物车',
        icon: 'success',
      })
    })
    .catch((err) => {
      toast.error('添加失败，请重试')
      console.error(err)
    })
    .finally(() => {
      toast.close()
    })
}
</script>

<style>
:root,
page {
  --wd-swiper-indicator-active-color: #23b7eb;
  --wd-goods-action-button-warning-color: #ff9500;
  --wd-tabs-nav-active-color: #23b7eb;
}

.scroll-container {
  box-sizing: border-box;
}

.quantity-popup {
  width: 600rpx;
}
</style>
