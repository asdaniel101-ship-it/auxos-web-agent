'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { ContactStatus } from '@/types'
import { useToast } from '@/components/ui/use-toast'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ContactFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEPS = ['Basic Info', 'Company', 'Notes', 'Assign']
const TOTAL_STEPS = STEPS.length

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  title: string
  companyId: string
  notes: string
  owner: string
  status: ContactStatus
}

const initialData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  companyId: '',
  notes: '',
  owner: '',
  status: 'lead',
}

export function ContactForm({ open, onOpenChange }: ContactFormProps) {
  const companies = useStore((s) => s.companies)
  const teamMembers = useStore((s) => s.teamMembers)
  const addContact = useStore((s) => s.addContact)
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

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    const contact = addContact({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      title: data.title,
      companyId: data.companyId || null,
      notes: data.notes,
      owner: data.owner,
      status: data.status,
      lastContacted: new Date().toISOString(),
    })

    addActivity({
      type: 'contact_created',
      description: `Created contact ${data.firstName} ${data.lastName}`,
      entityType: 'contact',
      entityId: contact.id,
      userId: data.owner,
    })

    toast({
      title: 'Contact created',
      description: `${data.firstName} ${data.lastName} was added successfully.`,
    })

    handleClose(false)
  }

  const isLastStep = step === TOTAL_STEPS - 1

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Contact</DialogTitle>
        </DialogHeader>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mt-1" aria-label="Form steps">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors',
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
                    'text-xs hidden sm:block',
                    i === step ? 'text-slate-900 font-medium' : 'text-slate-400'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < TOTAL_STEPS - 1 && (
                <div className={cn('h-px flex-1', i < step ? 'bg-green-400' : 'bg-slate-200')} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="space-y-4 py-2 min-h-[220px]">
          {step === 0 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cf-firstName">First Name</Label>
                  <Input
                    id="cf-firstName"
                    value={data.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    placeholder="Jane"
                    aria-label="First name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cf-lastName">Last Name</Label>
                  <Input
                    id="cf-lastName"
                    value={data.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    placeholder="Smith"
                    aria-label="Last name"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cf-email">Email</Label>
                <Input
                  id="cf-email"
                  type="email"
                  value={data.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="jane@example.com"
                  aria-label="Email address"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cf-phone">Phone</Label>
                <Input
                  id="cf-phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  aria-label="Phone number"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cf-title">Title</Label>
                <Input
                  id="cf-title"
                  value={data.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="VP of Sales"
                  aria-label="Job title"
                />
              </div>
            </>
          )}

          {step === 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="cf-company">Company</Label>
              <Select
                value={data.companyId || 'none'}
                onValueChange={(v) => set('companyId', v === 'none' ? '' : v)}
              >
                <SelectTrigger id="cf-company" aria-label="Select company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-1.5">
              <Label htmlFor="cf-notes">Notes</Label>
              <Textarea
                id="cf-notes"
                value={data.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any relevant notes about this contact…"
                className="min-h-[140px]"
                aria-label="Contact notes"
              />
            </div>
          )}

          {step === 3 && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="cf-owner">Assign Owner</Label>
                <Select value={data.owner} onValueChange={(v) => set('owner', v)}>
                  <SelectTrigger id="cf-owner" aria-label="Assign owner">
                    <SelectValue placeholder="Select a team member" />
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
              <div className="space-y-1.5">
                <Label htmlFor="cf-status">Status</Label>
                <Select
                  value={data.status}
                  onValueChange={(v) => set('status', v as ContactStatus)}
                >
                  <SelectTrigger id="cf-status" aria-label="Select contact status">
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
            </>
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
            <Button onClick={() => setStep((s) => s + 1)} aria-label="Go to next step">
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} aria-label="Submit contact form">
              Create Contact
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
