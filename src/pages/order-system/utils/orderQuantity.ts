export const getOrderMultiple = (value: unknown): number => {
  const multiple = Number(value)

  if (!Number.isFinite(multiple) || multiple <= 0) {
    return 1
  }

  return Math.max(1, Math.trunc(multiple))
}

export const normalizeOrderQuantity = (value: unknown, multipleValue: unknown): number => {
  const multiple = getOrderMultiple(multipleValue)
  const quantity = Number(value)

  if (!Number.isFinite(quantity) || quantity <= 0) {
    return multiple
  }

  return Math.ceil(quantity / multiple) * multiple
}

export const isValidOrderQuantity = (value: unknown, multipleValue: unknown): boolean => {
  const multiple = getOrderMultiple(multipleValue)
  const quantity = Number(value)

  return Number.isFinite(quantity) && quantity >= multiple && quantity % multiple === 0
}
