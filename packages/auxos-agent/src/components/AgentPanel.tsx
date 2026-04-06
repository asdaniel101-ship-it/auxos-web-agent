'use client'

import { useEffect, useRef, KeyboardEvent, useState } from 'react'
import { Send, Square, ChevronRight, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { SiriOrb } from './SiriOrb'
import type { AuxosTheme, DisplayMessage } from '../types'

export interface ActionStep {
  label: string
  status: 'active' | 'completed'
}

interface AgentPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: DisplayMessage[]
  isLoading: boolean
  streamingText: string
  onSend: (text: string) => void
  onStop?: () => void
  name?: string
  theme: AuxosTheme
  actionHistory?: ActionStep[]
}

const commandBarKeyframes = `
@keyframes auxos-bar-appear {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes auxos-bar-shrink {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.6); opacity: 0.6; border-radius: 50px; }
  100% { transform: scale(0.08); opacity: 0; border-radius: 50%; }
}
@keyframes auxos-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes auxos-action-ping {
  75%, 100% { transform: scale(2); opacity: 0; }
}
`

export function AgentPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  streamingText,
  onSend,
  onStop,
  name = 'Assistant',
  theme,
  actionHistory = [],
}: AgentPanelProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [stepsExpanded, setStepsExpanded] = useState(false)
  const [shrinking, setShrinking] = useState(false)
  const prevLoadingRef = useRef(false)

  // Detect execution start → trigger shrink animation
  useEffect(() => {
    if (isLoading && !prevLoadingRef.current && messages.length > 0) {
      setShrinking(true)
      const timer = setTimeout(() => setShrinking(false), 400)
      return () => clearTimeout(timer)
    }
    prevLoadingRef.current = isLoading
  }, [isLoading, messages.length])

  useEffect(() => {
    if (isOpen && !isLoading) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen, isLoading])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = '32px'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  useEffect(() => {
    if (!isOpen) setStepsExpanded(false)
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

  if (!isOpen) return null

  const hasMessages = messages.length > 0
  const lastMessage = messages[messages.length - 1]
  const hasResult = hasMessages && !isLoading && lastMessage?.type === 'assistant'
  const completedCount = actionHistory.filter((s) => s.status === 'completed').length
  const activeStep = actionHistory.find((s) => s.status === 'active')

  const finalResponse = hasResult ? lastMessage.content : streamingText || null

  // During execution: hide the command bar, show simple action pill
  const isExecuting = isLoading && !finalResponse && hasMessages
  const showCommandBar = !isExecuting || shrinking

  return (
    <>
      <style>{commandBarKeyframes}</style>

      {/* Container — anchored to bottom center of content area */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '240px',
          right: '0',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {/* Result card — shown when agent has a response */}
        {finalResponse && (
          <div
            style={{
              width: '580px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              pointerEvents: 'auto',
              fontFamily: theme.fonts.body,
              animation: 'auxos-bar-appear 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Collapsed steps header */}
            {completedCount > 0 && (
              <button
                onClick={() => setStepsExpanded(!stepsExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  fontFamily: theme.fonts.body,
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check style={{ width: '10px', height: '10px', color: '#16a34a' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {completedCount} step{completedCount !== 1 ? 's' : ''} completed
                </span>
                <ChevronRight
                  style={{
                    width: '12px',
                    height: '12px',
                    color: '#cbd5e1',
                    marginLeft: 'auto',
                    transition: 'transform 0.15s',
                    transform: stepsExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
            )}

            {/* Expanded step list */}
            {stepsExpanded && (
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                {actionHistory
                  .filter((s) => s.status === 'completed')
                  .map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 0',
                      }}
                    >
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: '#f0fdf4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check style={{ width: '8px', height: '8px', color: '#16a34a' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: theme.fonts.body }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Assistant response */}
            <div style={{ padding: '14px 16px' }}>
              <div
                style={{
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.6,
                  fontFamily: theme.fonts.body,
                }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.6 }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 600, color: '#1e293b' }}>{children}</strong>,
                    em: ({ children }) => <em style={{ color: '#64748b' }}>{children}</em>,
                    ul: ({ children }) => <ul style={{ margin: '4px 0 8px', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ margin: '4px 0 8px', paddingLeft: '20px', listStyleType: 'decimal' }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: '2px', color: '#475569' }}>{children}</li>,
                    h3: ({ children }) => <h3 style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b', margin: '8px 0 4px' }}>{children}</h3>,
                    code: ({ children }) => (
                      <code style={{ fontSize: '12px', fontFamily: 'monospace', background: '#f8fafc', padding: '1px 4px', borderRadius: '3px', color: '#334155' }}>
                        {children}
                      </code>
                    ),
                    hr: () => <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />,
                  }}
                >
                  {finalResponse}
                </ReactMarkdown>
                {isLoading && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '14px',
                      marginLeft: '2px',
                      verticalAlign: 'text-bottom',
                      borderRadius: '2px',
                      backgroundColor: '#94a3b8',
                      animation: 'auxos-blink 1s infinite',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action pill — shown during execution (like old ActionBubble) */}
        {isExecuting && !shrinking && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '9999px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              fontSize: '13px',
              fontWeight: 500,
              color: '#334155',
              pointerEvents: 'auto',
              fontFamily: theme.fonts.body,
              animation: 'auxos-bar-appear 0.3s ease',
            }}
          >
            {/* Pulsing indicator dot */}
            <span style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  opacity: 0.75,
                  animation: 'auxos-action-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                }}
              />
            </span>
            {activeStep?.label || 'Working...'}

            {/* Stop button */}
            <button
              onClick={() => onStop?.()}
              aria-label="Stop agent"
              style={{
                marginLeft: '4px',
                flexShrink: 0,
                height: '24px',
                width: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                background: '#ef4444',
                color: 'white',
              }}
            >
              <Square style={{ height: '8px', width: '8px', fill: 'white' }} />
            </button>
          </div>
        )}

        {/* Command bar input — hidden during execution, shown with shrink animation when transitioning */}
        {showCommandBar && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 8px 8px 20px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
              width: '580px',
              pointerEvents: 'auto',
              fontFamily: theme.fonts.body,
              animation: shrinking
                ? 'auxos-bar-shrink 0.4s cubic-bezier(0.4, 0, 1, 1) forwards'
                : 'auxos-bar-appear 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              transformOrigin: 'center bottom',
            }}
          >
            {/* Mini orb indicator */}
            <div style={{ width: '10px', height: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SiriOrb state="dormant" onClick={() => {}} size={10} />
            </div>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasResult
                  ? 'Follow up or ask something else...'
                  : `Ask ${name} anything...`
              }
              rows={1}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: theme.colors.text,
                outline: 'none',
                border: 'none',
                fontFamily: theme.fonts.body,
                resize: 'none',
                lineHeight: '32px',
                height: '32px',
                maxHeight: '120px',
                overflow: 'auto',
                padding: 0,
                margin: 0,
              }}
            />

            {!isLoading && (
              <span
                style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                Esc to close
              </span>
            )}

            {isLoading ? (
              <button
                onClick={() => onStop?.()}
                aria-label="Stop agent"
                style={{
                  flexShrink: 0,
                  height: '32px',
                  width: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  background: '#ef4444',
                  color: 'white',
                }}
              >
                <Square style={{ height: '10px', width: '10px', fill: 'white' }} />
              </button>
            ) : (
              <button
                onClick={() => handleSend()}
                aria-label="Send message"
                disabled={!input.trim()}
                style={{
                  flexShrink: 0,
                  height: '32px',
                  width: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: input.trim() ? 'pointer' : 'default',
                  background: input.trim()
                    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`
                    : '#f1f5f9',
                  color: input.trim() ? 'white' : '#cbd5e1',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                <Send style={{ height: '14px', width: '14px' }} />
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
