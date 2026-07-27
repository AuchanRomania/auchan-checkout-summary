export const OPERATIONAL_TAX_FREE_THRESHOLD_CENTS = 5000

type ShippingData = {
  address?: {
    addressType?: string
  }
  logisticsInfo?: Array<{
    selectedDeliveryChannel?: string
  }>
}

export function formatNumberWithTwoDecimals(num: number): string {
  return (Math.round(num * 100) / 100).toFixed(2)
}

export function formatLeiAmount(cents: number): string {
  return formatNumberWithTwoDecimals(cents / 100).replace('.', ',')
}

export function isPickupDelivery(shippingData?: ShippingData): boolean {
  return !isHomeDelivery(shippingData)
}

export function isHomeDelivery(shippingData?: ShippingData): boolean {
  const logisticsInfo = shippingData?.logisticsInfo ?? []

  if (logisticsInfo.length) {
    return logisticsInfo.some(
      (entry) => entry.selectedDeliveryChannel === 'delivery'
    )
  }

  return (
    shippingData?.address?.addressType === 'residential' ||
    shippingData?.address?.addressType === 'commercial'
  )
}

export function getOperationalTaxProgress(orderTotalCents: number) {
  const thresholdCents = OPERATIONAL_TAX_FREE_THRESHOLD_CENTS
  const remainingCents = Math.max(thresholdCents - orderTotalCents, 0)
  const percent = Math.min((orderTotalCents / thresholdCents) * 100, 100)

  return {
    show: orderTotalCents < thresholdCents,
    percent,
    remainingCents,
    remainingLabel: formatLeiAmount(remainingCents),
    thresholdLabel: formatLeiAmount(thresholdCents),
  }
}
