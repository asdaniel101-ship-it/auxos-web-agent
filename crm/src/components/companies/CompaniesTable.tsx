'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/store'
import { formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CompanyForm } from './CompanyForm'
import { Search, Plus } from 'lucide-react'

const CLOSED_STAGES = new Set(['Closed Won', 'Closed Lost'])

export function CompaniesTable() {
  const companies = useStore((s) => s.companies)
  const contacts = useStore((s) => s.contacts)
  const deals = useStore((s) => s.deals)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)

  if (!initialized) initialize()

  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase()
    return !search || c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search by name or industry…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search companies"
          />
        </div>

        <Button
          onClick={() => setFormOpen(true)}
          aria-label="Add new company"
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead className="text-right"># Contacts</TableHead>
              <TableHead className="text-right"># Open Deals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-10">
                  No companies found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((company) => {
                const contactCount = contacts.filter((ct) => ct.companyId === company.id).length
                const openDealCount = deals.filter(
                  (d) => d.companyId === company.id && !CLOSED_STAGES.has(d.stage)
                ).length

                return (
                  <TableRow key={company.id} className="cursor-pointer">
                    <TableCell>
                      <Link
                        href={`/companies/${company.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                        aria-label={`View ${company.name}`}
                      >
                        {company.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {company.industry ? (
                        <Badge variant="outline" className="text-slate-600">
                          {company.industry}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{company.size || '—'}</TableCell>
                    <TableCell className="text-slate-600">
                      {company.revenue ? formatCurrency(company.revenue) : '—'}
                    </TableCell>
                    <TableCell className="text-right text-slate-600">{contactCount}</TableCell>
                    <TableCell className="text-right text-slate-600">{openDealCount}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <CompanyForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
