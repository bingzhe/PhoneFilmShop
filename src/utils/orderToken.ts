/**
 * 订单令牌工具类，支持过期时间
 */

interface TokenData {
  value: string
  expireTime: number
}

/**
 * 获取订单令牌
 * @returns 订单令牌，如果已过期或不存在则返回null
 */
export const getOrderToken = (): string | null => {
  const tokenDataStr = uni.getStorageSync('orderToken') as string | null
  if (!tokenDataStr) {
    return null
  }

  const tokenData = JSON.parse(tokenDataStr) as TokenData | null

  if (!tokenData) {
    return null
  }

  // 检查是否过期
  const now = Date.now()
  if (now > tokenData.expireTime) {
    // 令牌已过期，删除它
    uni.removeStorageSync('orderToken')
    return null
  }

  return tokenData.value
}

/**
 * 设置订单令牌
 * @param token 令牌值
 * @param expireDays 过期天数，默认1天
 */
export const setOrderToken = (token: string, expireDays: number = 1): void => {
  const expireTime = Date.now() + expireDays * 24 * 60 * 60 * 1000

  const tokenData: TokenData = {
    value: token,
    expireTime,
  }
  const tokenDataStr = JSON.stringify(tokenData)

  uni.setStorageSync('orderToken', tokenDataStr)
}

/**
 * 清除订单令牌
 */
export const clearOrderToken = () => {
  uni.removeStorageSync('orderToken')
}
