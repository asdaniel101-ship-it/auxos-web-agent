'use client'

import { useEffect, useRef, KeyboardEvent, useState } from 'react'
import { X, Send } from 'lucide-react'
import { SiriOrb } from './SiriOrb'
import { AgentMessage } from './AgentMessage'
import { ToolMessage } from './ToolMessage'
import type { AuxosTheme, DisplayMessage } from '../types'

interface AgentPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: DisplayMessage[]
  isLoading: boolean
  streamingText: string
  onSend: (text: string) => void
  name?: string
  tagline?: string
  suggestions?: string[]
  theme: AuxosTheme
}

const panelKeyframes = `
@keyframes auxos-panel-expand {
  from { transform: scale(0.3); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes auxos-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
`

export function AgentPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  streamingText,
  onSend,
  name = 'Assistant',
  tagline = 'AI Assistant',
  suggestions = [],
  theme,
}: AgentPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, streamingText])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 76) + 'px'
  }, [input])

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 100)
  }, [isOpen])

  function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || isLoading) return
    setInput('')
    onSend(content)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <style>{panelKeyframes}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          width: '400px',
          height: '600px',
          background: theme.colors.glassBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.glassBorder}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.1)',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'auxos-panel-expand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformOrigin: 'bottom right',
          fontFamily: theme.fonts.body,
        }}
      >
        {/* Header — minimal glassmorphism */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: `1px solid ${theme.colors.glassBorder}`,
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: 0,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {name}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              height: '28px',
              width: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textMuted,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textMuted
            }}
          >
            <X style={{ height: '16px', width: '16px' }} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.length === 0 && !isLoading ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto 12px', width: '48px', height: '48px' }}>
                  <SiriOrb state="dormant" onClick={() => {}} size={48} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: theme.colors.text, margin: 0 }}>
                  How can I help you today?
                </p>
              </div>
              {suggestions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {suggestions.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      style={{
                        textAlign: 'left',
                        fontSize: '12px',
                        color: theme.colors.textMuted,
                        background: theme.colors.glassSurface,
                        border: `1px solid ${theme.colors.glassBorder}`,
                        borderRadius: '10px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontFamily: theme.fonts.body,
                        transition: 'all 0.15s',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                        e.currentTarget.style.color = theme.colors.text
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.glassSurface
                        e.currentTarget.style.borderColor = theme.colors.glassBorder
                        e.currentTarget.style.color = theme.colors.textMuted
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {messages.map((msg, i) =>
                msg.type === 'tool' ? (
                  <ToolMessage key={i} toolName={msg.toolName} result={msg.result} theme={theme} />
                ) : (
                  <AgentMessage key={i} role={msg.type} content={msg.content} theme={theme} />
                )
              )}
              {streamingText && (
                <AgentMessage role="assistant" content={streamingText} isStreaming theme={theme} />
              )}
              {isLoading && !streamingText && (
                <AgentMessage role="assistant" content="" isStreaming theme={theme} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input — Siri-style pill */}
        <div style={{ flexShrink: 0, padding: '12px 16px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
              background: theme.colors.glassSurface,
              border: `1px solid ${theme.colors.glassBorder}`,
              borderRadius: '28px',
              padding: '6px 6px 6px 8px',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.glassBorder
            }}
          >
            {/* Mini orb in input */}
            <div style={{ flexShrink: 0, width: '28px', height: '28px', marginBottom: '2px' }}>
              <SiriOrb state="dormant" onClick={() => {}} size={28} />
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${name}...`}
              disabled={isLoading}
              rows={1}
              suppressHydrationWarning
              style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: '0%',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: theme.colors.text,
                resize: 'none',
                outline: 'none',
                border: 'none',
                minHeight: '28px',
                maxHeight: '76px',
                lineHeight: '28px',
                fontFamily: theme.fonts.body,
                opacity: isLoading ? 0.5 : 1,
              }}
            />

            {/* Send button — only visible when there's input */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              style={{
                flexShrink: 0,
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                transition: 'all 0.2s',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'transparent',
                color: input.trim() && !isLoading ? 'white' : 'transparent',
                opacity: input.trim() && !isLoading ? 1 : 0,
              }}
            >
              <Send style={{ height: '14px', width: '14px' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
