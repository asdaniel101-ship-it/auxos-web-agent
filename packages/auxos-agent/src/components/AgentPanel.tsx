'use client'

import { useEffect, useRef, KeyboardEvent, useState } from 'react'
import { Sparkles, X, Send, Square } from 'lucide-react'
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
  onStop?: () => void
  name?: string
  tagline?: string
  suggestions?: string[]
  theme: AuxosTheme
}

export function AgentPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  streamingText,
  onSend,
  onStop,
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
      <style>{`@keyframes auxos-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
@keyframes auxos-slide-up { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          zIndex: 50,
          width: '400px',
          height: '600px',
          backgroundColor: theme.colors.background,
          borderRadius: theme.radii.panel,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          border: `1px solid ${theme.colors.surfaceBorder}`,
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'auxos-slide-up 0.3s ease-out',
          fontFamily: theme.fonts.body,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${theme.colors.surfaceBorder}`,
            background: `linear-gradient(135deg, ${theme.colors.primaryAlpha}, ${theme.colors.primaryAlpha})`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles style={{ height: '16px', width: '16px', color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: theme.colors.text, lineHeight: 1, margin: 0 }}>
                {name}
              </p>
              <p style={{ fontSize: '12px', color: theme.colors.textMuted, marginTop: '2px', margin: 0 }}>
                {tagline}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              height: '28px',
              width: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textMuted,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X style={{ height: '16px', width: '16px' }} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: theme.spacing.panelPadding }}>
          {messages.length === 0 && !isLoading ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    height: '48px',
                    width: '48px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}
                >
                  <Sparkles style={{ height: '24px', width: '24px', color: 'white' }} />
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
                        color: theme.colors.textSecondary,
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.surfaceBorder}`,
                        borderRadius: theme.radii.button,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontFamily: theme.fonts.body,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.primaryAlpha
                        e.currentTarget.style.borderColor = theme.colors.primaryLight
                        e.currentTarget.style.color = theme.colors.primary
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.surface
                        e.currentTarget.style.borderColor = theme.colors.surfaceBorder
                        e.currentTarget.style.color = theme.colors.textSecondary
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

        {/* Input */}
        <div style={{ flexShrink: 0, borderTop: `1px solid ${theme.colors.surfaceBorder}`, padding: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              backgroundColor: theme.colors.inputBackground,
              border: `1px solid ${theme.colors.inputBorder}`,
              borderRadius: theme.radii.input,
              padding: '8px 12px',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary
              e.currentTarget.style.boxShadow = `0 0 0 1px ${theme.colors.primary}`
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.inputBorder
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${name} anything...`}
              disabled={false}
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
                minHeight: '20px',
                maxHeight: '76px',
                lineHeight: '20px',
                fontFamily: theme.fonts.body,
                opacity: 1,
              }}
            />
            {isLoading ? (
              <button
                onClick={() => onStop?.()}
                aria-label="Stop agent"
                style={{
                  flexShrink: 0,
                  height: '28px',
                  width: '28px',
                  borderRadius: theme.radii.button,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  backgroundColor: '#ef4444',
                  color: 'white',
                }}
              >
                <Square style={{ height: '12px', width: '12px', fill: 'white' }} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                aria-label="Send message"
                style={{
                  flexShrink: 0,
                  height: '28px',
                  width: '28px',
                  borderRadius: theme.radii.button,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s',
                  backgroundColor: input.trim() ? theme.colors.primary : theme.colors.surfaceBorder,
                  color: input.trim() ? 'white' : theme.colors.textMuted,
                }}
              >
                <Send style={{ height: '14px', width: '14px' }} />
              </button>
            )}
          </div>
          <p style={{ fontSize: '10px', color: theme.colors.textMuted, textAlign: 'center', margin: '6px 0 0' }}>
            {isLoading ? 'Click stop to cancel' : 'Enter to send · Shift+Enter for new line'}
          </p>
        </div>
      </div>
    </>
  )
}
