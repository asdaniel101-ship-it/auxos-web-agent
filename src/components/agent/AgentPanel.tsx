'use client'

import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentMessage } from './AgentMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTION_CHIPS = [
  'Show me all deals worth over $100k',
  'Create a new contact named Alex Chen at Quantum Labs',
  'What does my pipeline look like?',
  'Move the Meridian Corp deal to Negotiation',
  "Reassign all of Priya's tasks to Marcus",
]

interface AgentPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AgentPanel({ isOpen, onClose }: AgentPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = 20
    const maxHeight = lineHeight * 3 + 16 // 3 lines + padding
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
  }, [input])

  // Focus textarea when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content }])
    setIsLoading(true)

    // Placeholder — real API call will be added in a later task
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'll help you with that! (Agent integration coming soon)",
        },
      ])
      setIsLoading(false)
    }, 1000)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleChipClick(chip: string) {
    handleSend(chip)
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50',
        'w-[400px] h-[600px]',
        'bg-white rounded-xl shadow-2xl border border-slate-200',
        'flex flex-col overflow-hidden',
        'transition-all duration-300 ease-out',
        isOpen
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none">Auxos</p>
            <p className="text-xs text-slate-500 mt-0.5">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close assistant panel"
          className="h-7 w-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col justify-end gap-4">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-700">How can I help you today?</p>
              <p className="text-xs text-slate-400 mt-1">Ask me anything about your CRM</p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-col gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="text-left text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {messages.map((msg, i) => (
              <AgentMessage
                key={i}
                role={msg.role}
                content={msg.content}
                isStreaming={false}
              />
            ))}
            {isLoading && (
              <AgentMessage
                role="assistant"
                content=""
                isStreaming={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-slate-100 px-3 py-3">
        <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Auxos anything…"
            disabled={isLoading}
            rows={1}
            className={cn(
              'flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400',
              'resize-none outline-none border-none',
              'min-h-[20px] max-h-[76px] leading-5',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className={cn(
              'flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-all',
              input.trim() && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
