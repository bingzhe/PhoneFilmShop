<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '业绩列表',
    navigationBarBackgroundColor: '#23B7EB',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="flex flex-col min-h-100vh bg-gray-100 p-3">
    <view v-if="type == 1">
      <view
        v-for="(item, index) in userlist"
        :key="index"
        class="user-item bg-white rounded-md mb-3 overflow-hidden"
      >
        <view class="flex p-3">
          <view class="mr-3">
            <wd-img
              class="rounded-full"
              :src="item.avatar"
              width="60px"
              height="60px"
              mode="aspectFill"
            />
          </view>
          <view class="flex-1">
            <view class="text-gray-500 mb-1 text-sm">
              客户名称：
              <text class="text-gray-800">{{ item.username }}</text>
            </view>
            <view class="text-gray-500 mb-1 text-sm">
              累计业绩：
              <text class="text-gray-800">{{ item.all_pay_price }}</text>
            </view>
            <view class="text-gray-500 text-sm">
              注册时间：
              <text class="text-gray-800">{{ item.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view v-else>
      <view
        v-for="(item, index) in performanceList"
        :key="index"
        class="performance-item bg-white rounded-md mb-3 p-3"
      >
        <view class="text-gray-500 mb-1 text-sm">
          订单号：
          <text class="text-gray-800">{{ item.order_no }}</text>
        </view>
        <view class="text-gray-500 mb-1 text-sm">
          下单客户：
          <text class="text-gray-800">{{ item.username }}</text>
        </view>
        <view class="text-gray-500 mb-1 text-sm">
          时间：
          <text class="text-gray-800">{{ item.time }}</text>
        </view>
        <view class="text-gray-500 text-sm">
          金额：
          <text class="text-gray-800">{{ item.price }}</text>
        </view>
      </view>
    </view>

    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'
import dayjs from 'dayjs'

const toast = useToast()

// 页面数据
const userlist = ref<any[]>([])
const performanceList = ref<any[]>([])
const type = ref(1)
const baseUrl = import.meta.env.VITE_SERVER_BASEURL || ''

// 获取客户列表
const getUsersList = async () => {
  toast.loading('加载中...')
  try {
    const result = await httpPost<any[]>('/api/usersinfo/getUsersList', {
      token: getOrderToken(),
    })

    if (result.code === 200) {
      const list = (result.data || []).map((item: any) => {
        if (item.avatar) {
          item.avatar = `${baseUrl}${item.avatar}`
        }
        // eslint-disable-next-line import/no-named-as-default-member
        item.time = dayjs.unix(item.reg_time).format('YYYY-MM-DD HH:mm:ss')
        return item
      })

      userlist.value = list
    } else {
      toast.error(result.meg || '获取客户列表失败')
    }
  } catch (error) {
    console.error('获取客户列表失败:', error)
    toast.error('获取客户列表失败')
  } finally {
    toast.close()
  }
}

// 获取业绩列表
const getPerformanceList = async () => {
  toast.loading('加载中...')
  try {
    const postData: any = {
      token: getOrderToken(),
    }

    // eslint-disable-next-line eqeqeq
    if (type.value == 3) {
      postData.type = 1
    }

    const result = await httpPost<any[]>('/api/usersinfo/getPerformanceList', postData)

    if (result.code === 200) {
      const list = (result.data || []).map((item: any) => {
        // eslint-disable-next-line import/no-named-as-default-member
        item.time = dayjs.unix(item.ctime).format('YYYY-MM-DD HH:mm:ss')
        return item
      })

      performanceList.value = list
    } else {
      toast.error(result.meg || '获取业绩列表失败')
    }
  } catch (error) {
    console.error('获取业绩列表失败:', error)
    toast.error('获取业绩列表失败')
  } finally {
    toast.close()
  }
}

// 页面加载
onLoad((options) => {
  if (options?.type) {
    type.value = parseInt(options.type)
    // eslint-disable-next-line eqeqeq
    if (type.value == 1) {
      getUsersList()
    } else {
      getPerformanceList()
    }
  } else {
    // 默认加载客户列表
    getUsersList()
  }
})
</script>
