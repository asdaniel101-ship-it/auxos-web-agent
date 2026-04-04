'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { Company } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Globe,
  MapPin,
  DollarSign,
  Users,
  Pencil,
  Trash2,
} from 'lucide-react'

const CLOSED_STAGES = new Set(['Closed Won', 'Closed Lost'])

interface CompanyDetailProps {
  id: string
}

export function CompanyDetail({ id }: CompanyDetailProps) {
  const company = useStore((s) => s.companies.find((c) => c.id === id))
  const contacts = useStore((s) => s.contacts)
  const deals = useStore((s) => s.deals)
  const activities = useStore((s) => s.activities)
  const updateCompany = useStore((s) => s.updateCompany)
  const deleteCompany = useStore((s) => s.deleteCompany)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)
  const router = useRouter()

  if (!initialized) initialize()

  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Company>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notesValue, setNotesValue] = useState<string | null>(null)

  if (!company) {
    return (
      <div className="py-20 text-center text-slate-500">
        Company not found.{' '}
        <Link href="/companies" className="text-blue-600 hover:underline">
          Back to companies
        </Link>
      </div>
    )
  }

  const companyContacts = contacts.filter((ct) => ct.companyId === id)
  const companyDeals = deals.filter((d) => d.companyId === id)
  const companyActivities = activities
    .filter((a) => a.entityId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const currentNotes = notesValue !== null ? notesValue : company.notes

  function startEdit() {
    setEditData({
      name: company!.name,
      industry: company!.industry,
      size: company!.size,
      revenue: company!.revenue,
      website: company!.website,
      address: company!.address,
    })
    setEditing(true)
  }

  function saveEdit() {
    updateCompany(id, editData)
    setEditing(false)
    setEditData({})
  }

  function cancelEdit() {
    setEditing(false)
    setEditData({})
  }

  function setField<K extends keyof Company>(key: K, value: Company[K]) {
    setEditData((prev) => ({ ...prev, [key]: value }))
  }

  function handleNotesBlur() {
    if (notesValue !== null && notesValue !== company!.notes) {
      updateCompany(id, { notes: notesValue })
    }
  }

  function handleDelete() {
    deleteCompany(id)
    router.push('/companies')
  }

  const displayCompany = editing ? { ...company, ...editData } : company

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-slate-900">
              {editing ? (
                <Input
                  value={editData.name ?? company.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="text-lg font-bold w-72"
                  aria-label="Company name"
                />
              ) : (
                company.name
              )}
            </h1>
            {displayCompany.industry && (
              <Badge variant="outline" className="text-slate-600">
                {displayCompany.industry}
              </Badge>
            )}
          </div>
          {displayCompany.size && (
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {displayCompany.size} employees
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} aria-label="Cancel editing">
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} aria-label="Save company changes">
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEdit} aria-label="Edit company">
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete company"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Company info card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Company Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Revenue */}
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Input
                    type="number"
                    value={editData.revenue ?? company.revenue}
                    onChange={(e) => setField('revenue', Number(e.target.value))}
                    className="h-7 text-sm"
                    aria-label="Annual revenue"
                    placeholder="Revenue"
                  />
                ) : (
                  <span className="text-slate-700">
                    {company.revenue ? formatCurrency(company.revenue) : '—'}
                  </span>
                )}
              </div>

              {/* Website */}
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Input
                    type="url"
                    value={editData.website ?? company.website}
                    onChange={(e) => setField('website', e.target.value)}
                    className="h-7 text-sm"
                    aria-label="Company website"
                    placeholder="https://example.com"
                  />
                ) : company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                  >
                    {company.website}
                  </a>
                ) : (
                  <span className="text-slate-400">No website</span>
                )}
              </div>

              {/* Address */}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Input
                    value={editData.address ?? company.address}
                    onChange={(e) => setField('address', e.target.value)}
                    className="h-7 text-sm"
                    aria-label="Company address"
                    placeholder="123 Main St, City, State"
                  />
                ) : (
                  <span className="text-slate-700">{company.address || '—'}</span>
                )}
              </div>

              {/* Size (edit mode) */}
              {editing && (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Company Size</Label>
                  <Input
                    value={editData.size ?? company.size}
                    onChange={(e) => setField('size', e.target.value)}
                    className="h-8 text-xs"
                    aria-label="Company size"
                    placeholder="e.g. 51-200"
                  />
                </div>
              )}

              {/* Industry (edit mode) */}
              {editing && (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Industry</Label>
                  <Input
                    value={editData.industry ?? company.industry}
                    onChange={(e) => setField('industry', e.target.value)}
                    className="h-8 text-xs"
                    aria-label="Company industry"
                    placeholder="e.g. Technology"
                  />
                </div>
              )}

              {/* Created date */}
              <div className="pt-1 border-t text-xs text-slate-400">
                Added: {formatDate(company.createdAt)}
              </div>
            </CardContent>
          </Card>

          {/* Notes card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentNotes}
                onChange={(e) => setNotesValue(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes about this company…"
                className="min-h-[100px] text-sm"
                aria-label="Company notes"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contacts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Contacts ({companyContacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {companyContacts.length === 0 ? (
                <p className="text-sm text-slate-400 px-6 pb-4">No contacts at this company.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                            aria-label={`View ${contact.firstName} ${contact.lastName}`}
                          >
                            {contact.firstName} {contact.lastName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-slate-600">{contact.title || '—'}</TableCell>
                        <TableCell className="text-slate-600">{contact.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs capitalize">
                            {contact.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Deals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Deals ({companyDeals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {companyDeals.length === 0 ? (
                <p className="text-sm text-slate-400 px-6 pb-4">No deals for this company.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Deal</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Close Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companyDeals.map((deal) => (
                      <TableRow key={deal.id}>
                        <TableCell>
                          <Link
                            href={`/deals/${deal.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                            aria-label={`View deal ${deal.name}`}
                          >
                            {deal.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              CLOSED_STAGES.has(deal.stage)
                                ? deal.stage === 'Closed Won'
                                  ? 'text-green-700 border-green-200 bg-green-50'
                                  : 'text-red-700 border-red-200 bg-red-50'
                                : 'text-slate-600'
                            }
                          >
                            {deal.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatCurrency(deal.value)}
                        </TableCell>
                        <TableCell className="text-slate-600">
                          {formatDate(deal.closeDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {companyActivities.length === 0 ? (
                <p className="text-sm text-slate-400">No activity recorded yet.</p>
              ) : (
                <ol className="relative border-l border-slate-200 space-y-4 ml-3">
                  {companyActivities.map((entry) => (
                    <li key={entry.id} className="ml-4">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-300" />
                      <p className="text-sm text-slate-700">{entry.description}</p>
                      <time className="text-xs text-slate-400">
                        {formatDate(entry.timestamp)}
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              aria-label="Cancel deletion"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              aria-label="Confirm delete company"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
