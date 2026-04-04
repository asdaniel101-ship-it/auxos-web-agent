'use client'

import { useState, useEffect, useRef } from 'react'
import { useAgentUIStore } from '@/store/agent-ui'

export function ActionBubble() {
  const executing = useAgentUIStore((s) => s.executing)
  const currentAction = useAgentUIStore((s) => s.currentAction)
  const pendingQuestion = useAgentUIStore((s) => s.pendingQuestion)
  const answerQuestion = useAgentUIStore((s) => s.answerQuestion)
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const hasQuestion = executing && !!pendingQuestion
  const hasAction = executing && !!currentAction && !pendingQuestion
  const visible = hasQuestion || hasAction
  const hasInput = input.trim().length > 0

  const modeStyle = hasQuestion
    ? { flexDirection: 'column' as const, alignItems: 'stretch' as const, padding: '12px 16px', borderRadius: '16px', width: '360px' }
    : { flexDirection: 'row' as const, alignItems: 'center' as const, padding: '8px 16px', borderRadius: '9999px', width: undefined }

  useEffect(() => {
    if (!hasQuestion) return
    const timer = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(timer)
  }, [hasQuestion])

  function handleSubmit() {
    const answer = input.trim()
    if (!answer) return
    answerQuestion(answer)
    setInput('')
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
        zIndex: 99998,
        display: 'flex',
        ...modeStyle,
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        fontSize: '13px',
        fontWeight: 500,
        color: '#334155',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {hasQuestion ? (
        <>
          <span>{pendingQuestion}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type your answer..."
              style={{
                flex: 1,
                padding: '6px 12px',
                borderRadius: '9999px',
                border: '1px solid rgba(0,0,0,0.1)',
                fontSize: '13px',
                outline: 'none',
                background: 'rgba(255,255,255,0.8)',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!hasInput}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                background: hasInput ? '#6366f1' : 'rgba(0,0,0,0.05)',
                color: hasInput ? 'white' : '#94a3b8',
                fontSize: '13px',
                fontWeight: 500,
                cursor: hasInput ? 'pointer' : 'default',
                fontFamily: 'inherit',
              }}
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Pulsing indicator dot */}
          <span style={{ position: 'relative', width: '8px', height: '8px', flexShrink: 0 }}>
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: '#6366f1',
                opacity: 0.75,
                animation: 'action-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
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
          {currentAction}
        </>
      )}
      <style>{`
        @keyframes action-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
