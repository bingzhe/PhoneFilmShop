<template>
  <view v-if="menus.length > 0" class="series-menu">
    <view class="series-bar">
      <scroll-view scroll-x class="series-scroll" :show-scrollbar="false">
        <view class="series-scroll-inner">
          <view
            v-for="(item, index) in menus"
            :key="index"
            class="series-chip"
            :class="{ active: item.category_id == activeId }"
            @click="onMenuItemClick(item)"
          >
            {{ item.cate_name }}
          </view>
        </view>
      </scroll-view>

      <view class="series-toggle" @click="togglePanel">
        <view class="series-arrow" :class="{ expanded: isExpanded }"></view>
      </view>
    </view>

    <view v-if="isExpanded" class="series-panel">
      <view class="series-grid">
        <view
          v-for="(item, index) in menus"
          :key="index"
          class="series-panel-item"
          :class="{ active: item.category_id == activeId }"
          @click="onMenuItemClick(item)"
        >
          {{ item.cate_name }}
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps<{
  menus: any[]
  activeId?: string | number | null
}>()

const emits = defineEmits(['menu-item-click'])

const isExpanded = ref(false)

watch(
  () => props.menus,
  () => {
    isExpanded.value = false
  },
)

const togglePanel = () => {
  isExpanded.value = !isExpanded.value
}

const onMenuItemClick = (item) => {
  emits('menu-item-click', item.category_id)
  isExpanded.value = false
}
</script>

<style lang="scss" scoped>
.series-menu {
  position: sticky;
  top: 168rpx;
  z-index: 18;
  width: 100%;
  background-color: #fff;
}

.series-bar {
  display: flex;
  align-items: center;
  height: 78rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eeeeee;
}

.series-scroll {
  flex: 1;
  width: 0;
  height: 78rpx;
}

.series-scroll-inner {
  box-sizing: border-box;
  height: 78rpx;
  padding: 12rpx 16rpx;
  white-space: nowrap;
}

.series-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 128rpx;
  max-width: 220rpx;
  height: 54rpx;
  padding: 0 22rpx;
  margin-right: 16rpx;
  overflow: hidden;
  font-size: 28rpx;
  line-height: 1.2;
  color: #333333;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: top;
  background-color: #f8f8f8;
  border: 1rpx solid #dddddd;
  border-radius: 10rpx;

  &.active {
    font-weight: 600;
    color: #23b7eb;
    background-color: #effaff;
    border-color: #23b7eb;
  }
}

.series-toggle {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 72rpx;
  height: 78rpx;
  background-color: #ffffff;
  box-shadow: -10rpx 0 18rpx rgba(255, 255, 255, 0.96);
}

.series-arrow {
  width: 0;
  height: 0;
  border-top: 12rpx solid #999999;
  border-right: 10rpx solid transparent;
  border-left: 10rpx solid transparent;
  transition: transform 0.2s ease;

  &.expanded {
    border-top-color: #23b7eb;
    transform: rotate(180deg);
  }
}

.series-panel {
  position: absolute;
  top: 78rpx;
  right: 0;
  left: 0;
  z-index: 30;
  box-sizing: border-box;
  max-height: 620rpx;
  padding: 20rpx 20rpx 8rpx;
  overflow-y: auto;
  background-color: #ffffff;
  border-radius: 0 0 20rpx 20rpx;
  box-shadow: 0 16rpx 32rpx rgba(0, 0, 0, 0.12);
}

.series-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.series-panel-item {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 31%;
  min-height: 90rpx;
  padding: 12rpx 10rpx;
  margin-bottom: 18rpx;
  overflow: hidden;
  font-size: 30rpx;
  line-height: 1.25;
  color: #333333;
  text-align: center;
  word-break: break-all;
  background-color: #f8f8f8;
  border: 1rpx solid #dddddd;
  border-radius: 10rpx;

  &.active {
    font-weight: 600;
    color: #23b7eb;
    background-color: #effaff;
    border-color: #23b7eb;
  }
}
</style>
