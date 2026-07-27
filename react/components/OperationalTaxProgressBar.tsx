import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { useOrderForm } from 'vtex.order-manager/OrderForm'
import { useCssHandles } from 'vtex.css-handles'

import TaxProgressBarSkeleton from './TaxProgressBarSkeleton'
import { useSummary } from '../SummaryContext'
import {
  getOperationalTaxProgress,
  isHomeDelivery,
} from '../utils/operationalTaxProgress'

const messages = defineMessages({
  progressMessage: {
    id: 'store/checkout-summary.operational-tax-progress.message',
  },
  progressTarget: {
    id: 'store/checkout-summary.operational-tax-progress.target',
  },
})

const CSS_HANDLES = [
  'operationalTaxProgressContainer',
  'operationalTaxProgressMessage',
  'operationalTaxProgressBarRow',
  'operationalTaxProgressTrack',
  'operationalTaxProgressFill',
  'operationalTaxProgressTarget',
] as const

function OperationalTaxProgressBar() {
  const handles = useCssHandles(CSS_HANDLES)
  const { orderForm } = useOrderForm()
  const { totalizers, total, loading } = useSummary()

  const packagingValue =
    totalizers.find((totalizer) => totalizer.id === 'Packaging')?.value ?? 0

  if (packagingValue <= 0) {
    return null
  }

  const shippingData = orderForm?.shippingData

  if (isHomeDelivery(shippingData)) {
    return null
  }

  const orderTotalCents = total ?? orderForm?.value ?? 0
  const progress = getOperationalTaxProgress(orderTotalCents)

  if (!progress.show) {
    return null
  }

  const containerClassName = `${handles.operationalTaxProgressContainer} mt3`

  if (loading) {
    return <TaxProgressBarSkeleton containerClassName={containerClassName} />
  }

  return (
    <div className={containerClassName}>
      <p className={`${handles.operationalTaxProgressMessage} mt0 mb3`}>
        <FormattedMessage
          {...messages.progressMessage}
          values={{
            amount: <strong>{`${progress.remainingLabel} lei`}</strong>,
            target: <strong>taxă operațională 0 lei</strong>,
          }}
        />
      </p>
      <div
        className={`${handles.operationalTaxProgressBarRow} flex items-center`}
      >
        <div className={`${handles.operationalTaxProgressTrack} flex-auto`}>
          <div
            className={`${handles.operationalTaxProgressFill} h-100`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className={`${handles.operationalTaxProgressTarget} ml3`}>
          <FormattedMessage
            {...messages.progressTarget}
            values={{ amount: progress.thresholdLabel }}
          />
        </span>
      </div>
    </div>
  )
}

export default OperationalTaxProgressBar
