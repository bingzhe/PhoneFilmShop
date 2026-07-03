<template>
  <view class="b-b-1px b-b-solid b-b-#ccc">
    <view class="pt-30rpx pl-30rpx pr-30rpx flex">
      <view class="flex-1">
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
        <view class="mb-10rpx">
          <view class="text-10px font-bold mr-10rpx" :style="'color: #' + product.colour + ';'">
            {{ product.goods_name }}
          </view>
        </view>
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

        <view class="order-rule-tag">
          <text class="order-rule-tag__count">{{ orderMultiple }}</text>
          <text>PCS整倍起订</text>
        </view>

        <view class="text-14px color-#fa4126 flex justify-between items-center">
          <text>价格：¥{{ product.goods_price }}元</text>

          <wd-button size="small" type="primary" round @click="addToCart" custom-class="m-0">
            <view class="flex items-center">
              <text>加入购物车</text>
            </view>
          </wd-button>
        </view>
      </view>
    </view>
    <view class="text-center" @click="toggleExpand">
      <wd-icon v-if="!product.expand" name="arrow-down" size="32rpx" color="#999999"></wd-icon>
      <wd-icon v-if="product.expand" name="arrow-up" size="32rpx" color="#999999"></wd-icon>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { getOrderMultiple } from '../../utils/orderQuantity'

const props = defineProps<{
  product: any
}>()

const emits = defineEmits(['toggle-expand', 'add-to-cart'])

const orderMultiple = computed(() => getOrderMultiple(props.product?.add_num))

const toggleExpand = () => {
  emits('toggle-expand')
}

const addToCart = () => {
  emits('add-to-cart')
}
</script>

<style scoped>
.order-rule-tag {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 12rpx;
  margin: 2rpx 0 16rpx;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1.2;
  color: #00a3ff;
  background: rgba(0, 163, 255, 0.08);
  border: 1rpx solid rgba(0, 163, 255, 0.22);
  border-radius: 6rpx;
}

.order-rule-tag__count {
  margin-right: 4rpx;
  font-size: 22rpx;
}
</style>
