'use client'

import { useState } from 'react'
import { EmailThread } from '@/types'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface EmailListProps {
  threads: EmailThread[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function formatThreadTimestamp(thread: EmailThread): string {
  const latest = thread.messages[thread.messages.length - 1]
  if (!latest) return ''
  const date = new Date(latest.timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export function EmailList({ threads, selectedId, onSelect }: EmailListProps) {
  const [search, setSearch] = useState('')

  const sorted = [...threads].sort((a, b) => {
    const aLatest = a.messages[a.messages.length - 1]?.timestamp ?? a.createdAt
    const bLatest = b.messages[b.messages.length - 1]?.timestamp ?? b.createdAt
    return new Date(bLatest).getTime() - new Date(aLatest).getTime()
  })

  const filtered = sorted.filter((t) =>
    t.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-3 py-3 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search threads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
            aria-label="Search email threads"
          />
        </div>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No threads found.
          </div>
        ) : (
          <ul role="listbox" aria-label="Email threads">
            {filtered.map((thread) => {
              const latest = thread.messages[thread.messages.length - 1]
              const participantsPreview = thread.participants.slice(0, 3).join(', ')
              const isSelected = thread.id === selectedId

              return (
                <li
                  key={thread.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(thread.id)}
                  className={cn(
                    'flex flex-col gap-0.5 px-4 py-3 cursor-pointer border-b border-slate-100 transition-colors',
                    isSelected
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                  )}
                >
                  {/* Row 1: subject + timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'font-semibold text-sm truncate',
                        isSelected ? 'text-blue-900' : 'text-slate-900'
                      )}
                    >
                      {thread.subject}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {formatThreadTimestamp(thread)}
                    </span>
                  </div>

                  {/* Row 2: participants */}
                  <span className="text-xs text-slate-500 truncate">
                    {participantsPreview}
                    {thread.participants.length > 3 && ` +${thread.participants.length - 3} more`}
                  </span>

                  {/* Row 3: latest message preview */}
                  {latest && (
                    <span className="text-xs text-slate-400 truncate">
                      {latest.body}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
