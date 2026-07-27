import React from 'react'
import { useCssHandles } from 'vtex.css-handles'

import '../styles.css'

const CSS_HANDLES = ['taxProgressSkeletonContent'] as const

interface Props {
  containerClassName: string
}

function TaxProgressBarSkeleton({ containerClassName }: Props) {
  const handles = useCssHandles(CSS_HANDLES)

  return (
    <div className={containerClassName} aria-hidden>
      <div className={handles.taxProgressSkeletonContent} />
    </div>
  )
}

export default TaxProgressBarSkeleton
