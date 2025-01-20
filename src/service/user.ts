import { http } from '@/utils/http'
import { useUserStore } from '@/store/user'

export const getUserInfoAPI = async () => {
  const userStore = useUserStore()
  const token = userStore.getToken()

  return http.post('/api/UsersInfo/index', { token })
}

export const getUserInfo = async () => {
  const userStore = useUserStore()

  const res = (await getUserInfoAPI()) as any
  const userInfo = {
    ...res.data,
    nickname: res.data.nikename,
  }

  // 测试 TODO
  // userInfo.avatar = ''
  // userInfo.nickname = ''
  // userInfo.phone = ''
  // userInfo.is_admin = 0

  userStore.setUserInfo(userInfo as IUserInfo)
}
