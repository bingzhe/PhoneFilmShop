<template>
  <scroll-view scroll-x class="bg-#eeeeee w-750rpx">
    <view class="h-68rpx" style="white-space: nowrap">
      <view
        v-for="(item, index) in menus"
        :key="index"
        @click="onMenuItemClick(item)"
        style="display: inline-block"
        class="min-w-120rpx h-68rpx text-12px font-bold pl20rpx pr20rpx text-center line-height-68rpx color-#000"
        :class="{ 'important-bg-#5ac3f3 color-#fff': item.cate_id == firstCateId }"
      >
        {{ item.cate_name }}
      </view>
    </view>
  </scroll-view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  menus: any[]
  firstCateId: string | number
}>()

const emits = defineEmits(['menu-item-click'])

// const { menus, firstCateId } = toRefs(props)

const onMenuItemClick = (item) => {
  emits('menu-item-click', item.cate_id)
}
</script>
