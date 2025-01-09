import { httpPost } from './http'
import { useUserStore } from '@/store/user'

interface WxLoginRes {
  code: string
}

interface LoginResult {
  token: string
  openid: string
}

/**
 * 微信登录
 * @returns Promise<LoginResult>
 */
export const wxOpenidLogin = (code: string) => {
  return httpPost<string>('/api/WxLogin/wxOpenidLogin', { code })
}

/**
 * 获取微信登录凭证
 * @returns Promise<WxLoginRes>
 */
export const getWxLoginCode = (): Promise<WxLoginRes> => {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        resolve({ code: res.code })
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

export const wxLogin = async () => {
  try {
    // 获取微信登录凭证
    const { code } = await getWxLoginCode()
    // 使用凭证登录
    const loginResult = await wxOpenidLogin(code)

    // 设置token
    const userStore = useUserStore()
    userStore.setToken(loginResult.data)

    return loginResult
  } catch (error) {
    throw new Error('微信登录失败')
  }
}
