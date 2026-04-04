'use client'

import { useRef, useState } from 'react'
import { EmailThread as EmailThreadType } from '@/types'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Send } from 'lucide-react'

const CURRENT_USER = 'Sarah Chen'

interface EmailThreadProps {
  thread: EmailThreadType
}

function formatMessageTimestamp(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function EmailThread({ thread }: EmailThreadProps) {
  const replyToThread = useStore((s) => s.replyToThread)
  const addActivity = useStore((s) => s.addActivity)
  const { toast } = useToast()

  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Determine the default reply-to recipient (first participant who isn't the current user)
  const replyTo =
    thread.participants.find((p) => p !== CURRENT_USER) ?? thread.participants[0] ?? ''

  function handleSend() {
    const trimmed = body.trim()
    if (!trimmed) return

    setSending(true)
    replyToThread(thread.id, {
      from: CURRENT_USER,
      to: replyTo,
      body: trimmed,
    })

    addActivity({
      type: 'email_sent',
      description: `Replied to thread: "${thread.subject}"`,
      entityType: 'email',
      entityId: thread.id,
      userId: CURRENT_USER,
    })

    toast({
      title: 'Reply sent',
      description: `Your reply to "${thread.subject}" was sent.`,
    })

    setBody('')
    setSending(false)

    // Scroll to bottom after state update
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 shrink-0">
        <h2 className="text-lg font-semibold text-slate-900 truncate">{thread.subject}</h2>
        <p className="text-sm text-slate-500 mt-0.5 truncate">
          <span className="font-medium text-slate-600">Participants: </span>
          {thread.participants.join(', ')}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {thread.messages.map((msg, idx) => {
          const isOutbound = msg.from === CURRENT_USER
          return (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col gap-1 max-w-[85%]',
                isOutbound ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              {/* Sender / recipient line */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-600">{msg.from}</span>
                <span>→</span>
                <span>{msg.to}</span>
                <span className="ml-1">{formatMessageTimestamp(msg.timestamp)}</span>
              </div>

              {/* Bubble */}
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                  isOutbound
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                )}
              >
                {msg.body}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Reply input */}
      <div className="px-6 py-4 border-t border-slate-200 shrink-0">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-slate-400">
            Replying as <span className="font-medium text-slate-600">{CURRENT_USER}</span>
            {replyTo && (
              <>
                {' '}to <span className="font-medium text-slate-600">{replyTo}</span>
              </>
            )}
            <span className="ml-2 text-slate-300">(Cmd+Enter to send)</span>
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your reply…"
            className="min-h-[80px] resize-none text-sm"
            aria-label="Reply body"
            disabled={sending}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSend}
              disabled={!body.trim() || sending}
              className="gap-2"
              aria-label="Send reply"
            >
              <Send className="h-4 w-4" />
              Send Reply
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
