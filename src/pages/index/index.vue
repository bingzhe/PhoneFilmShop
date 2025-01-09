<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '科迪亚',
  },
}
</route>
<template>
  <view class="bg-white" :style="{ marginTop: safeAreaInsets?.top + 'px' }">
    <wd-notice-bar
      v-if="noticeTextList.length > 0"
      :text="noticeTextList"
      prefix="sound"
      custom-class="important-b-rd-0"
    />

    <wd-swiper
      v-if="noticeTextList.length > 0"
      :list="swiperList"
      autoplay
      :current="0"
      height="120"
    ></wd-swiper>

    <view v-if="phoneModal" class="flex justify-between items-center p-10rpx pb-10rpx bg-#fff">
      <view class="flex items-center color-#2051d1">
        <text
          class="text-12px bg-#5ac3f3 color-#fff pl-10rpx pr-10rpx pt-5rpx pb-5rpx b-rd-6rpx mr-10rpx"
        >
          本机
        </text>
        <text class="text-12px font-bold">{{ phoneModal }}</text>
      </view>
      <view class="flex">
        <wd-button
          @click="handleSearchNative"
          custom-class="important-bg-#5ac3f3 important-h-60rpx important-line-height-60rpx"
        >
          本机查找
        </wd-button>
      </view>
    </view>

    <wd-sticky :offset-top="0" :z-index="99">
      <wd-search
        placeholder="请输入手机号"
        v-model="searchValue"
        cancel-txt="搜索"
        custom-class="important-pt10rpx important-pb10rpx w-700rpx"
        @search="handleSearch"
        @cancel="handleSearch"
        @change="handleSearchChange"
      />

      <CateMenu
        v-show="!showSearchPanel"
        :menus="firstCates"
        :firstCateId="firstCateId"
        @menu-item-click="onMenuClick"
      />
    </wd-sticky>

    <view v-show="showSearchPanel" class="ml-30rpx mr-30rpx">
      <view
        v-for="(name, index) in searchNameList"
        :key="index"
        class="text-14px line-height-60rpx b-b-1px b-b-solid b-b-#ccc"
        @click="handleSearchNameItemClick(name)"
      >
        <text
          v-for="(item, j) in name"
          :key="j"
          :class="item.toLowerCase() === searchValue.toLowerCase() ? 'color-red' : ''"
        >
          {{ item }}
        </text>
      </view>
    </view>

    <view v-show="!showSearchPanel" class="flex h100vh">
      <SliderMenu
        :menus="secondCates"
        :toggleCate="toggleCate"
        @slider-menu-item-click="onSliderClick"
      />
      <view class="flex-1">
        <ProductItem
          v-for="(product, index) in list"
          :key="index"
          :product="product"
          @toggle-expand="onToggleExpand(product)"
        />

        <view
          v-if="list.length === 0 && !loading"
          class="h-600rpx flex items-center justify-center"
        >
          <image
            class="important-w-[300rpx] important-h-[300rpx];"
            style="height: 300rpx"
            src="/static/images/empty.png"
          ></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import PLATFORM from '@/utils/platform'
import { httpGet } from '@/utils/http'
import CateMenu from './components/cate-menu.vue'
import SliderMenu from './components/slider-menu.vue'
import ProductItem from './components/product-item.vue'
import { useToast } from 'wot-design-uni'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const toast = useToast()

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

defineOptions({
  name: 'Home',
})

const noticeTextList = ref<string[]>([])
const swiperList = ref<string[]>([])

const phoneModal = ref('')

const toggleCate = ref(false)
const firstCates = ref<any[]>([])
const firstCateId = ref('')

const secondCates = ref<any[]>([])
const secondCateId = ref('')

const searchValue = ref('')

const showSearchPanel = ref(false)
const searchNameList = ref<any[]>([])

const searchType = ref(1) // 1 输入框查询 2 本机查询

const list = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)

