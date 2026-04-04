'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/store'
import { Contact, ContactStatus } from '@/types'
import { formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ContactForm } from './ContactForm'
import { Search, Plus, UserCheck } from 'lucide-react'

const STATUS_COLORS: Record<ContactStatus, string> = {
  lead: 'bg-blue-100 text-blue-700 border-blue-200',
  prospect: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  customer: 'bg-green-100 text-green-700 border-green-200',
  churned: 'bg-red-100 text-red-700 border-red-200',
}

export function ContactsTable() {
  const contacts = useStore((s) => s.contacts)
  const companies = useStore((s) => s.companies)
  const teamMembers = useStore((s) => s.teamMembers)
  const bulkUpdateContacts = useStore((s) => s.bulkUpdateContacts)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)

  if (!initialized) initialize()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [formOpen, setFormOpen] = useState(false)

  const companyMap = new Map(companies.map((c) => [c.id, c.name]))

  const filtered = contacts.filter((c) => {
    const companyName = c.companyId ? (companyMap.get(c.companyId) ?? '') : ''
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      companyName.toLowerCase().includes(q)

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesOwner = ownerFilter === 'all' || c.owner === ownerFilter

    return matchesSearch && matchesStatus && matchesOwner
  })

  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id))
  const someSelected = selectedIds.size > 0

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)))
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleBulkOwner(owner: string) {
    bulkUpdateContacts(Array.from(selectedIds), { owner })
    setSelectedIds(new Set())
  }

  function handleBulkStatus(status: ContactStatus) {
    bulkUpdateContacts(Array.from(selectedIds), { status })
    setSelectedIds(new Set())
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Search by name, email, or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search contacts"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="prospect">Prospect</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="churned">Churned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-44" aria-label="Filter by owner">
            <SelectValue placeholder="Owner" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All owners</SelectItem>
            {teamMembers.map((m) => (
              <SelectItem key={m.id} value={m.name}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => setFormOpen(true)}
          aria-label="Add new contact"
          className="ml-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Bulk actions bar */}
      {someSelected && (
        <div className="flex items-center gap-3 rounded-md bg-slate-50 border px-4 py-2">
          <UserCheck className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600 mr-2">
            {selectedIds.size} selected
          </span>

          <Select onValueChange={handleBulkOwner}>
            <SelectTrigger className="w-44 h-8 text-xs" aria-label="Bulk assign owner">
              <SelectValue placeholder="Assign owner…" />
            </SelectTrigger>
            <SelectContent>
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => handleBulkStatus(v as ContactStatus)}>
            <SelectTrigger className="w-40 h-8 text-xs" aria-label="Bulk change status">
              <SelectValue placeholder="Change status…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
            aria-label="Clear selection"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all contacts"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead>Owner</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-10">
                  No contacts found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((contact) => {
                const companyName = contact.companyId
                  ? (companyMap.get(contact.companyId) ?? '—')
                  : '—'
                return (
                  <TableRow
                    key={contact.id}
                    data-contact-id={contact.id}
                    data-state={selectedIds.has(contact.id) ? 'selected' : undefined}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(contact.id)}
                        onCheckedChange={() => toggleOne(contact.id)}
                        aria-label={`Select ${contact.firstName} ${contact.lastName}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/contacts/${contact.id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                        aria-label={`View ${contact.firstName} ${contact.lastName}`}
                      >
                        {contact.firstName} {contact.lastName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-slate-600">{contact.email}</TableCell>
                    <TableCell className="text-slate-600">{contact.phone || '—'}</TableCell>
                    <TableCell className="text-slate-600">{companyName}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[contact.status]}>
                        {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {contact.lastContacted ? formatDate(contact.lastContacted) : '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">{contact.owner}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ContactForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
