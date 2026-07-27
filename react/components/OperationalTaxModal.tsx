import React, { useEffect } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { FormattedPrice } from 'vtex.formatted-price'
import { useCssHandles } from 'vtex.css-handles'

interface Props {
  value: number | null
  onClose: () => void
}

const messages = defineMessages({
  title: {
    id: 'store/checkout-summary.operational-tax-modal.title',
  },
  description: {
    id: 'store/checkout-summary.operational-tax-modal.description',
  },
  ok: {
    id: 'store/checkout-summary.operational-tax-modal.ok',
  },
})

const CSS_HANDLES = [
  'operationalTaxModalOverlay',
  'operationalTaxModal',
  'operationalTaxModalClose',
  'operationalTaxModalTitle',
  'operationalTaxModalDescription',
  'operationalTaxModalFeeRow',
  'operationalTaxModalFeeLabel',
  'operationalTaxModalFeeValue',
  'operationalTaxModalOkButton',
] as const

function OperationalTaxModal({ value, onClose }: Props) {
  const handles = useCssHandles(CSS_HANDLES)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className={`${handles.operationalTaxModalOverlay} fixed top-0 left-0 w-100 h-100`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${handles.operationalTaxModal} relative`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="operational-tax-modal-title"
      >
        <button
          type="button"
          className={`${handles.operationalTaxModalClose} absolute bn bg-transparent pointer pa0`}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h4
          id="operational-tax-modal-title"
          className={`${handles.operationalTaxModalTitle} mt0 mb0 tc`}
        >
          <FormattedMessage {...messages.title} />
        </h4>

        <p className={`${handles.operationalTaxModalDescription} mt0 mb0`}>
          <FormattedMessage {...messages.description} />
        </p>

        <div
          className={`${handles.operationalTaxModalFeeRow} flex items-center justify-between`}
        >
          <span className={`${handles.operationalTaxModalFeeLabel}`}>
            <FormattedMessage {...messages.title} />
          </span>
          <span className={`${handles.operationalTaxModalFeeValue}`}>
            <FormattedPrice value={value ? value / 100 : value} />
          </span>
        </div>

        <button
          type="button"
          className={`${handles.operationalTaxModalOkButton} w-100 bn pointer`}
          onClick={onClose}
        >
          <FormattedMessage {...messages.ok} />
        </button>
      </div>
    </div>
  )
}

export default OperationalTaxModal
