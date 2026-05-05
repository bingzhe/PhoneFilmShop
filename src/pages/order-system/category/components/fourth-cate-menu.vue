<template>
  <view v-if="menus.length > 0" class="fourth-menu">
    <scroll-view scroll-x class="fourth-scroll" :show-scrollbar="false">
      <view class="fourth-scroll-inner">
        <view
          v-for="(item, index) in menus"
          :key="index"
          class="fourth-chip"
          :class="{ active: item.category_id == activeId }"
          @click="onMenuItemClick(item)"
        >
          <view class="fourth-chip-dot"></view>
          <text class="fourth-chip-text">{{ item.cate_name }}</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
defineProps<{
  menus: any[]
  activeId?: string | number | null
}>()

const emits = defineEmits(['menu-item-click'])

const onMenuItemClick = (item) => {
  emits('menu-item-click', item.category_id)
}
</script>

<style lang="scss" scoped>
.fourth-menu {
  width: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f7fcff 100%);
  border-bottom: 1rpx solid #e8f3f8;
}

.fourth-scroll {
  width: 100%;
  height: 72rpx;
}

.fourth-scroll-inner {
  box-sizing: border-box;
  height: 72rpx;
  padding: 12rpx 18rpx;
  white-space: nowrap;
}

.fourth-chip {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  max-width: 250rpx;
  height: 48rpx;
  padding: 0 20rpx;
  margin-right: 14rpx;
  overflow: hidden;
  color: #666666;
  vertical-align: top;
  background-color: #ffffff;
  border: 1rpx solid #dfeff6;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(35, 183, 235, 0.08);

  &.active {
    font-weight: 600;
    color: #ffffff;
    background-color: #23b7eb;
    border-color: #23b7eb;
    box-shadow: 0 6rpx 16rpx rgba(35, 183, 235, 0.22);
  }
}

.fourth-chip-dot {
  flex-shrink: 0;
  width: 8rpx;
  height: 8rpx;
  margin-right: 10rpx;
  background-color: #9edff5;
  border-radius: 50%;
}

.fourth-chip.active .fourth-chip-dot {
  background-color: #ffffff;
}

.fourth-chip-text {
  overflow: hidden;
  font-size: 24rpx;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
