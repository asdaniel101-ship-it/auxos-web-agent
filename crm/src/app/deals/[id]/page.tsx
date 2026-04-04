'use client'

import { DealDetail } from '@/components/deals/DealDetail'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export default function DealDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Breadcrumbs />
      <DealDetail id={params.id} />
    </div>
  )
}
