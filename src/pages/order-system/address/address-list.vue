<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '地址列表',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="container">
    <!-- 地址列表 -->
    <view v-if="addressList.length > 0" class="address-list">
      <view
        v-for="(item, index) in addressList"
        :key="index"
        class="address-item"
        @click="handleSelectAddress(item)"
      >
        <view class="address-info">
          <view class="address-header">
            <view class="address-name">{{ item.name }}</view>
            <view class="address-phone">{{ item.telephone }}</view>
            <view v-if="item.is_default === 1" class="default-tag">默认</view>
          </view>
          <view class="address-detail">
            {{ `${item.province_name}${item.city_name}${item.area_name}${item.address}` }}
          </view>
        </view>
        <view class="address-actions">
          <view class="action-item" @click.stop="handleEdit(item)">
            <view class="i-mingcute:edit-3-line text-36rpx text-#999"></view>
          </view>
          <view class="action-item" @click.stop="handleDelete(item)">
            <view class="i-mingcute:delete-2-line text-36rpx text-#999"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <view class="i-mdi:map-marker-off text-120rpx text-#999"></view>
      <view class="empty-text">暂无地址信息</view>
    </view>

    <!-- 底部按钮 -->
    <view class="bottom-bar" :style="{ paddingBottom: safeAreaInsetBottom + 'px' }">
      <wd-button type="primary" size="large" block @click="handleAddAddress">添加新地址</wd-button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useToast } from 'wot-design-uni'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { getCurrentInstance } from 'vue'

const toast = useToast()

// 获取用户信息
const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})

// 地址列表
const addressList = ref<any[]>([])

// 是否是选择地址模式
const isSelectMode = ref(false)

// 安全区域底部距离
const safeAreaInsetBottom = ref(0)

// 事件通道
const eventChannel = ref(null)

// 获取地址列表
const getAddressList = () => {
  toast.loading('加载中...')
  httpPost('/Api/Usersinfo/getAddress', {
    token: userInfo.value.token,
  })
    .then((res: any) => {
      if (res.data) {
        addressList.value = res.data || []
      }
    })
    .catch((err) => {
      console.error('获取地址列表失败', err)
    })
    .finally(() => {
      toast.close()
    })
}

// 删除地址
const handleDelete = (item: any) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除该地址吗？',
    success: (res) => {
      if (res.confirm) {
        toast.loading('删除中...')
        httpPost('/Api/Usersinfo/delAddress', {
          token: userInfo.value.token,
          address_id: item.address_id,
        })
          .then(() => {
            toast.success('删除成功')
            getAddressList()
          })
          .catch((err) => {
            toast.error('删除失败' + err)
          })
          .finally(() => {
            toast.close()
          })
      }
    },
  })
}

// 添加新地址
const handleAddAddress = () => {
  uni.navigateTo({
    url: '/pages/order-system/address/address-add',
    events: {
      // 监听添加地址成功事件
      addressAdded: function () {
        getAddressList()
      },
    },
  })
}

// 编辑地址
const handleEdit = (item: any) => {
  uni.navigateTo({
    url: `/pages/order-system/address/address-add?address_id=${item.address_id}`,
    events: {
      // 监听编辑地址成功事件
      addressAdded: function () {
        getAddressList()
      },
    },
  })
}

// 选择地址
const handleSelectAddress = (item: any) => {
  if (isSelectMode.value) {
    // 如果是选择模式，则触发选择事件
    if (eventChannel.value) {
      eventChannel.value.emit('selectAddress', item)
    }
    uni.navigateBack()
  }
}

// 获取安全区域
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

onLoad((options) => {
  // 获取事件通道
  try {
    const instance = getCurrentInstance().proxy as any
    const channel = instance.getOpenerEventChannel()

    if (channel) {
      eventChannel.value = channel
    }
  } catch (e) {
    console.error('获取事件通道失败', e)
  }

  // 获取安全区域
  getSafeArea()

  // 检查是否是选择模式
  if (options.select === '1') {
    isSelectMode.value = true
  }

  // 获取地址列表
  getAddressList()
})
</script>

<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  min-height: 100vh;
  padding-bottom: 170rpx;
  background-color: #f7f8fa;
}

.address-list {
  padding: 20rpx;
}

.address-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 30rpx;
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 12rpx;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.address-name {
  margin-right: 20rpx;
  font-size: 30rpx;
  font-weight: bold;
}

.address-phone {
  font-size: 28rpx;
  color: #666;
}

.default-tag {
  padding: 2rpx 10rpx;
  margin-left: 10rpx;
  font-size: 20rpx;
  color: #fff;
  background-color: #00a3ff;
  border-radius: 8rpx;
}

.address-detail {
  font-size: 28rpx;
  line-height: 1.4;
  color: #333;
}

.address-actions {
  display: flex;
  margin-left: 20rpx;
}

.action-item {
  padding: 10rpx;
  margin: 0 10rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.bottom-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 20rpx 30rpx;
  background-color: #fff;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}
</style>
