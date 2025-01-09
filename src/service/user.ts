import { http } from '@/utils/http'
import { useUserStore } from '@/store/user'

export const getUserInfoAPI = () => {
  const userStore = useUserStore()
  const token = userStore.getToken()

  return http.post('/api/UsersInfo/index', { token })
}
