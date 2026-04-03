'use client'
import { ContactsTable } from '@/components/contacts/ContactsTable'

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
      <ContactsTable />
    </div>
  )
}
