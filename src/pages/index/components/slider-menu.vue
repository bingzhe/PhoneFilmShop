<template>
  <wd-sidebar v-model="activeKey" custom-class="important-h-auto" @change="onChange">
    <wd-sidebar-item
      v-for="(item, index) in menus"
      :key="index"
      :value="item.cate_id"
      :custom-class="ITEM_CLASS"
      :custom-style="itemStyle(item)"
      :label="item.jian"
    >
      <template #icon>
        <view
          v-if="item.xilie"
          class="important-text-10px position-absolute top-0 left-0 color-#fff h-30rpx w-45rpx rounded-tl-12rpx rounded-tr-none rounded-br-15rpx rounded-bl-none text-center leading-30rpx"
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

/**
 * 菜单卡片的基础样式（圆角卡片形态）
 * 用 important- 前缀的类会被编译进 app.wxss，才能盖住组件库的 scoped 样式
 */
const ITEM_CLASS = [
  'goods-cate-item',
  'important-text-13px',
  'important-font-bold',
  'important-leading-42rpx',
  'important-min-h-0',
  'important-py-10rpx',
  'important-px-8rpx',
  'important-w-176rpx',
  'important-mx-12rpx',
  'important-mb-16rpx',
  'important-b-rd-12rpx',
  'important-whitespace-pre-line',
  'text-center',
  'position-relative',
].join(' ')

const isActive = (item: any) => item.cate_id === activeKey.value

/**
 * 配色走内联样式：uno 的颜色类经构建链路后会被转义成 _a_ 前缀，
 * 存在被静默丢弃的风险，且其产物是 rgb(r g b / var()) 的旧 iOS 不兼容写法。
 * 选中态额外把 --wot-sidebar-active-border-width 置 0，去掉组件库默认的左侧竖条。
 */
const itemStyle = (item: any) =>
  isActive(item)
    ? 'background-color: #5ac3f3; color: #fff; --wot-sidebar-active-border-width: 0px;'
    : 'background-color: #f5f5f5; color: #333;'

const onChange = (e) => {
  emits('slider-menu-item-click', e.value)
  console.log('slider-menu-item-click', e)
}
</script>

<style>
/* wot-design-uni 1.14 起 CSS 变量前缀已由 --wd- 改为 --wot-，
   原先的 --wd-sidebar-active-color 是不生效的，这里改成正确的变量名 */
:root,
page {
  --wot-sidebar-active-color: #5ac3f3;
}
</style>
