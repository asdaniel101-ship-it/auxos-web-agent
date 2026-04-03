'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export function AgentMessage({ role, content, isStreaming = false }: AgentMessageProps) {
  const isUser = role === 'user'
  const lines = content.split('\n')

  return (
    <div
      className={cn(
        'flex items-end gap-2 mb-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-0.5">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[78%] rounded-lg px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'
        )}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {isStreaming && (
          <span
            className={cn(
              'inline-block w-1.5 h-3.5 ml-0.5 align-text-bottom rounded-sm',
              isUser ? 'bg-blue-200' : 'bg-slate-500',
              'animate-blink'
            )}
          />
        )}
      </div>
    </div>
  )
}
