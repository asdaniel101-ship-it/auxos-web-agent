'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { generateId } from '@/lib/utils'
import type { EmailDraft } from '@/store/slices/emails'
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
import { Send } from 'lucide-react'

const CURRENT_USER = 'Sarah Chen'

const emptyForm: EmailDraft = {
  to: '',
  subject: '',
  body: '',
  linkedContactId: '',
  linkedDealId: '',
}

export function ComposeEmail() {
  const contacts = useStore((s) => s.contacts)
  const deals = useStore((s) => s.deals)
  const addEmailThread = useStore((s) => s.addEmailThread)
  const addActivity = useStore((s) => s.addActivity)
  const emailDraft = useStore((s) => s.emailDraft)
  const composeOpen = useStore((s) => s.composeOpen)
  const setComposeOpen = useStore((s) => s.setComposeOpen)
  const { toast } = useToast()

  const [data, setData] = useState<EmailDraft>(emptyForm)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (emailDraft) setData({ ...emailDraft })
  }, [emailDraft])

  function setField<K extends keyof EmailDraft>(key: K, value: EmailDraft[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setData(emptyForm)
    setSending(false)
  }

  function handleClose(open: boolean) {
    if (!open) reset()
    setComposeOpen(open)
  }

  function handleSend() {
    const toTrimmed = data.to.trim()
    const subjectTrimmed = data.subject.trim()
    const bodyTrimmed = data.body.trim()

    if (!toTrimmed || !subjectTrimmed || !bodyTrimmed) return

    setSending(true)

    const thread = addEmailThread({
      subject: subjectTrimmed,
      participants: [CURRENT_USER, toTrimmed],
      messages: [
        {
          id: generateId(),
          from: CURRENT_USER,
          to: toTrimmed,
          body: bodyTrimmed,
          timestamp: new Date().toISOString(),
        },
      ],
      linkedContactId: data.linkedContactId || null,
      linkedDealId: data.linkedDealId || null,
    })

    addActivity({
      type: 'email_sent',
      description: `Sent email: "${subjectTrimmed}" to ${toTrimmed}`,
      entityType: 'email',
      entityId: thread.id,
      userId: CURRENT_USER,
    })

    toast({
      title: 'Email sent',
      description: `"${subjectTrimmed}" was sent to ${toTrimmed}.`,
    })

    handleClose(false)
  }

  const canSend = data.to.trim() && data.subject.trim() && data.body.trim() && !sending

  return (
    <Dialog open={composeOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* To */}
          <div className="space-y-1.5">
            <Label htmlFor="ce-to">To</Label>
            <Input
              id="ce-to"
              type="email"
              value={data.to}
              onChange={(e) => setField('to', e.target.value)}
              placeholder="recipient@example.com"
              aria-label="Recipient email address"
            />
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="ce-subject">Subject</Label>
            <Input
              id="ce-subject"
              value={data.subject}
              onChange={(e) => setField('subject', e.target.value)}
              placeholder="Email subject..."
              aria-label="Email subject"
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="ce-body">Body</Label>
            <Textarea
              id="ce-body"
              value={data.body}
              onChange={(e) => setField('body', e.target.value)}
              placeholder="Write your email..."
              className="min-h-[140px] resize-none text-sm"
              aria-label="Email body"
            />
          </div>

          {/* Link to contact */}
          <div className="space-y-1.5">
            <Label htmlFor="ce-contact">Link to Contact (optional)</Label>
            <Select
              value={data.linkedContactId || 'none'}
              onValueChange={(v) => setField('linkedContactId', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="ce-contact" aria-label="Link to contact">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" data-value="none">None</SelectItem>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id} data-value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Link to deal */}
          <div className="space-y-1.5">
            <Label htmlFor="ce-deal">Link to Deal (optional)</Label>
            <Select
              value={data.linkedDealId || 'none'}
              onValueChange={(v) => setField('linkedDealId', v === 'none' ? '' : v)}
            >
              <SelectTrigger id="ce-deal" aria-label="Link to deal">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" data-value="none">None</SelectItem>
                {deals.map((d) => (
                  <SelectItem key={d.id} value={d.id} data-value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!canSend} className="gap-2" aria-label="Send email">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