// 获取通告列表
const getNoticeList = async () => {
  httpGet<any[]>('/api/Index/getAnnouncement').then((res) => {
    const list = res.data || []

    noticeTextList.value = list.map((item) => {
      return item.content
    })
  })
}

// 获取轮播图列表
const getSwiperList = async () => {
  httpGet<any[]>('/api/Index/getBanner').then((res) => {
    const list = res.data || []

    swiperList.value = list.map((item) => {
      return `${baseUrl}${item.img_url}`
    })
  })
}

// 查找本机
const handleSearchNative = () => {}

// 输入框查找
const handleSearch = () => {}

const getFirstCateList = async () => {
  httpGet<any[]>('/api/Goods/getCateList1', { pid: 0, level: 1 }).then((res) => {
    firstCates.value = res.data || []

    if (firstCates.value.length > 0) {
      firstCateId.value = firstCates.value[0].cate_id
      getSecondCateList(firstCateId.value)
    }
  })
}

const getSecondCateList = async (cate) => {
  httpGet<any[]>('/api/Goods/getCateList1', { pid: cate, level: 2 }).then((res) => {
    secondCates.value = res.data || []

    if (secondCates.value.length > 0) {
      secondCateId.value = secondCates.value[0].cate_id
    }
    getGoodsList(true)
  })
}

const onMenuClick = (id) => {
  firstCateId.value = id
  secondCateId.value = ''
  toggleCate.value = !toggleCate.value
  getSecondCateList(firstCateId.value)
}

const onSliderClick = (id) => {
  secondCateId.value = id
  getGoodsList(true)
}

const handleSearchChange = async ({ value }) => {
  if (value) {
    showSearchPanel.value = true
  } else {
    showSearchPanel.value = false
  }

  const getInf = (str, key) => str.replace(new RegExp(`${key}`, 'gi'), `%%$&%%`).split('%%')

  httpGet<any[]>('/api/Goods/getNameList', { name: value }).then((res) => {
    const nameList = res.data.map((item) => {
      return getInf(item, value)
    })

    searchNameList.value = nameList
  })
}

const handleSearchNameItemClick = (nameArr) => {
  const name = nameArr.join('')

  searchValue.value = name
  showSearchPanel.value = false

  searchType.value = 1

  getGoodsList(true)
}

const onToggleExpand = (product) => {
  product.expand = !product.expand
}

const getGoodsList = async (init?: boolean) => {
  if (init) {
    page.value = 1
    list.value = []
  }

  const params: { [key: string]: any } = {
    page: page.value,
    size: 50,
  }

  if (secondCateId.value) {
    params.cate_id = secondCateId.value
  } else if (firstCateId.value) {
    // 1是一级菜单的全部分类
    if (firstCateId.value !== '1') {
      params.pid = firstCateId.value
    }
  }

  if (searchType.value === 1 && searchValue.value) {
    params.name = searchValue.value
  }

  if (searchType.value === 2 && phoneModal.value) {
    params.name = phoneModal.value
  }

  toast.loading('加载中...')
  loading.value = true
  httpGet<any[]>('/api/Goods/getGoodsList5', params)
    .then((res) => {
      const data: any = res.data || {}
      const _list = data.list || []

      _list.forEach((item) => {
        item.selectList = item.spec_list.filter((spec) => spec.is_checked === 1)
        item.spec_list = item.spec_list.filter((spec) => spec.is_checked !== 1)
        item.expand = false
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
onLoad(() => {
  getNoticeList()
  getSwiperList()
  getFirstCateList()
})

onReachBottom(() => {
  if (list.value.length >= total.value && page.value !== 1) {
    return
  }
  page.value = page.value + 1
  getGoodsList()
})
</script>

<style>
:root,
page {
  --wot-search-cancel-color: #5ac3f3;
  --wd-sidebar-active-color: #5ac3f3;
}

.main-title-color {
  color: #d14328;
}

:deep(.wd-swiper__track) {
  border-radius: 0 !important;
}
</style>
