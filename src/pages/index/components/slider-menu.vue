<template>
  <wd-sidebar v-model="activeKey" @change="onChange">
    <wd-sidebar-item
      v-for="(item, index) in menus"
      :key="index"
      :value="item.cate_id"
      customClass="important-text-12px font-bold important-p-12rpx important-min-h-44px position-relative important-w-180rpx"
      :label="item.jian"
    >
      <template #icon>
        <view
          v-if="item.xilie"
          class="important-text-10px position-absolute top-0 left-0 color-#fff h-30rpx w-30rpx rounded-tl-none rounded-tr-none rounded-br-15rpx rounded-bl-none text-center leading-30rpx"
          :style="'background: #' + item.colour + ';'"
        >
          {{ item.xilie }}
        </view>
      </template>
    </wd-sidebar-item>
  </wd-sidebar>
</template>

<script lang="ts" setup>
const props = defineProps<{
  menus: any[]
  toggleCate: boolean
}>()

const emits = defineEmits(['slider-menu-item-click'])

watch(
  () => props.toggleCate,
  (val) => {
    activeKey.value = 0
  },
)

const activeKey = ref(0)

const onChange = (e) => {
  emits('slider-menu-item-click', e.value)
  console.log('slider-menu-item-click', e)
}
</script>

<style>
/* 添加这段样式后，默认 Button 底色会变成绿色 */
:root,
page {
  --wd-sidebar-active-color: #5ac3f3;
}
</style>
