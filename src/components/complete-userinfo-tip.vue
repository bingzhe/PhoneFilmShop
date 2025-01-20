<template>
  <view></view>
</template>

<script lang="ts" setup>
import { useMessage } from 'wot-design-uni'
import { useUserStore } from '@/store/user'

const props = defineProps<{
  type: 'personal' | 'shop'
}>()

const message = useMessage()
const userStore = useUserStore()

const userInfo = computed(() => {
  return userStore.userInfo
})

const isPhoneBind = computed(() => {
  return !!userInfo.value.phone
})

const isNicknameBind = computed(() => {
  return !!userInfo.value.nickname
})

const isAvatarBind = computed(() => {
  return !!userInfo.value.avatar
})

function confirm() {
  let tip = ''

  if (!isPhoneBind.value && !isNicknameBind.value && !isAvatarBind.value) {
    tip = '请完善用户信息之后继续使用'
  } else if (!isPhoneBind.value && !isNicknameBind.value && isAvatarBind.value) {
    tip = '请绑定手机号和设置昵称后继续使用'
  } else if (!isPhoneBind.value && !isAvatarBind.value && isNicknameBind.value) {
    tip = '请绑定手机号和设置头像后继续使用'
  } else if (!isNicknameBind.value && !isAvatarBind.value && isPhoneBind.value) {
    tip = '请设置昵称和头像后继续使用'
  } else if (!isPhoneBind.value && isNicknameBind.value && isAvatarBind.value) {
    tip = '请绑定手机号后继续使用'
  } else if (!isNicknameBind.value && isPhoneBind.value && isAvatarBind.value) {
    tip = '请设置昵称后继续使用'
  } else if (!isAvatarBind.value && isPhoneBind.value && isNicknameBind.value) {
    tip = '请设置头像后继续使用'
  }

  try {
    message
      .confirm({
        msg: tip,
        closeOnClickModal: false,
      })
      .then(() => {
        uni.navigateTo({
          url: '/pages/personal/personal-edit',
        })
      })
      .catch(() => {
        // 关闭小程序
        if (props.type === 'personal') {
          uni.navigateBack()
        } else if (props.type === 'shop') {
          // #ifdef MP-WEIXIN
          wx.exitMiniProgram()
          // #endif
        }
      })
  } catch (e) {
    console.log(e)
  }
}
onShow(() => {
  if (!isPhoneBind.value || !isNicknameBind.value || !isAvatarBind.value) {
    confirm()
  }
})

onMounted(() => {})
</script>
