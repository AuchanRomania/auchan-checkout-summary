export const OPERATIONAL_TAX_FREE_THRESHOLD_CENTS = 5000

type ShippingSla = {
  id?: string
  deliveryChannel?: string
}

type LogisticsInfoEntry = {
  selectedDeliveryChannel?: string | null
  selectedSla?: string | null
  slas?: ShippingSla[]
}

type ShippingData = {
  address?: {
    addressType?: string
  }
  logisticsInfo?: LogisticsInfoEntry[]
}

export function formatNumberWithTwoDecimals(num: number): string {
  return (Math.round(num * 100) / 100).toFixed(2)
}

export function formatLeiAmount(cents: number): string {
  return formatNumberWithTwoDecimals(cents / 100).replace('.', ',')
}

function resolveDeliveryChannel(
  entry: LogisticsInfoEntry
): string | undefined {
  if (entry.selectedDeliveryChannel) {
    return entry.selectedDeliveryChannel
  }

  const selectedSla = entry.slas?.find((sla) => sla.id === entry.selectedSla)

  return selectedSla?.deliveryChannel
}

export function isPickupDelivery(shippingData?: ShippingData): boolean {
  const logisticsInfo = shippingData?.logisticsInfo ?? []

  if (!logisticsInfo.length) {
    return false
  }

  const channels = logisticsInfo
    .map((entry) => resolveDeliveryChannel(entry))
    .filter((channel): channel is string => Boolean(channel))

  if (!channels.length) {
    return false
  }

  if (channels.some((channel) => channel === 'delivery')) {
    return false
  }

  return channels.every((channel) => channel === 'pickup-in-point')
}

export function isHomeDelivery(shippingData?: ShippingData): boolean {
  if (isPickupDelivery(shippingData)) {
    return false
  }

  const logisticsInfo = shippingData?.logisticsInfo ?? []

  if (logisticsInfo.length) {
    return logisticsInfo.some((entry) => {
      const channel = resolveDeliveryChannel(entry)

      if (channel === 'delivery') {
        return true
      }

      return (
        entry.slas?.some((sla) => sla.deliveryChannel === 'delivery') ?? false
      )
    })
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
