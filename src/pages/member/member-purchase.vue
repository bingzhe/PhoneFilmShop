<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '申请会员',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="w-100vw h-90vh flex flex-col items-center justify-center">
    <view class="flex items-center justify-center w-270px h-270px bg-#fff">
      <canvas id="qrcode" canvas-id="qrcode" style="width: 250px; height: 250px"></canvas>
    </view>
    <view class="text-30rpx text-#666666 pt-12rpx pb-24rpx font-bold">需要店员扫码审核</view>
  </view>
</template>

<script lang="ts" setup>
import UQRCode from 'uqrcodejs'
import { useUserStore } from '@/store'
import { httpPost } from '@/utils/http'
import { useToast } from 'wot-design-uni'

const toast = useToast()

const userStore = useUserStore()
const userInfo = computed(() => {
  return userStore.userInfo
})
const usersId = computed(() => {
  return userStore.userInfo.users_id
})

const shopId = ref('')

const timer = ref(0)

const getUsersNotice = async () => {
  const res = await httpPost('/api/UsersInfo/getUsersNotice', {
    token: userInfo.value.token,
    shop_id: shopId.value,
  })

  const data = (res.data || {}) as any
  const success = !!data.combo_id

  if (success && timer.value) {
    clearInterval(timer.value)
    toast.success('恭喜您，订购成功，成为尊贵的会员!')

    setTimeout(() => {
      uni.navigateBack()
    }, 2000)
  }
}

onLoad((options) => {
  shopId.value = options.shopId

  timer.value = setInterval(() => {
    getUsersNotice()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

onReady(() => {
  const params = {
    shopId: shopId.value,
    usersId: usersId.value,
  }
  const paramsStr = JSON.stringify(params)

  // 获取uQRCode实例
  const qr = new UQRCode()
  // 设置二维码内容
  qr.data = paramsStr
  // 设置二维码大小，必须与canvas设置的宽高一致
  qr.size = 250
  // 调用制作二维码方法
  qr.make()
  // 获取canvas上下文
  const canvasContext = uni.createCanvasContext('qrcode', this) // 如果是组件，this必须传入
  // 设置uQRCode实例的canvas上下文
  qr.canvasContext = canvasContext
  // 调用绘制方法将二维码图案绘制到canvas上
  qr.drawCanvas()
})
</script>

<style lang="scss" scoped>
//
</style>

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
