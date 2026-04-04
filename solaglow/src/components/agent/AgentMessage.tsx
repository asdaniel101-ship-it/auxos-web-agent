'use client'

import { memo } from 'react'
import { Sparkles } from 'lucide-react'
import ReactMarkdown, { Components } from 'react-markdown'
import { cn } from '@/lib/utils'

const markdownComponents: Components = {
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-stone-900 mt-3 mb-1.5 first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-outside ml-4 my-1 space-y-0.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-4 my-1 space-y-0.5">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-stone-700">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-stone-900">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="text-stone-500">{children}</em>
  ),
  hr: () => (
    <hr className="my-3 border-stone-200" />
  ),
  p: ({ children }) => (
    <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>
  ),
  code: ({ children }) => (
    <code className="bg-stone-100 text-amber-800 rounded px-1 py-0.5 text-xs font-mono">{children}</code>
  ),
}

interface AgentMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
}

export const AgentMessage = memo(function AgentMessage({ role, content, isStreaming = false }: AgentMessageProps) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex items-end gap-2 mb-3',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-7 w-7 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mb-0.5">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[78%] rounded-lg px-3 py-2 text-sm leading-relaxed',
          isUser
            ? 'bg-amber-700 text-white rounded-br-sm'
            : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm shadow-sm'
        )}
      >
        {isUser ? (
          content
        ) : (
          <ReactMarkdown components={markdownComponents}>
            {content}
          </ReactMarkdown>
        )}
        {isStreaming && (
          <span
            className={cn(
              'inline-block w-1.5 h-3.5 ml-0.5 align-text-bottom rounded-sm',
              isUser ? 'bg-amber-300' : 'bg-stone-500',
              'animate-blink'
            )}
          />
        )}
      </div>
    </div>
  )
})
