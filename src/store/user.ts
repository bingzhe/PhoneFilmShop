import { defineStore } from 'pinia'
import { ref } from 'vue'

const initState = { nickname: '', avatar: '', token: '', phone: '' }

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<IUserInfo>({ ...initState })

    const setUserInfo = (val: IUserInfo) => {
      const token = getToken()

      userInfo.value = { ...val, token }
    }

    const clearUserInfo = () => {
      userInfo.value = { ...initState }
    }
    // 一般没有reset需求，不需要的可以删除
    const reset = () => {
      userInfo.value = { ...initState }
    }
    const isLogined = computed(() => !!userInfo.value.token)

    const getToken = () => {
      return userInfo.value.token
    }
    const setToken = (val: string) => {
      userInfo.value.token = val
    }

    return {
      userInfo,
      setUserInfo,
      clearUserInfo,
      isLogined,
      reset,
      getToken,
      setToken,
    }
  },
  {
    persist: false,
  },
)
