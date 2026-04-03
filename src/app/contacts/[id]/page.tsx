'use client'
import { ContactDetail } from '@/components/contacts/ContactDetail'
import { Breadcrumbs } from '@/components/layout/Breadcrumbs'

export default function ContactDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <Breadcrumbs />
      <ContactDetail id={params.id} />
    </div>
  )
}
