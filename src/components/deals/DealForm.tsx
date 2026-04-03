'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { DealStage } from '@/types'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DealFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STAGES: DealStage[] = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
]

const STEPS = ['Name & Value', 'Company', 'Contacts', 'Stage & Date', 'Owner']
const TOTAL_STEPS = STEPS.length

interface FormData {
  name: string
  value: string
  companyId: string
  contactIds: string[]
  stage: DealStage
  closeDate: string
  probability: string
  owner: string
}

const initialData: FormData = {
  name: '',
  value: '',
  companyId: '',
  contactIds: [],
  stage: 'Prospecting',
  closeDate: '',
  probability: '10',
  owner: '',
}

export function DealForm({ open, onOpenChange }: DealFormProps) {
  const companies = useStore((s) => s.companies)
  const contacts = useStore((s) => s.contacts)
  const teamMembers = useStore((s) => s.teamMembers)
  const addDeal = useStore((s) => s.addDeal)
  const addActivity = useStore((s) => s.addActivity)
  const { toast } = useToast()

  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(initialData)

  function reset() {
    setStep(0)
    setData(initialData)
  }

  function handleClose(open: boolean) {
    if (!open) reset()
    onOpenChange(open)
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function toggleContact(contactId: string) {
    setData((prev) => ({
      ...prev,
      contactIds: prev.contactIds.includes(contactId)
        ? prev.contactIds.filter((id) => id !== contactId)
        : [...prev.contactIds, contactId],
    }))
  }

  // Contacts filtered by selected company (or all if no company selected)
  const availableContacts = data.companyId
    ? contacts.filter((c) => c.companyId === data.companyId)
    : contacts

  function handleSubmit() {
    const deal = addDeal({
      name: data.name,
      value: Number(data.value) || 0,
      companyId: data.companyId || null,
      contactIds: data.contactIds,
      stage: data.stage,
      closeDate: data.closeDate || new Date().toISOString(),
      probability: Number(data.probability) || 0,
      owner: data.owner,
      notes: '',
    })

    addActivity({
      type: 'deal_created',
      description: `Created deal "${data.name}"`,
      entityType: 'deal',
      entityId: deal.id,
      userId: data.owner,
    })

    toast({
      title: 'Deal created',
      description: `"${data.name}" was added successfully.`,
    })

    handleClose(false)
  }

  const isLastStep = step === TOTAL_STEPS - 1

  function canProceed(): boolean {
    if (step === 0) return data.name.trim().length > 0
    return true
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Deal</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-1 mt-1 overflow-x-auto" aria-label="Form steps">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-1 min-w-0">
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors shrink-0',
                    i < step
                      ? 'bg-green-500 text-white'
                      : i === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  )}
                  aria-current={i === step ? 'step' : undefined}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'text-xs truncate hidden sm:block',
                    i === step ? 'text-slate-900 font-medium' : 'text-slate-400'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={cn('h-px flex-1 min-w-[8px]', i < step ? 'bg-green-400' : 'bg-slate-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="space-y-4 py-2 min-h-[220px]">
          {/* Step 1: Name & Value */}
          {step === 0 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="df-name">Deal Name *</Label>
                <Input
                  id="df-name"
                  value={data.name}
                  onChange={(e) => setField('name', e.target.value)}
                  placeholder="Enterprise Software License"
                  aria-label="Deal name"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="df-value">Value ($)</Label>
                <Input
                  id="df-value"
                  type="number"
                  min={0}
                  value={data.value}
                  onChange={(e) => setField('value', e.target.value)}
                  placeholder="50000"
                  aria-label="Deal value"
                />
              </div>
            </>
          )}

          {/* Step 2: Company */}
          {step === 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="df-company">Company</Label>
              <Select
                value={data.companyId || 'none'}
                onValueChange={(v) => {
                  const newCompanyId = v === 'none' ? '' : v
                  setData((prev) => ({
                    ...prev,
                    companyId: newCompanyId,
                    // Clear contacts if company changes
                    contactIds: [],
                  }))
                }}
              >
                <SelectTrigger id="df-company" aria-label="Select company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No company</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 3: Contacts (multi-select) */}
          {step === 2 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Contacts
                {data.companyId && (
                  <span className="text-slate-400 font-normal ml-1 text-xs">
                    (filtered by selected company)
                  </span>
                )}
              </Label>
              {availableContacts.length === 0 ? (
                <p className="text-sm text-slate-400 py-4 text-center">No contacts available.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {availableContacts.map((contact) => (
                    <label
                      key={contact.id}
                      className="flex items-center gap-3 rounded-md border px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors"
                      aria-label={`Select contact ${contact.firstName} ${contact.lastName}`}
                    >
                      <Checkbox
                        checked={data.contactIds.includes(contact.id)}
                        onCheckedChange={() => toggleContact(contact.id)}
                        aria-label={`${contact.firstName} ${contact.lastName}`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        {contact.title && (
                          <p className="text-xs text-slate-400 truncate">{contact.title}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {data.contactIds.length > 0 && (
                <p className="text-xs text-blue-600">{data.contactIds.length} contact{data.contactIds.length !== 1 ? 's' : ''} selected</p>
              )}
            </div>
          )}

          {/* Step 4: Stage, Close Date, Probability */}
          {step === 3 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="df-stage">Stage</Label>
                <Select value={data.stage} onValueChange={(v) => setField('stage', v as DealStage)}>
                  <SelectTrigger id="df-stage" aria-label="Select stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="df-close">Close Date</Label>
                <Input
                  id="df-close"
                  type="date"
                  value={data.closeDate}
                  onChange={(e) => setField('closeDate', e.target.value)}
                  aria-label="Expected close date"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="df-prob">Probability (%)</Label>
                <Input
                  id="df-prob"
                  type="number"
                  min={0}
                  max={100}
                  value={data.probability}
                  onChange={(e) => setField('probability', e.target.value)}
                  placeholder="10"
                  aria-label="Win probability percentage"
                />
              </div>
            </>
          )}

          {/* Step 5: Owner */}
          {step === 4 && (
            <div className="space-y-1.5">
              <Label htmlFor="df-owner">Assign Owner</Label>
              <Select value={data.owner} onValueChange={(v) => setField('owner', v)}>
                <SelectTrigger id="df-owner" aria-label="Assign owner">
                  <SelectValue placeholder="Select a team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              aria-label="Go to previous step"
            >
              Back
            </Button>
          )}
          {!isLastStep ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              aria-label="Go to next step"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!data.name.trim()}
              aria-label="Create deal"
            >
              Create Deal
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
