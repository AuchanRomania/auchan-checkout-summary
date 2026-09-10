import { useEffect, useMemo, useRef, useState } from 'react'
import { useOrderForm } from 'vtex.order-manager/OrderForm'

import { VtexLogisticsInfoEntry } from '../utils/shippingBreakdown'

const GET_FULL_CART_URL = '/api/checkout/pub/orderForm'
const DEBOUNCE_TIME_MS = 1000

export type ResolvedLogisticsInfoEntry = VtexLogisticsInfoEntry & {
  selectedDeliveryChannel?: string | null
}

export type ResolvedShippingData = {
  address?: {
    addressType?: string
  }
  logisticsInfo?: ResolvedLogisticsInfoEntry[]
}

/**
 * Minicart orderForm often omits logisticsInfo. Fetch the full orderForm so
 * pickup vs LAD detection is reliable for progress bars.
 */
export function useResolvedShippingData() {
  const { orderForm, loading: orderFormLoading } = useOrderForm()
  const [fullCartShippingData, setFullCartShippingData] = useState<
    ResolvedShippingData | undefined
  >()
  const [fullCartLoading, setFullCartLoading] = useState(true)
  const firstRun = useRef(true)

  const hasLogisticsInfo = Boolean(
    orderForm?.shippingData?.logisticsInfo?.length
  )

  const refreshKey = useMemo(() => {
    if (!orderForm) {
      return ''
    }

    const itemsKey = (orderForm.items ?? [])
      .map((item: { id?: string; quantity?: number }) =>
        `${item.id}:${item.quantity}`
      )
      .join('|')

    const logisticsKey = (orderForm.shippingData?.logisticsInfo ?? [])
      .map(
        (entry: {
          itemIndex?: number
          selectedSla?: string | null
          selectedDeliveryChannel?: string | null
        }) =>
          `${entry.itemIndex}:${entry.selectedSla}:${
            entry.selectedDeliveryChannel ?? ''
          }`
      )
      .join('|')

    return [orderForm.value, itemsKey, logisticsKey].join('::')
  }, [orderForm])

  useEffect(() => {
    let cancelled = false

    if (hasLogisticsInfo) {
      firstRun.current = false
      setFullCartLoading(false)

      return () => {
        cancelled = true
      }
    }

    const fetchFullCart = () => {
      setFullCartLoading(true)

      fetch(GET_FULL_CART_URL, {
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => response.json())
        .then((fullCart: { shippingData?: ResolvedShippingData }) => {
          if (!cancelled) {
            setFullCartShippingData(fullCart?.shippingData)
          }
        })
        .catch(() => undefined)
        .finally(() => {
          if (!cancelled) {
            setFullCartLoading(false)
          }
        })
    }

    if (firstRun.current) {
      firstRun.current = false
      fetchFullCart()

      return () => {
        cancelled = true
      }
    }

    const timeoutId = window.setTimeout(fetchFullCart, DEBOUNCE_TIME_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [refreshKey, hasLogisticsInfo])

  const shippingData = useMemo<ResolvedShippingData | undefined>(() => {
    if (orderForm?.shippingData?.logisticsInfo?.length) {
      return orderForm.shippingData as ResolvedShippingData
    }

    return fullCartShippingData
  }, [orderForm, fullCartShippingData])

  return {
    shippingData,
    loading: orderFormLoading || (hasLogisticsInfo ? false : fullCartLoading),
  }
}
