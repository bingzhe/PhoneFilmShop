<template>
  <wd-tabbar
    v-model="tabbar"
    fixed
    safeAreaInsetBottom
    placeholder
    custom-class="order-tabbar-class"
    @change="handleChange"
  >
    <wd-tabbar-item title="分类" icon="home"></wd-tabbar-item>
    <wd-tabbar-item title="购物车" icon="cart"></wd-tabbar-item>
    <wd-tabbar-item title="我的" icon="user"></wd-tabbar-item>
  </wd-tabbar>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'

const tabbar = ref(0)

// 根据当前页面路径计算当前选中的tab
const currentPath = computed(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  return currentPage?.route || ''
})

// 监听路由变化，更新选中的tab
watch(
  () => currentPath.value,
  (newPath) => {
    if (newPath.includes('category')) {
      tabbar.value = 0
    } else if (newPath.includes('cart')) {
      tabbar.value = 1
    } else if (newPath.includes('order-person')) {
      tabbar.value = 2
    }
  },
  { immediate: true },
)

function handleChange({ value }: { value: number }) {
  const routes = [
    '/pages/order-system/category/category',
    '/pages/order-system/cart/cart',
    '/pages/order-system/order-person/order-person',
  ]

  uni.redirectTo({
    url: routes[value],
  })
}
</script>

<style lang="scss">
:root,
page {
  --wot-tabbar-item-icon-size: 26px;
  --wot-tabbar-item-title-font-size: 12px;
}
</style>
