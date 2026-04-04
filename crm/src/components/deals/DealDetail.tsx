'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store'
import { Deal, DealStage } from '@/types'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
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
import {
  Building2,
  User,
  CalendarDays,
  Percent,
  TrendingUp,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
} from 'lucide-react'

const STAGES: DealStage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
]

const STAGE_BADGE_COLORS: Record<DealStage, string> = {
  Prospecting: 'bg-slate-100 text-slate-700 border-slate-200',
  Qualification: 'bg-blue-100 text-blue-700 border-blue-200',
  Proposal: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Negotiation: 'bg-orange-100 text-orange-700 border-orange-200',
  'Closed Won': 'bg-green-100 text-green-700 border-green-200',
  'Closed Lost': 'bg-red-100 text-red-700 border-red-200',
}

const STAGE_PROGRESS: Record<DealStage, number> = {
  Prospecting: 10,
  Qualification: 25,
  Proposal: 50,
  Negotiation: 75,
  'Closed Won': 100,
  'Closed Lost': 100,
}

const STAGE_PROGRESS_COLOR: Record<DealStage, string> = {
  Prospecting: 'bg-slate-400',
  Qualification: 'bg-blue-400',
  Proposal: 'bg-yellow-400',
  Negotiation: 'bg-orange-400',
  'Closed Won': 'bg-green-500',
  'Closed Lost': 'bg-red-400',
}

interface DealDetailProps {
  id: string
}

