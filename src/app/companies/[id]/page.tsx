'use client'
import { CompanyDetail } from '@/components/companies/CompanyDetail'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Breadcrumbs />
      <CompanyDetail id={params.id} />
    </div>
  )
}
