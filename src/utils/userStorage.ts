/**
 * 保存用户名到本地存储
 * @param username 用户名
 */
export const saveUsername = (username: string): void => {
  uni.setStorageSync('lastUsername', username)
}

/**
 * 从本地存储获取用户名
 * @returns 上次登录的用户名，如果不存在返回空字符串
 */
export const getLastUsername = (): string => {
  const username = uni.getStorageSync('lastUsername')
  return username || ''
}
