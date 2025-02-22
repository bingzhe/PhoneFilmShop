<route lang="json5" type="home">
{
  layout: 'default',
  style: {
    navigationBarTitleText: '',
    navigationBarBackgroundColor: '#ffffff',
  },
}
</route>

<template>
  <view class="flex justify-center pt-30vh">
    <!-- <wd-img width="56" height="56" round src="/static/images/logo.png"></wd-img> -->
    <wd-loading size="60px" />
  </view>
</template>

<script lang="ts" setup>
import { wxLogin } from '@/utils/wxLogin'
import { getUserInfo } from '@/service/user'
import { httpGet } from '@/utils/http'

const { setProjectName } = useProjectName()

const getProjectName = async () => {
  const res = await httpGet('/api/Index/getName')
  setProjectName(res.data as string)
}

onLoad(async (options) => {
  try {
    const scene = options.scene
    console.log('scene', scene)

    await wxLogin()
    await getUserInfo()

    getProjectName()

    if (scene) {
      const sceneDecodeURI = decodeURIComponent(scene)
      console.log('sceneDecodeURI', sceneDecodeURI)

      // ?shopld:4
      const parseParams = (str: string) => {
        const params: any = {}
        str.split('&').forEach((pair) => {
          const cleanPair = pair.replace(/^\?/, '')
          const [key, value] = cleanPair.split('=')
          if (key) params[key] = value || ''
        })
        return params
      }
      const params = parseParams(sceneDecodeURI)
      console.log('params', params)

      const shopId = params.shopId

      console.log('shopId', shopId)

      uni.reLaunch({
        url: `/pages/shop/shop?shopId=${shopId}`,
      })
    } else {
      uni.switchTab({
        url: '/pages/index/index',
      })
    }
  } catch (error) {
    console.log(error)
  }
})
</script>

<style lang="scss" scoped>
//
</style>
