import { httpPost } from '@/utils/http'
import { getOrderToken } from '@/utils/orderToken'

type PayParams = {
  provider: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

const pickFirst = (data: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = data?.[key]
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }

  return ''
}

const parsePayData = (data: any) => {
  let parsed = data

  for (let i = 0; i < 2 && typeof parsed === 'string'; i += 1) {
    const text = parsed.trim()

    if (!text) {
      return {}
    }

    try {
      parsed = JSON.parse(text)
    } catch {
      return parsed
    }
  }

  return parsed
}

const findPaySource = (data: any) => {
  const parsedData = parsePayData(data)
  const candidates = [
    parsedData,
    parsedData?.pay,
    parsedData?.pay_data,
    parsedData?.payData,
    parsedData?.pay_info,
    parsedData?.payInfo,
    parsedData?.payment,
    parsedData?.wxpay,
    parsedData?.config,
    parsedData?.jsApiParameters,
    parsedData?.jsapi,
  ].map(parsePayData)

  return (
    candidates.find((item) => {
      return item && (item.timeStamp || item.timestamp || item.nonceStr || item.paySign)
    }) || parsedData
  )
}

/**
 * data 的结构是下面的字符串
 * "{"appId":"wxdfe38c922cea1383","timeStamp":"1777430671","nonceStr":"9xxd30952qe1en2fewuzhvrbjnqayb6f","package":"prepay_id=wx291044312405745393a0cbe8991e140001","signType":"MD5","paySign":"18FFA0AFE0623F91E68FF7E47ED13DAE"}"
 */
const normalizePayParams = (data: any): PayParams => {
  const source = findPaySource(data) || {}
  const prepayId = pickFirst(source, ['prepay_id', 'prepayId'])
  const packageValue =
    pickFirst(source, ['package', 'packageValue', 'package_value']) ||
    (prepayId ? `prepay_id=${prepayId}` : '')

  const params = {
    provider: pickFirst(source, ['provider']) || 'wxpay',
    timeStamp: String(pickFirst(source, ['timeStamp', 'timestamp', 'time_stamp'])),
    nonceStr: String(pickFirst(source, ['nonceStr', 'nonce_str', 'noncestr'])),
    package: String(packageValue),
    signType: String(pickFirst(source, ['signType', 'sign_type']) || 'MD5'),
    paySign: String(pickFirst(source, ['paySign', 'pay_sign', 'sign'])),
  }

  if (!params.timeStamp || !params.nonceStr || !params.package || !params.paySign) {
    throw new Error('支付参数不完整')
  }

  return params
}

const requestPayment = (params: PayParams) => {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      ...(params as any),
      success: resolve,
      fail: reject,
    })
  })
}

export const payGoodsOrder = async (orderNo: string) => {
  if (!orderNo) {
    throw new Error('订单编号不能为空')
  }

  const res = await httpPost('/api/OrderPay/goodsOrderPay', {
    order_no: orderNo,
    token_order: getOrderToken(),
  })

  const params = normalizePayParams(res.data)
  await requestPayment(params)
}

export const isPaymentCancel = (error: unknown) => {
  const message =
    typeof error === 'string'
      ? error
      : error instanceof Error
        ? error.message
        : String((error as any)?.errMsg || '')

  return message.includes('cancel')
}

export const getPaymentErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  const errMsg = (error as any)?.errMsg
  if (typeof errMsg === 'string' && errMsg) {
    return errMsg
  }

  return '支付失败，请稍后重试'
}
