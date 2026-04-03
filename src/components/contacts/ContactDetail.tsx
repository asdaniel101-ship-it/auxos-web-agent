'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { Contact, ContactStatus } from '@/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Mail, Phone, Building2, Pencil, Trash2, Clock, CheckCircle2 } from 'lucide-react'

const STATUS_COLORS: Record<ContactStatus, string> = {
  lead: 'bg-blue-100 text-blue-700 border-blue-200',
  prospect: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  customer: 'bg-green-100 text-green-700 border-green-200',
  churned: 'bg-red-100 text-red-700 border-red-200',
}

interface ContactDetailProps {
  id: string
}

export function ContactDetail({ id }: ContactDetailProps) {
  const contact = useStore((s) => s.contacts.find((c) => c.id === id))
  const companies = useStore((s) => s.companies)
  const deals = useStore((s) => s.deals)
  const tasks = useStore((s) => s.tasks)
  const activities = useStore((s) => s.activities)
  const teamMembers = useStore((s) => s.teamMembers)
  const updateContact = useStore((s) => s.updateContact)
  const deleteContact = useStore((s) => s.deleteContact)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)
  const router = useRouter()

  if (!initialized) initialize()

  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Contact>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notesValue, setNotesValue] = useState<string | null>(null)

  if (!contact) {
    return (
      <div className="py-20 text-center text-slate-500">
        Contact not found.{' '}
        <Link href="/contacts" className="text-blue-600 hover:underline">
          Back to contacts
        </Link>
      </div>
    )
  }

  const company = contact.companyId ? companies.find((c) => c.id === contact.companyId) : null
  const associatedDeals = deals.filter((d) => d.contactIds.includes(id))
  const associatedTasks = tasks.filter((t) => t.linkedContactId === id)
  const contactActivities = activities
    .filter((a) => a.entityId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const displayContact = editing ? { ...contact, ...editData } : contact
  const currentNotes = notesValue !== null ? notesValue : contact.notes

  function startEdit() {
    setEditData({
      firstName: contact!.firstName,
      lastName: contact!.lastName,
      email: contact!.email,
      phone: contact!.phone,
      title: contact!.title,
      status: contact!.status,
      owner: contact!.owner,
    })
    setEditing(true)
  }

  function saveEdit() {
    updateContact(id, editData)
    setEditing(false)
    setEditData({})
  }

  function cancelEdit() {
    setEditing(false)
    setEditData({})
  }

  function handleNotesBlur() {
    if (notesValue !== null && notesValue !== contact!.notes) {
      updateContact(id, { notes: notesValue })
    }
  }

  function handleDelete() {
    deleteContact(id)
    router.push('/contacts')
  }

  function setField<K extends keyof Contact>(key: K, value: Contact[K]) {
    setEditData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-slate-900">
              {editing ? (
                <span className="flex gap-2">
                  <Input
                    value={editData.firstName ?? contact.firstName}
                    onChange={(e) => setField('firstName', e.target.value)}
                    className="w-32 text-lg font-bold"
                    aria-label="First name"
                  />
                  <Input
                    value={editData.lastName ?? contact.lastName}
                    onChange={(e) => setField('lastName', e.target.value)}
                    className="w-32 text-lg font-bold"
                    aria-label="Last name"
                  />
                </span>
              ) : (
                `${contact.firstName} ${contact.lastName}`
              )}
            </h1>
            <Badge className={STATUS_COLORS[displayContact.status as ContactStatus]}>
              {displayContact.status
                ? displayContact.status.charAt(0).toUpperCase() + displayContact.status.slice(1)
                : ''}
            </Badge>
            {displayContact.owner && (
              <Badge variant="outline" className="text-slate-600">
                {displayContact.owner}
              </Badge>
            )}
          </div>
          {editing ? (
            <Input
              value={editData.title ?? contact.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Job title"
              className="w-64 text-sm"
              aria-label="Job title"
            />
          ) : (
            contact.title && (
              <p className="text-slate-500 text-sm">{contact.title}</p>
            )
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} aria-label="Cancel editing">
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} aria-label="Save contact changes">
                Save
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={startEdit}
              aria-label="Edit contact"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete contact"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Contact info card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Email */}
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Input
                    type="email"
                    value={editData.email ?? contact.email}
                    onChange={(e) => setField('email', e.target.value)}
                    className="h-7 text-sm"
                    aria-label="Email address"
                  />
                ) : (
                  <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                    {contact.email}
                  </a>
                )}
              </div>

              {/* Phone */}
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Input
                    type="tel"
                    value={editData.phone ?? contact.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    className="h-7 text-sm"
                    aria-label="Phone number"
                  />
                ) : (
                  <span className="text-slate-700">{contact.phone || '—'}</span>
                )}
              </div>

              {/* Company */}
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {company ? (
                  <Link
                    href={`/companies/${company.id}`}
                    className="text-blue-600 hover:underline"
                    aria-label={`View company ${company.name}`}
                  >
                    {company.name}
                  </Link>
                ) : (
                  <span className="text-slate-400">No company</span>
                )}
              </div>

              {/* Status (edit mode) */}
              {editing && (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Status</Label>
                  <Select
                    value={editData.status ?? contact.status}
                    onValueChange={(v) => setField('status', v as ContactStatus)}
                  >
                    <SelectTrigger className="h-8 text-xs" aria-label="Contact status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="churned">Churned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Owner (edit mode) */}
              {editing && (
                <div className="space-y-1">
                  <Label className="text-xs text-slate-500">Owner</Label>
                  <Select
                    value={editData.owner ?? contact.owner}
                    onValueChange={(v) => setField('owner', v)}
                  >
                    <SelectTrigger className="h-8 text-xs" aria-label="Contact owner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Last Contacted */}
              {contact.lastContacted && (
                <div className="pt-1 border-t text-xs text-slate-400">
                  Last contacted: {formatDate(contact.lastContacted)}
                </div>
              )}
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
                placeholder="Add notes about this contact…"
                className="min-h-[100px] text-sm"
                aria-label="Contact notes"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Associated Deals */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Associated Deals ({associatedDeals.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {associatedDeals.length === 0 ? (
                <p className="text-sm text-slate-400 px-6 pb-4">No deals associated.</p>
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
                    {associatedDeals.map((deal) => (
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
                          <Badge variant="outline" className="text-xs">
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

          {/* Associated Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tasks ({associatedTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {associatedTasks.length === 0 ? (
                <p className="text-sm text-slate-400">No tasks linked.</p>
              ) : (
                <ul className="space-y-2">
                  {associatedTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 text-sm rounded-md border px-3 py-2"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span className={task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'}>
                        {task.name}
                      </span>
                      {task.dueDate && (
                        <span className="ml-auto text-xs text-slate-400">
                          Due {formatDate(task.dueDate)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {contactActivities.length === 0 ? (
                <p className="text-sm text-slate-400">No activity recorded yet.</p>
              ) : (
                <ol className="relative border-l border-slate-200 space-y-4 ml-3">
                  {contactActivities.map((entry) => (
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
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>
                {contact.firstName} {contact.lastName}
              </strong>
              ? This action cannot be undone.
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
              aria-label="Confirm delete contact"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