export function DealDetail({ id }: DealDetailProps) {
  const deal = useStore((s) => s.deals.find((d) => d.id === id))
  const companies = useStore((s) => s.companies)
  const contacts = useStore((s) => s.contacts)
  const tasks = useStore((s) => s.tasks)
  const activities = useStore((s) => s.activities)
  const teamMembers = useStore((s) => s.teamMembers)
  const updateDeal = useStore((s) => s.updateDeal)
  const deleteDeal = useStore((s) => s.deleteDeal)
  const moveDealStage = useStore((s) => s.moveDealStage)
  const addActivity = useStore((s) => s.addActivity)
  const initialize = useStore((s) => s.initialize)
  const initialized = useStore((s) => s.initialized)
  const router = useRouter()

  if (!initialized) initialize()

  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Deal>>({})
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notesValue, setNotesValue] = useState<string | null>(null)

  if (!deal) {
    return (
      <div className="py-20 text-center text-slate-500">
        Deal not found.{' '}
        <Link href="/deals" className="text-blue-600 hover:underline">
          Back to deals
        </Link>
      </div>
    )
  }

  const company = deal.companyId ? companies.find((c) => c.id === deal.companyId) : null
  const associatedContacts = contacts.filter((c) => deal.contactIds.includes(c.id))
  const dealTasks = tasks.filter((t) => t.linkedDealId === id)
  const dealActivities = activities
    .filter((a) => a.entityId === id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const displayDeal = editing ? { ...deal, ...editData } : deal
  const currentNotes = notesValue !== null ? notesValue : deal.notes

  function startEdit() {
    setEditData({
      name: deal!.name,
      value: deal!.value,
      owner: deal!.owner,
      closeDate: deal!.closeDate,
      probability: deal!.probability,
      companyId: deal!.companyId,
    })
    setEditing(true)
  }

  function saveEdit() {
    updateDeal(id, editData)
    addActivity({
      type: 'deal_updated',
      description: `Deal "${deal!.name}" was updated`,
      entityType: 'deal',
      entityId: id,
      userId: deal!.owner,
    })
    setEditing(false)
    setEditData({})
  }

  function cancelEdit() {
    setEditing(false)
    setEditData({})
  }

  function handleNotesBlur() {
    if (notesValue !== null && notesValue !== deal!.notes) {
      updateDeal(id, { notes: notesValue })
      addActivity({
        type: 'note_added',
        description: `Note added to deal "${deal!.name}"`,
        entityType: 'deal',
        entityId: id,
        userId: deal!.owner,
      })
    }
  }

  function handleStageChange(newStage: DealStage) {
    if (newStage === deal!.stage) return
    moveDealStage(id, newStage)
    addActivity({
      type: 'deal_stage_changed',
      description: `Deal "${deal!.name}" moved from ${deal!.stage} to ${newStage}`,
      entityType: 'deal',
      entityId: id,
      userId: deal!.owner,
    })
  }

  function handleDelete() {
    deleteDeal(id)
    router.push('/deals')
  }

  function setField<K extends keyof Deal>(key: K, value: Deal[K]) {
    setEditData((prev) => ({ ...prev, [key]: value }))
  }

  const stageProgress = STAGE_PROGRESS[deal.stage]
  const stageProgressColor = STAGE_PROGRESS_COLOR[deal.stage]

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          {editing ? (
            <Input
              value={editData.name ?? deal.name}
              onChange={(e) => setField('name', e.target.value)}
              className="text-2xl font-bold h-auto py-1 text-slate-900"
              aria-label="Deal name"
            />
          ) : (
            <h1 className="text-3xl font-bold text-slate-900 truncate">{deal.name}</h1>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {editing ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-sm">$</span>
                <Input
                  type="number"
                  min={0}
                  value={editData.value ?? deal.value}
                  onChange={(e) => setField('value', Number(e.target.value))}
                  className="w-36 h-8 text-sm"
                  aria-label="Deal value"
                />
              </div>
            ) : (
              <span className="text-2xl font-bold text-green-600">{formatCurrency(deal.value)}</span>
            )}
            <Badge className={STAGE_BADGE_COLORS[deal.stage]} variant="outline">
              {deal.stage}
            </Badge>
          </div>

          {/* Stage progress bar */}
          <div className="space-y-1 max-w-md">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', stageProgressColor)}
                style={{ width: `${stageProgress}%` }}
                aria-label={`Stage progress: ${stageProgress}%`}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              {STAGES.filter((s) => s !== 'Closed Lost').map((s) => (
                <span
                  key={s}
                  className={cn(
                    'truncate',
                    s === deal.stage && 'text-slate-700 font-medium'
                  )}
                >
                  {s === 'Closed Won' ? 'Won' : s.substring(0, 3)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEdit} aria-label="Cancel editing">
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit} aria-label="Save deal changes">
                Save
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startEdit} aria-label="Edit deal">
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            aria-label="Delete deal"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">
          {/* Deal info card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Deal Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* Change stage */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Stage
                </Label>
                <Select value={deal.stage} onValueChange={(v) => handleStageChange(v as DealStage)}>
                  <SelectTrigger className="h-8 text-xs" aria-label="Change deal stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Owner */}
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Select
                    value={editData.owner ?? deal.owner}
                    onValueChange={(v) => setField('owner', v)}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1" aria-label="Deal owner">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((m) => (
                        <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-slate-700">{deal.owner || '—'}</span>
                )}
              </div>

              {/* Close date */}
              <div className="flex items-start gap-2">
                <CalendarDays className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Input
                    type="date"
                    value={(editData.closeDate ?? deal.closeDate)?.substring(0, 10)}
                    onChange={(e) => setField('closeDate', e.target.value)}
                    className="h-7 text-xs flex-1"
                    aria-label="Close date"
                  />
                ) : (
                  <span className="text-slate-700">
                    {deal.closeDate ? formatDate(deal.closeDate) : '—'}
                  </span>
                )}
              </div>

              {/* Probability */}
              <div className="flex items-start gap-2">
                <Percent className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={editData.probability ?? deal.probability}
                    onChange={(e) => setField('probability', Number(e.target.value))}
                    className="h-7 text-xs flex-1"
                    aria-label="Probability percentage"
                  />
                ) : (
                  <span className="text-slate-700">
                    {deal.probability != null ? `${deal.probability}%` : '—'}
                  </span>
                )}
              </div>

              {/* Company */}
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                {editing ? (
                  <Select
                    value={editData.companyId ?? deal.companyId ?? 'none'}
                    onValueChange={(v) => setField('companyId', v === 'none' ? null : v)}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1" aria-label="Associated company">
                      <SelectValue placeholder="No company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No company</SelectItem>
                      {companies.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : company ? (
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

              <div className="pt-1 border-t text-xs text-slate-400">
                Created {formatDate(deal.createdAt)}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentNotes}
                onChange={(e) => setNotesValue(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Add notes about this deal…"
                className="min-h-[100px] text-sm"
                aria-label="Deal notes"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Associated Contacts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                Contacts ({associatedContacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {associatedContacts.length === 0 ? (
                <p className="text-sm text-slate-400 px-6 pb-4">No contacts linked.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {associatedContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Link
                            href={`/contacts/${contact.id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 hover:underline"
                            aria-label={`View contact ${contact.firstName} ${contact.lastName}`}
                          >
                            {contact.firstName} {contact.lastName}
                          </Link>
                        </TableCell>
                        <TableCell className="text-slate-600">{contact.title || '—'}</TableCell>
                        <TableCell className="text-slate-600">
                          <a href={`mailto:${contact.email}`} className="hover:underline text-blue-600">
                            {contact.email}
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tasks ({dealTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {dealTasks.length === 0 ? (
                <p className="text-sm text-slate-400">No tasks linked.</p>
              ) : (
                <ul className="space-y-2">
                  {dealTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center gap-3 text-sm rounded-md border px-3 py-2"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={cn(
                          task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'
                        )}
                      >
                        {task.name}
                      </span>
                      {task.dueDate && (
                        <span className="ml-auto text-xs text-slate-400 shrink-0">
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
              {dealActivities.length === 0 ? (
                <p className="text-sm text-slate-400">No activity recorded yet.</p>
              ) : (
                <ol className="relative border-l border-slate-200 space-y-4 ml-3">
                  {dealActivities.map((entry) => (
                    <li key={entry.id} className="ml-4">
                      <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-slate-300" />
                      <p className="text-sm text-slate-700">{entry.description}</p>
                      <time className="text-xs text-slate-400">{formatDate(entry.timestamp)}</time>
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
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deal.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} aria-label="Cancel deletion">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} aria-label="Confirm delete deal">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
