'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { Button } from '@/components/ui/button'
import { EmailList } from '@/components/emails/EmailList'
import { EmailThread } from '@/components/emails/EmailThread'
import { ComposeEmail } from '@/components/emails/ComposeEmail'
import { Mail, PenSquare } from 'lucide-react'

export default function EmailsPage() {
  const emailThreads = useStore((s) => s.emailThreads)
  const setComposeOpen = useStore((s) => s.setComposeOpen)

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const selectedThread = emailThreads.find((t) => t.id === selectedThreadId) ?? null

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-slate-500" />
          <h1 className="text-xl font-semibold text-slate-900">Emails</h1>
          <span className="ml-1 text-sm text-slate-400">
            ({emailThreads.length} thread{emailThreads.length !== 1 ? 's' : ''})
          </span>
        </div>
        <Button
          onClick={() => setComposeOpen(true)}
          className="gap-2"
          aria-label="Compose new email"
        >
          <PenSquare className="h-4 w-4" />
          Compose
        </Button>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — thread list */}
        <div className="w-[350px] shrink-0 border-r border-slate-200 overflow-hidden flex flex-col">
          <EmailList
            threads={emailThreads}
            selectedId={selectedThreadId}
            onSelect={setSelectedThreadId}
          />
        </div>

        {/* Right panel — thread detail */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {selectedThread ? (
            <EmailThread thread={selectedThread} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <Mail className="h-12 w-12 text-slate-200" />
              <p className="text-sm font-medium">Select a thread to read</p>
              <p className="text-xs text-slate-300">
                Or compose a new email to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose dialog */}
      <ComposeEmail />
    </div>
  )
}
