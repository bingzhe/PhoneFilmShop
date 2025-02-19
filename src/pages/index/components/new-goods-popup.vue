<template>
  <wd-popup v-model="show" custom-style="border-radius:32rpx;" :z-index="9999" @close="close">
    <view class="popup-content">
      <image :src="`${baseUrl}${productBg}`" />

      <view class="popup-title">New product update</view>
      <rich-text :nodes="productContent" />
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
  /* display: flex; */
  /* justify-content: center; */
  align-items: center;
  width: 650rpx;
  height: 650rpx;
  padding: 80rpx 0 0 40rpx;
}

.popup-title {
  margin-bottom: 10rpx;
  font-size: 52rpx;
  font-weight: bold;
  color: #000;
}

.popup-content image {
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
  width: 650rpx;
  height: 650rpx;
}
</style>
