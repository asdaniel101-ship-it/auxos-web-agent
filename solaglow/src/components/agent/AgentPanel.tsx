'use client'

import { useEffect, useRef, useState, KeyboardEvent } from 'react'
import { Sparkles, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AgentMessage } from './AgentMessage'
import { useRouter, usePathname } from 'next/navigation'
import { executeTool } from '@/agent/executor'
import { queuePreAction, queuePostNavigationAction } from '@/agent/visual-actions'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: any
}

interface DisplayMessage {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTION_CHIPS = [
  'Does LED therapy actually work?',
  'I have dry skin and fine lines — what should I buy?',
  "What's the difference between the Pro and the Mini?",
  'Help me check out',
  'I need a gift for my mom — she loves skincare',
]

interface AgentPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AgentPanel({ isOpen, onClose }: AgentPanelProps) {
  const [claudeMessages, setClaudeMessages] = useState<ClaudeMessage[]>([])
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [displayMessages, isLoading])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const lineHeight = 20
    const maxHeight = lineHeight * 3 + 16
    textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + 'px'
  }, [input])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  async function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || isLoading) return

    setInput('')
    setIsLoading(true)

    const newDisplayMessages: DisplayMessage[] = [
      ...displayMessages,
      { role: 'user', content },
    ]
    setDisplayMessages(newDisplayMessages)

    const newClaudeMessages: ClaudeMessage[] = [
      ...claudeMessages,
      { role: 'user', content },
    ]

    try {
      let currentMessages = newClaudeMessages
      let finalText = ''

      while (true) {
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: currentMessages,
            context: {
              currentPage: pathname,
            },
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to get response')
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        const assistantContent = data.content
        const toolUseBlocks = assistantContent.filter(
          (b: any) => b.type === 'tool_use'
        )

        if (toolUseBlocks.length === 0 || data.stop_reason === 'end_turn') {
          // Only capture text from the final response — drop intermediate
          // "thinking" text that accompanies tool calls so the chat stays clean.
          const textBlocks = assistantContent.filter(
            (b: any) => b.type === 'text'
          )
          if (textBlocks.length > 0) {
            finalText = textBlocks.map((b: any) => b.text).join('\n')
          }
          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: assistantContent },
          ]
          break
        }

        const toolResults: any[] = []
        for (const toolUse of toolUseBlocks) {
          // 1. Pre-action: animate on CURRENT page (clicks, typing, etc)
          await queuePreAction(toolUse.name, toolUse.input)

          // 2. Execute the tool
          const result = executeTool(toolUse.name, toolUse.input)

          // 3. Handle navigation if the tool result says to navigate
          const hasNavigate =
            result.success &&
            result.data &&
            typeof result.data === 'object' &&
            'navigate' in (result.data as any)

          if (hasNavigate) {
            router.push((result.data as any).navigate)
            // Wait for the new page to render
            await new Promise((r) => setTimeout(r, 800))
          }

          // 4. Post-navigation: animate on DESTINATION page (scroll, highlight)
          await queuePostNavigationAction(toolUse.name, toolUse.input, result)

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result),
          })
        }

        currentMessages = [
          ...currentMessages,
          { role: 'assistant', content: assistantContent },
          { role: 'user', content: toolResults },
        ]
      }

      setClaudeMessages(currentMessages)
      setDisplayMessages([
        ...newDisplayMessages,
        { role: 'assistant', content: finalText || 'Done!' },
      ])
    } catch (error: any) {
      setDisplayMessages([
        ...newDisplayMessages,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${error.message}. Please make sure the API key is configured in .env.local.`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-50',
        'w-[400px] h-[600px]',
        'bg-[#FAF7F2] rounded-xl shadow-2xl border border-stone-200',
        'flex flex-col overflow-hidden',
        'transition-all duration-300 ease-out',
        isOpen
          ? 'translate-y-0 opacity-100'
          : 'translate-y-4 opacity-0 pointer-events-none'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 leading-none">Auxos</p>
            <p className="text-xs text-stone-500 mt-0.5">Skincare Advisor</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close assistant panel"
          className="h-7 w-7 rounded-md flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
        {displayMessages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col justify-end gap-4">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <p className="text-sm font-medium text-stone-700">Hi! I&apos;m your skincare advisor.</p>
              <p className="text-xs text-stone-400 mt-1">Ask me anything about SolaGlow products</p>
            </div>

            <div className="flex flex-col gap-2">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSend(chip)}
                  className="text-left text-xs text-stone-600 bg-white border border-stone-200 rounded-lg px-3 py-2 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {displayMessages.map((msg, i) => (
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
      <div className="flex-shrink-0 border-t border-stone-200 px-3 py-3">
        <div className="flex items-end gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about products, ingredients, routines..."
            disabled={isLoading}
            rows={1}
            className={cn(
              'flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400',
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
                ? 'bg-amber-700 text-white hover:bg-amber-800'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 text-center mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
