<route lang="json5" type="page">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '贴膜核销',
    navigationBarBackgroundColor: '#00A3FF',
    navigationBarTextStyle: 'white',
  },
}
</route>

<template>
  <view class="pt-48rpx">
    <wd-picker :columns="comboList" label="选择套餐" required v-model="selectCombo" />

    <view class="p-48rpx flex items-center justify-center">
      <wd-button @click="handleCreateQrCode">生成核销码</wd-button>
    </view>

    <view class="w-100vw flex flex-col items-center justify-center">
      <view class="text-30rpx text-#666666 pt-12rpx pb-24rpx font-bold pl-32rpx pr-32rpx">
        核销码用于核销套餐，每核销一次，就减少一次核销次数
      </view>

      <view class="flex items-center justify-center w-270px h-270px bg-#fff">
        <canvas
          id="qrcode"
          canvas-id="qrcode"
          type="2d"
          style="width: 250px; height: 250px"
        ></canvas>
      </view>
    </view>
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

const shopId = ref('')

const selectCombo = ref('')
const comboList = ref([]) // 我的套餐

let qrCode = null

// 获取我的套餐
const getMyComboList = async () => {
  try {
    const res = await httpPost('/api/UsersInfo/getUsersComboList', {
      token: userInfo.value.token,
      shop_id: shopId.value,
    })

    const data = (res.data || []) as any[]

    comboList.value = data.map((item) => {
      return {
        value: item.id,
        label: `${item.combo_name} ${item.combo_price}元 ${item.combo_num}次`,
      }
    })
    console.log('getMyComboList', res)
  } catch (error) {
    console.log(error)
  } finally {
    toast.close()
  }
}

const handleCreateQrCode = () => {
  if (!selectCombo.value) {
    toast.error('请选择套餐')
    return
  }

  const params = {
    comboId: selectCombo.value,
    shopId: shopId.value,
  }

  const paramsStr = JSON.stringify(params)
  console.log('二维码参数', paramsStr)

  generateQrCode(paramsStr)
}

const generateQrCode = (val: string) => {
  toast.loading('生成中...')
  try {
    if (qrCode) {
      qrCode = null
    }

    // #ifdef MP-WEIXIN
    qrCode = new UQRCode()

    qrCode.data = val
    qrCode.size = 250
    qrCode.make()

    // const canvasContext = uni.createCanvasContext('qrcode', this) // 如果是组件，this必须传入
    // qrCode.canvasContext = canvasContext
    // qrCode.drawCanvas()

    // wx.createSelectorQuery()
    //   .select('#qrcode') // 在 WXML 中填入的 id
    //   .node(({ node: canvas }) => {
    //     const context = canvas.getContext('2d')
    //     qrCode.canvasContext = context
    //     qrCode.drawCanvas(context)
    //   })
    //   .exec()

    wx.createSelectorQuery()
      .select('#qrcode') // 在 WXML 中填入的 id
      .fields({ node: true, size: true })
      .exec((res) => {
        // Canvas 对象
        const canvas = res[0].node
        // Canvas 画布的实际绘制宽高
        const renderWidth = res[0].width
        const renderHeight = res[0].height
        // Canvas 绘制上下文
        const context = canvas.getContext('2d')

        // 初始化画布大小
        const dpr = (wx as any).getWindowInfo().pixelRatio
        canvas.width = renderWidth * dpr
        canvas.height = renderHeight * dpr
        context.scale(dpr, dpr)

        qrCode.canvasContext = context
        qrCode.drawCanvas(context)
      })
    // #endif
  } catch (error) {
    console.error(error)
  }

  toast.close()
}

onLoad((options) => {
  shopId.value = options.shopId
  getMyComboList()
})

onReady(() => {})
</script>

<style lang="scss" scoped>
//
</style>

<style lang="scss">
page {
  background: #f9f9f9;
}
</style>
