'use client'

import { useState } from 'react'
import { useStore } from '@/store'
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

interface CompanyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Retail',
  'Energy',
  'Media',
  'Consulting',
  'Education',
  'Logistics',
]

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+']

interface FormData {
  name: string
  industry: string
  size: string
  website: string
  address: string
  notes: string
}

const initialData: FormData = {
  name: '',
  industry: '',
  size: '',
  website: '',
  address: '',
  notes: '',
}

export function CompanyForm({ open, onOpenChange }: CompanyFormProps) {
  const addCompany = useStore((s) => s.addCompany)
  const addActivity = useStore((s) => s.addActivity)
  const { toast } = useToast()

  const [data, setData] = useState<FormData>(initialData)

  function reset() {
    setData(initialData)
  }

  function handleClose(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    const company = addCompany({
      name: data.name,
      industry: data.industry,
      size: data.size,
      revenue: 0,
      website: data.website,
      address: data.address,
      notes: data.notes,
    })

    addActivity({
      type: 'company_created',
      description: `Created company ${data.name}`,
      entityType: 'company',
      entityId: company.id,
      userId: 'system',
    })

    toast({
      title: 'Company created',
      description: `${data.name} was added successfully.`,
    })

    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Company</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-name">Company Name</Label>
            <Input
              id="cf-name"
              value={data.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="Acme Corp"
              aria-label="Company name"
            />
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-industry">Industry</Label>
            <Select value={data.industry || 'none'} onValueChange={(v) => setField('industry', v === 'none' ? '' : v)}>
              <SelectTrigger id="cf-industry" aria-label="Select industry">
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-size">Company Size</Label>
            <Select value={data.size || 'none'} onValueChange={(v) => setField('size', v === 'none' ? '' : v)}>
              <SelectTrigger id="cf-size" aria-label="Select company size">
                <SelectValue placeholder="Select a size range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s} employees
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-website">Website</Label>
            <Input
              id="cf-website"
              type="url"
              value={data.website}
              onChange={(e) => setField('website', e.target.value)}
              placeholder="https://example.com"
              aria-label="Company website"
            />
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-address">Address</Label>
            <Input
              id="cf-address"
              value={data.address}
              onChange={(e) => setField('address', e.target.value)}
              placeholder="123 Main St, City, State"
              aria-label="Company address"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="cf-notes">Notes</Label>
            <Textarea
              id="cf-notes"
              value={data.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Any relevant notes about this company…"
              className="min-h-[80px]"
              aria-label="Company notes"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)} aria-label="Cancel">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!data.name.trim()} aria-label="Create company">
            Create Company
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
