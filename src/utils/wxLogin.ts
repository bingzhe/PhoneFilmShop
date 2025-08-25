import { httpPost } from './http'
import { useUserStore } from '@/store/user'
import { setOrderToken, clearOrderToken } from './orderToken'

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
  return httpPost<string>('/api/WxLogin/getOpenid', { code, is_order: 0 })
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
    console.error('wxLogin error->', error)
    throw new Error('微信登录失败')
  }
}

/**
 * 商城登录
 */
export const wxLoginOrder = async () => {
  try {
    const { code } = await getWxLoginCode()

    const openIdResult = await httpPost<any>('/api/WxLogin/getOpenid', { code, is_order: 1 })

    const token = openIdResult.data
    const openid = openIdResult.data.openid

    if (openid) {
      clearOrderToken()
      uni.reLaunch({
        url: `/pages/order-system-home/order-system-home`,
      })
      return false
    } else if (token) {
      const userResult = await httpPost<any>('/api/UsersInfo/index', { token })

      const status = userResult.data?.status

      // status 等于1是正常用户
      // eslint-disable-next-line eqeqeq
      if (status == 1) {
        setOrderToken(token, 7)
      } else {
        clearOrderToken()
      }

      uni.switchTab({
        url: '/pages/order-system/category/category',
      })
    }
  } catch (error) {
    console.error('wxLoginOrder error->', error)
    throw new Error('商城微信登录失败')
  }
}

// 注册时候取Openid
export const registerGetOpenid = async () => {
  return new Promise(function (resolve, reject) {
    uni.login({
      success: async function (res) {
        const code = res.code

        const openIdResult = await httpPost<any>('/api/WxLogin/getOpenid', { code, is_order: 1 })
        const openid = openIdResult.data.openid

        // if (token) {
        //   wx.showToast({
        //     title: "该微信以及注册过账号",
        //     icon: "none",
        //     duration: 1500,
        //   });
        // }

        if (openid) {
          resolve(openid)
        }
      },
      fail: function (err) {
        reject(err)
      },
    })
  })
}
