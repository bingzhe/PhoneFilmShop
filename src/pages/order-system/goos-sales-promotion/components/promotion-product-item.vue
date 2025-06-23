<template>
  <view class="b-b-1px b-b-solid b-b-#eee">
    <view class="pt-20rpx pb-20rpx pl-30rpx pr-30rpx flex">
      <view class="mr-20rpx" @click="goGoodsDetails">
        <image :src="product.goods_img_full" mode="aspectFill" class="product-image" />
        <view
          class="text-12px color-#fff w-120rpx pt-10rpx pb-10rpx bg-#999 text-center rounded-bl-[8rpx] rounded-br-[8rpx]"
          :style="`background: #${product.colour}`"
        >
          {{ product.code }}
        </view>
      </view>
      <view class="flex-1 flex flex-col justify-between">
        <view class="mb-10rpx flex justify-between items-center" @click="goGoodsDetails">
          <view class="text-14px font-bold mr-10rpx product-name w-250rpx">
            {{ product.goods_name }}
          </view>
        </view>
        <view class="flex items-end gap-2 mb-10rpx">
          <view class="text-14px color-#fa4126 font-bold">
            <text>¥{{ product.goods_price }}</text>
          </view>
          <view class="text-12px color-#666 line-through">
            <text>¥{{ product.yuan_price }}</text>
          </view>
        </view>
        <view class="text-14px color-#fa4126 flex justify-between items-center">
          <wd-button
            :icon="expand ? 'arrow-up' : 'arrow-down'"
            size="small"
            type="info"
            round
            @click="toggleExpand"
            custom-class="m-0"
          >
            通用
          </wd-button>
          <wd-button size="small" type="primary" round @click="addToCart" custom-class="m-0">
            <view class="flex items-center">
              <text>加入购物车</text>
            </view>
          </wd-button>
        </view>
      </view>
    </view>
    <view class="spec-container" :class="{ 'spec-expanded': expand }">
      <view
        v-for="spec in product.spec_list"
        :key="spec.spec_id"
        class="text-14px font-bold pl10px pr10px pb5px pt5px bg-#f1eee9 mr10px mb10px b-rd-8rpx shadow"
      >
        <text>{{ spec.spec_name }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  product: any
}>()

const emits = defineEmits(['toggle-expand', 'add-to-cart'])

const expand = ref(true)

const toggleExpand = () => {
  expand.value = !expand.value
  emits('toggle-expand')
}

const addToCart = () => {
  emits('add-to-cart')
}

const goGoodsDetails = () => {
  // uni.navigateTo({
  //   url: `/pages/order-system/goods-detail/goods-detail?id=${props.product.goods_id}`,
  // })
}
</script>

<style scoped>
.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
}
.product-name {
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.line-through {
  text-decoration: line-through;
}
.spec-container {
  display: flex;
  flex-wrap: wrap;
  max-height: 0;
  padding: 0 30rpx;
  overflow: hidden;
  opacity: 0;
  transition: all 0.3s ease;
}
.spec-expanded {
  max-height: 300rpx;
  padding-bottom: 20rpx;
  opacity: 1;
}
</style>
