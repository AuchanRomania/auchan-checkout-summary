import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useCssHandles } from 'vtex.css-handles'

import TaxProgressBarSkeleton from './TaxProgressBarSkeleton'
import { useSummary } from '../SummaryContext'
import { useResolvedShippingData } from '../hooks/useResolvedShippingData'
import {
  getDeliveryTaxFreeStatus,
  getDeliveryTaxProgress,
} from '../utils/deliveryTaxProgress'
import { isHomeDelivery } from '../utils/operationalTaxProgress'

const messages = defineMessages({
  progressMessage: {
    id: 'store/checkout-summary.delivery-tax-progress.message',
  },
  progressTarget: {
    id: 'store/checkout-summary.delivery-tax-progress.target',
  },
})

const CSS_HANDLES = [
  'deliveryTaxProgressContainer',
  'deliveryTaxProgressMessage',
  'deliveryTaxProgressBarRow',
  'deliveryTaxProgressTrack',
  'deliveryTaxProgressFill',
  'deliveryTaxProgressTarget',
] as const

function DeliveryTaxProgressBar() {
  const handles = useCssHandles(CSS_HANDLES)
  const { orderForm } = useOrderForm()
  const { total, loading } = useSummary()
  const { shippingData, loading: shippingLoading } = useResolvedShippingData()

  if (shippingLoading || !isHomeDelivery(shippingData)) {
    return null
  }

  const orderTotalCents = total ?? orderForm?.value ?? 0
  const deliveryTaxFreeStatus = getDeliveryTaxFreeStatus(
    shippingData?.logisticsInfo,
    { summaryLoading: loading }
  )
  const progress = getDeliveryTaxProgress(
    orderTotalCents,
    deliveryTaxFreeStatus
  )

  if (!progress.show && !progress.loading) {
    return null
  }

  const containerClassName = `${handles.deliveryTaxProgressContainer} mt3`

  if (progress.loading) {
    return <TaxProgressBarSkeleton containerClassName={containerClassName} />
  }

  return (
    <div className={containerClassName}>
      <p className={`${handles.deliveryTaxProgressMessage} mt0 mb3`}>
        <FormattedMessage
          {...messages.progressMessage}
          values={{
            amount: <strong>{`${progress.remainingLabel} lei`}</strong>,
            target: <strong>taxă de livrare 0 lei</strong>,
          }}
        />
      </p>
      <div
        className={`${handles.deliveryTaxProgressBarRow} flex items-center`}
      >
        <div className={`${handles.deliveryTaxProgressTrack} flex-auto`}>
          <div
            className={`${handles.deliveryTaxProgressFill} h-100`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className={`${handles.deliveryTaxProgressTarget} ml3`}>
          <FormattedMessage
            {...messages.progressTarget}
            values={{ amount: progress.thresholdLabel }}
          />
        </span>
      </div>
    </div>
  )
}

export default DeliveryTaxProgressBar
