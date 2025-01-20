<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '教程',
  },
}
</route>
<template>
  <!-- <mescroll-body
    @init="mescrollInit"
    @down="downCallback"
    @up="upCallback"
    :up="{ empty: { icon: '/static/images/empty.png' } }"
  > -->
  <!-- <image src="/static/images/empty.png"></image> -->
  <!-- :style="{ marginTop: safeAreaInsets?.top + 'px' }" -->
  <view class="bg-white overflow-hidden pt-2 px-4">
    <view class="m-20rpx">
      <view v-for="(item, index) in videoList" :key="index" class="w-100% flex-shrink-0 mb-30rpx">
        <video class="w-100%" :src="item.fullUrl" :title="item.video_title"></video>
        <view class="text-28rpx font-bold text-center">
          {{ item.video_title }}
        </view>
      </view>
    </view>
  </view>

  <view class="h-80rpx"></view>
  <!-- </mescroll-body> -->
</template>

<script lang="ts" setup>
import { httpGet, httpPost } from '@/utils/http'

const baseUrl = import.meta.env.VITE_SERVER_BASEURL

defineOptions({
  name: 'VideoPage',
})

// 获取屏幕边界到安全区域距离
// const { safeAreaInsets } = uni.getSystemInfoSync()

// 数据列表
const videoList = ref<any[]>([])

// 调用mescroll的hook (注: mescroll-uni不用传onPageScroll,onReachBottom, 而mescroll-body必传)
// const { mescrollInit, downCallback, getMescroll } = useMescroll(onPageScroll, onReachBottom)

// 上拉加载的回调: 其中num:当前页 从1开始, size:每页数据条数,默认10
const getVideoList = () => {
  httpPost<any[]>('/api/Index/getVideo')
    .then((res) => {
      // res.data ||
      const curPageData = res.data || []

      curPageData.forEach((item) => {
        item.fullUrl = `${baseUrl}${item.video_url}`
      })

      videoList.value = curPageData

      // 当前页数据
      // if (mescroll.num === 1) videoList.value = [] // 第一页需手动制空列表

      // videoList.value = videoList.value.concat(curPageData) // 追加新数据
      // 联网成功的回调,隐藏下拉刷新和上拉加载的状态;
      // mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;

      // 方法一(推荐): 后台接口有返回列表的总页数 totalPage
      // mescroll.endByPage(curPageData.length, 1) // 必传参数(当前页的数据个数, 总页数)

      // 方法二(推荐): 后台接口有返回列表的总数据量 totalSize
      // mescroll.endBySize(curPageData.length, totalSize); //必传参数(当前页的数据个数, 总数据量)

      // 方法三(推荐): 您有其他方式知道是否有下一页 hasNext
      // mescroll.endSuccess(curPageData.length, hasNext); //必传参数(当前页的数据个数, 是否有下一页true/false)

      // 方法四 (不推荐),会存在一个小问题:比如列表共有20条数据,每页加载10条,共2页.如果只根据当前页的数据个数判断,则需翻到第三页才会知道无更多数据.
      // mescroll.endSuccess(curPageData.length) // 请求成功, 结束加载
    })
    .catch(() => {
      // mescroll.endErr() // 请求失败, 结束加载
    })
}

// 测试 uni API 自动引入
onLoad(() => {
  getVideoList()
})

onPullDownRefresh(() => {})
</script>

<style></style>
