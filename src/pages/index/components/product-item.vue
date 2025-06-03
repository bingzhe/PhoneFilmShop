<template>
  <!-- b-b-1px b-b-solid b-b-#ccc -->
  <view class="pt-15rpx pl-15rpx pr-15rpx">
    <view class="pt-30rpx pl-30rpx pr-20rpx pb-20rpx flex shadow-cus rounded-8px">
      <view class="flex-1">
        <view class="flex items-center justify-between">
          <view class="flex items-center text-12px font-bold mb-12rpx">
            <view
              class="color-#fff mr-10rpx pt-8rpx pb-8rpx pl-12rpx pr-12rpx b-rd-4rpx text-13px"
              :style="'background: #' + product.colour + ';'"
            >
              {{ product.code }}
            </view>

            <view class="mr-10rpx" :style="'color: #' + product.colour + ';'">
              {{ product.cate_name }}
            </view>
          </view>
          <view class="text-14px color-#fa4126 mb-20rpx flex justify-end">
            <text>¥{{ product.price }}</text>
          </view>
        </view>
        <!-- <view class="mb-10rpx">
          <view class="text-10px font-bold mr-10rpx" :style="'color: #' + product.colour + ';'">
            {{ product.goods_name }}
          </view>
        </view> -->
        <view class="flex flex-wrap">
          <view
            class="bg-#fa4126 color-#fff mr-10rpx mb-10rpx m-rd-4rpx text-12px pt-5rpx pb-5rpx pl-10rpx pr-12rpx"
            v-for="(selectSpec, k) in product.selectList"
            :key="k"
          >
            {{ selectSpec.spec_name }}
          </view>
        </view>
        <view v-if="product.expand" class="flex flex-wrap overflow-auto h-fit">
          <view
            class="text-12px font-bold pl10rpx pr10rpx pb5rpx pt5rpx bg-#f1eee9 mr10rpx mb10rpx b-rd-8rpx"
            :class="{ 'bg-fa4126 color-#fff': modal.is_checked == 1 }"
            v-for="(modal, j) in product.spec_list"
            :key="j"
          >
            {{ modal.spec_name }}
          </view>
        </view>
      </view>
    </view>
    <!-- <view class="text-center" @click="toggleExpand">
      <wd-icon v-if="!product.expand" name="arrow-down" size="32rpx" color="#999999"></wd-icon>
      <wd-icon v-if="product.expand" name="arrow-up" size="32rpx" color="#999999"></wd-icon>
    </view> -->
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  product: any
}>()

const emits = defineEmits(['toggle-expand'])

const toggleExpand = () => {
  emits('toggle-expand')
}
</script>

<style lang="scss" scoped>
.shadow-cus {
  // --un-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  // box-shadow: var(--un-ring-offset-shadow, 0 0 #0000), var(--un-ring-shadow, 0 0 #0000),
  //   var(--un-shadow);
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.18);
}
</style>
