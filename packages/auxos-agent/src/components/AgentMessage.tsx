'use client'

import type { AuxosTheme } from '../types'

interface AgentMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  theme: AuxosTheme
}

export function AgentMessage({ role, content, isStreaming = false, theme }: AgentMessageProps) {
  const isUser = role === 'user'
  const lines = content.split('\n')

  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '12px',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '10px 14px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: theme.fonts.body,
          ...(isUser
            ? {
                background: theme.colors.userBubble,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1px solid ${theme.colors.glassBorder}`,
                color: theme.colors.userBubbleText,
              }
            : {
                background: theme.colors.assistantBubble,
                border: `1px solid ${theme.colors.assistantBubbleBorder}`,
                color: theme.colors.assistantBubbleText,
              }),
        }}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {isStreaming && (
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '14px',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              borderRadius: '2px',
              backgroundColor: theme.colors.textMuted,
              animation: 'auxos-blink 1s infinite',
            }}
          />
        )}
      </div>
    </div>
  )
}
