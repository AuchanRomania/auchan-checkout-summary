import React, { Fragment } from 'react'
import { Loading } from 'vtex.render-runtime'

import SummaryItem from './components/SummaryItem'
import OperationalTaxProgressBar from './components/OperationalTaxProgressBar'
import DeliveryTaxProgressBar from './components/DeliveryTaxProgressBar'
import { Totalizer } from './modules/types'
import { useSummary } from './SummaryContext'
import './styles.css'

const minTotalizerValue = 0
const tba = null
const shippingData = {
  id: 'Shipping',
  name: '',
  value: tba,
  __typename: 'Totalizer',
}

const isShippingPresent = (totalizers: Totalizer[]) => {
  return totalizers.some((t) => t.id === 'Shipping')
}

interface Props {
  showTotal?: boolean
  showDeliveryTotal?: boolean
  showOriginalTotal?: boolean
}

function SummaryTotalizers({
  showTotal = true,
  showDeliveryTotal = true,
  showOriginalTotal = false,
}: Props) {
  const { loading, totalizers, total, originalTotal } = useSummary()

  if (loading) {
    return (
      <Fragment>
        <Loading />
        <OperationalTaxProgressBar />
        {showDeliveryTotal && <DeliveryTaxProgressBar />}
      </Fragment>
    )
  }

  if (!isShippingPresent(totalizers) && showDeliveryTotal) {
    totalizers.push(shippingData)
  }

  const orderHasNoValue = totalizers.length === 0

  return (
    <Fragment>
      {totalizers.map((totalizer) => (
        <SummaryItem
          key={totalizer.id}
          label={totalizer.id}
          name={totalizer.id === 'CustomTax' ? totalizer.name : ''}
          value={totalizer.value}
          originalValue={showOriginalTotal ? originalTotal : 0}
          large={false}
        />
      ))}

      <OperationalTaxProgressBar />
      {showDeliveryTotal && <DeliveryTaxProgressBar />}

      {showTotal && (
        <SummaryItem
          label="Total"
          value={orderHasNoValue ? null : total || minTotalizerValue}
          large
        />
      )}
    </Fragment>
  )
}

export default SummaryTotalizers
