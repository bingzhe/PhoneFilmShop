<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  style: {
    navigationBarTitleText: '分类',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>
<template>
  <!-- :style="{ marginTop: safeAreaInsets?.top + 'px' }" -->
  <view class="bg-white">
    <wd-sticky :offset-top="0" :z-index="99">
      <wd-search
        placeholder="请输入手机型号"
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

    <OrderTabbar />
  </view>
</template>

<script lang="ts" setup>
import { httpGet, httpPost } from '@/utils/http'
import CateMenu from './components/cate-menu.vue'
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
const firstCates = ref<any[]>([])
const firstCateId = ref(null)

const secondCates = ref<any[]>([])
const secondCateId = ref(null)

const searchValue = ref('')

const showSearchPanel = ref(false)
const searchNameList = ref<any[]>([])

const searchType = ref(1) // 1 输入框查询 2 本机查询

const list = ref<any[]>([])
const page = ref(1)
const total = ref(0)
const loading = ref(false)

// 输入框查找
const handleSearch = () => {
  searchType.value = 1
  getGoodsList(true)
}

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
    // eslint-disable-next-line eqeqeq
    if (firstCateId.value !== 1) {
      params.pid = firstCateId.value
    }
  }

  if (searchType.value === 1 && searchValue.value) {
    params.name = searchValue.value
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
onLoad(async () => {
  getFirstCateList()

  // uni.setNavigationBarTitle({
  //   title: projectName.value,
  // })
})

onReachBottom(() => {
  if (list.value.length >= total.value && page.value !== 1) {
    return
  }
  page.value = page.value + 1
  getGoodsList()
})

// const onShareAppMessage = () => ({})
// const onShareTimeline = () => ({})

const onAddToCart = (product) => {
  console.log(product)
  httpPost<any[]>('/api/Order/CreateCart', {
    token_order: getOrderToken(),
    goods_id: product.goods_id,
    goods_num: 1,
  }).then((res) => {
    console.log(res)
  })

  uni.showToast({
    title: '已添加到购物车',
    icon: 'success',
  })
}
</script>

<script lang="ts">
// export default {
//   onShareAppMessage,
//   onShareTimeline,
// }
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
