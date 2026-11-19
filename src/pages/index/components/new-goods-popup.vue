<template>
  <wd-popup
    v-model="show"
    custom-style="border-radius:32rpx; overflow:hidden;"
    :z-index="9999"
    @close="close"
  >
    <view class="popup-content">
      <image class="popup-bg" :src="`${baseUrl}${productBg}`" mode="aspectFill" />

      <view class="popup-body">
        <view class="popup-title">新品更新</view>
        <scroll-view scroll-y class="popup-scroll">
          <rich-text :nodes="formattedContent" />
        </scroll-view>
      </view>
    </view>
  </wd-popup>
</template>

<script lang="ts" setup>
const baseUrl = import.meta.env.VITE_SERVER_BASEURL

const show = ref(false)

const props = defineProps<{
  productBg: string
  productContent: string
  productionShow: boolean
}>()

const emit = defineEmits(['close'])

// 后台富文本里的字号偏大，统一收敛到适合弹窗的字号
const formattedContent = computed(() => {
  return (props.productContent || '')
    .replace(/font-size:\s*24px/gi, 'font-size:16px')
    .replace(/font-size:\s*18px/gi, 'font-size:13px')
    .replace(
      /<p style="text-align:center;">/gi,
      '<p style="text-align:center;margin:0 0 7px;line-height:1.7;word-break:break-all;">',
    )
    .replace(
      /<h2 style="text-align:center;">/gi,
      '<h2 style="text-align:center;margin:0 0 8px;line-height:1.5;word-break:break-all;">',
    )
})

watch(
  () => props.productionShow,
  (newVal) => {
    show.value = newVal
  },
)

const close = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
.popup-content {
  position: relative;
  box-sizing: border-box;
  width: 650rpx;
  height: 750rpx;
}

.popup-bg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  width: 650rpx;
  height: 750rpx;
}

.popup-body {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 64rpx 50rpx 150rpx;
}

.popup-title {
  flex-shrink: 0;
  margin-bottom: 16rpx;
  font-size: 40rpx;
  font-weight: bold;
  line-height: 1.2;
  color: #222;
}

.popup-scroll {
  height: 440rpx;
}
</style>
