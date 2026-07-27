import { formatLeiAmount } from './operationalTaxProgress'
import {
  breakdownFromLogisticsInfo,
  VtexLogisticsInfoEntry,
} from './shippingBreakdown'

export const DELIVERY_TAX_FREE_THRESHOLD_CENTS = 20000

export type DeliveryTaxFreeStatus = 'pending' | 'free' | 'not-free'

export function getDeliveryTaxFreeStatus(
  logisticsInfo?: VtexLogisticsInfoEntry[],
  options?: { summaryLoading?: boolean; cartLoading?: boolean }
): DeliveryTaxFreeStatus {
  if (options?.summaryLoading || options?.cartLoading) {
    return 'pending'
  }

  const breakdownResult = breakdownFromLogisticsInfo(logisticsInfo ?? [])

  if (breakdownResult.status === 'pending') {
    return 'pending'
  }

  if (
    breakdownResult.status === 'ready' &&
    breakdownResult.breakdown.freeShipping
  ) {
    return 'free'
  }

  return 'not-free'
}

export function getDeliveryTaxProgress(
  orderTotalCents: number,
  deliveryTaxFreeStatus: DeliveryTaxFreeStatus = 'not-free'
) {
  const thresholdCents = DELIVERY_TAX_FREE_THRESHOLD_CENTS
  const remainingCents = Math.max(thresholdCents - orderTotalCents, 0)
  const percent = Math.min((orderTotalCents / thresholdCents) * 100, 100)

  const underThreshold = orderTotalCents < thresholdCents

  return {
    show:
      deliveryTaxFreeStatus === 'not-free' && underThreshold,
    loading: deliveryTaxFreeStatus === 'pending' && underThreshold,
    percent,
    remainingCents,
    remainingLabel: formatLeiAmount(remainingCents),
    thresholdLabel: formatLeiAmount(thresholdCents),
  }
}
