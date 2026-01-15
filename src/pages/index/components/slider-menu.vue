<template>
  <wd-sidebar v-model="activeKey" @change="onChange">
    <wd-sidebar-item
      v-for="(item, index) in menus"
      :key="index"
      :value="item.cate_id"
      :label="item.jian"
      customClass="important-text-12px font-bold important-p-12rpx important-min-h-44px important-w-180rpx text-center"
    />
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

const onChange = ({ value, label }) => {
  emits('slider-menu-item-click', value)
  console.log(label)
}
</script>

<style>
/* 添加这段样式后，默认 Button 底色会变成绿色 */
:root,
page {
  --wd-sidebar-active-color: #003da5;
}
</style>
