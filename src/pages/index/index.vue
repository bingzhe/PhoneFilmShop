<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '',
  },
}
</route>
<template>
  <!-- :style="{ marginTop: safeAreaInsets?.top + 'px' }" -->
  <view class="bg-white">
    <wd-notice-bar
      v-if="noticeTextList.length > 0"
      :text="noticeTextList"
      prefix="sound"
      custom-class="important-b-rd-0"
    />

    <wd-swiper
      v-if="swiperList.length > 0"
      :list="swiperList"
      autoplay
      :current="0"
      height="400rpx"
    ></wd-swiper>

    <view v-if="phoneModal" class="flex justify-between items-center p-10rpx pb-10rpx bg-#fff">
      <view class="flex items-center color-#2051d1">
        <!-- <text
          class="text-12px bg-#5ac3f3 color-#fff pl-10rpx pr-10rpx pt-5rpx pb-5rpx b-rd-6rpx mr-10rpx"
        >
          Native
        </text> -->
        <text class="text-16px font-bold ml-18rpx">{{ phoneModal }}</text>
      </view>
      <view class="flex">
        <wd-button
          @click="handleSearchNative"
          custom-class="important-bg-#5ac3f3 important-h-60rpx important-line-height-60rpx"
          icon="search"
        >
          <!-- Search -->
        </wd-button>
      </view>
    </view>

    <wd-sticky :offset-top="-44" :z-index="99">
      <wd-search
        placeholder="Please enter phone model"
        v-model="searchValue"
        cancel-txt="Search"
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

    <view v-show="!showSearchPanel" class="flex min-h-100vh">
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
          <image class="w-300rpx h-300rpx" src="/static/images/empty.png"></image>
        </view>
      </view>
    </view>

    <NewGoodsPopup
      :productBg="productBg"
      :productContent="productContent"
      :productionShow="productionShow"
      @close="closeNewGoodsPopup"
    />
  </view>
</template>

<script lang="ts" setup>
import PLATFORM from '@/utils/platform'
import { httpPost } from '@/utils/http'
import CateMenu from './components/cate-menu.vue'
import SliderMenu from './components/slider-menu.vue'
import ProductItem from './components/product-item.vue'
import NewGoodsPopup from './components/new-goods-popup.vue'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store/user'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
const toast = useToast()

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getWindowInfo()

const projectName = ref('')

defineOptions({
  name: 'Home',
})

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

const noticeTextList = ref<string[]>([])
const swiperList = ref<string[]>([])

const phoneModal = ref('')

const toggleCate = ref(false)
const firstCates = ref<any[]>([])
const firstCateId = ref(null)

const secondCates = ref<any[]>([])
const secondCateId = ref(null)

const searchValue = ref('')

const showSearchPanel = ref(false)
const searchNameList = ref<any[]>([])

const searchType = ref(2) // 1 输入框查询 2 本机查询

const list = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)

const productBg = ref('') // 新款更新背景图
const productContent = ref('') // 新款更新内容
const productionShow = ref(false) // 新款更新显示

// 获取通告列表
const getNoticeList = async () => {
  httpPost<any[]>('/api/Index/getAnnouncement', {
    token: userInfo.value.token,
  }).then((res) => {
    const list = res.data || []

    noticeTextList.value = list.map((item) => {
      return item.content
    })
  })
}

// 获取轮播图列表
const getSwiperList = async () => {
  httpPost<any[]>('/api/Index/getBanner', {
    token: userInfo.value.token,
  }).then((res) => {
    const list = res.data || []

    swiperList.value = list.map((item) => {
      return `${baseUrl}${item.img_url}`
    })
  })
}

// 获取项目名称
const getProjectName = async () => {
  httpPost<any>('/api/Index/getName', {
    token: userInfo.value.token,
  }).then((res) => {
    projectName.value = res.data as string

    uni.setNavigationBarTitle({
      title: projectName.value,
    })
  })
}

// 获取新商品
const getNewProduct = async () => {
  httpPost<any>('/api/Index/getNewProduct', {
    token: userInfo.value.token,
  }).then((res) => {
    const data = res.data

    productionShow.value = true

    if (!data) {
      return
    }

    productBg.value = data.bg_img
    productContent.value = data.content
  })
}

// 查找本机
const handleSearchNative = () => {
  searchType.value = 2
  getGoodsList(true)
}

// 输入框查找
const handleSearch = () => {
  searchType.value = 1
  getGoodsList(true)
}

const getFirstCateList = async () => {
  httpPost<any[]>('/api/Goods/getCateList1', {
    pid: 0,
    level: 1,
    token: userInfo.value.token,
  }).then((res) => {
    firstCates.value = res.data || []

    if (firstCates.value.length > 0) {
      firstCateId.value = firstCates.value[0].cate_id
      getSecondCateList(firstCateId.value)
    }
  })
}

const getSecondCateList = async (cate) => {
  httpPost<any[]>('/api/Goods/getCateList1', {
    pid: cate,
    level: 2,
    token: userInfo.value.token,
  }).then((res) => {
    secondCates.value = res.data || []

    // if (secondCates.value.length > 0) {
    //   secondCateId.value = secondCates.value[0].cate_id
    // }
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

  httpPost<any[]>('/api/Goods/getNameList', {
    name: value,
    token: userInfo.value.token,
  }).then((res) => {
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
    token: userInfo.value.token,
  }

  if (secondCateId.value) {
    params.cate_id = secondCateId.value
  } else if (firstCateId.value) {
    // 1是一级菜单的全部分类
    if (firstCateId.value !== 1) {
      params.pid = firstCateId.value
    }
  }

  if (searchType.value === 1 && searchValue.value) {
    params.name = searchValue.value
  }

  if (searchType.value === 2 && phoneModal.value) {
    params.name = phoneModal.value
  }

  toast.loading('Loading...')
  loading.value = true
  httpPost<any[]>('/api/Goods/getGoodsList5', params)
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

const getDeviceInfo = async () => {
  const deviceInfo = uni.getDeviceInfo()

  console.log('deviceInfo', deviceInfo)

  let model = deviceInfo.deviceModel
  const system = deviceInfo.system

  // 单独处理 iPhone XS Max China-exclusive<iPhone11,6>
  model = model.replace(/China-exclusive/gm, '')

  // 如果是ios,单独处理下里面的尖括号
  const ios = !!(system.toLowerCase().search('ios') + 1)
  if (ios) {
    model = model.replace(/\((\S*?)\)<(\S*?)>/gm, '')
    model = model.replace(/<(\S*?)>/gm, '')
  }

  const params = {
    name: model,
    token: userInfo.value.token,
  }

  httpPost('/api/Index/getPhoneName', params).then((res) => {
    const localModel = res.data ? res.data : model

    phoneModal.value = localModel as string
  })
}

const closeNewGoodsPopup = () => {
  productionShow.value = false
}

// 测试 uni API 自动引入
onLoad(async () => {
  await getDeviceInfo()
  getProjectName()
  getNoticeList()
  getSwiperList()
  getFirstCateList()
  getNewProduct()
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

:deep(.wd-sidebar__padding) {
  width: 180rpx !important;
}

:deep(.wd-sidebar) {
  width: 180rpx !important;
}
</style>
