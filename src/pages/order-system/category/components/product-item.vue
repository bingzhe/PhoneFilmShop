<template>
  <view class="b-b-1px b-b-solid b-b-#ccc">
    <view class="pt-20rpx pb-20rpx pl-30rpx pr-30rpx flex">
      <view class="mr-20rpx" @click="goGoodsDetails">
        <image :src="product.goods_img_full" mode="aspectFill" class="product-image" />
      </view>
      <view class="flex-1 flex flex-col justify-between">
        <view class="mb-10rpx" @click="goGoodsDetails">
          <view class="text-12px font-bold mr-10rpx product-name w-350rpx">
            {{ product.goods_name }}
          </view>
        </view>

        <view class="text-14px color-#fa4126 flex justify-between items-center">
          <text>¥{{ product.goods_price }}元</text>

          <wd-button size="small" type="primary" round @click="addToCart" custom-class="m-0">
            <view class="flex items-center">
              <text>加入购物车</text>
            </view>
          </wd-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  product: any
}>()

const emits = defineEmits(['toggle-expand', 'add-to-cart'])

const toggleExpand = () => {
  emits('toggle-expand')
}

const addToCart = () => {
  emits('add-to-cart')
}

const goGoodsDetails = () => {
  uni.navigateTo({
    url: `/pages/order-system/goods-detail/goods-detail?id=${props.product.goods_id}`,
  })
}
</script>

<style scoped>
.product-image {
  width: 140rpx;
  height: 140rpx;
  border-radius: 8rpx;
}

.product-name {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
