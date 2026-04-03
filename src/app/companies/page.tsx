'use client'
import { CompaniesTable } from '@/components/companies/CompaniesTable'

export default function CompaniesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
      <CompaniesTable />
    </div>
  )
}
