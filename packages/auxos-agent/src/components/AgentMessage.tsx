'use client'

import { Sparkles } from 'lucide-react'
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
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '12px',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {!isUser && (
        <div
          style={{
            flexShrink: 0,
            height: '28px',
            width: '28px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '2px',
          }}
        >
          <Sparkles style={{ height: '14px', width: '14px', color: 'white' }} />
        </div>
      )}

      <div
        style={{
          maxWidth: '78%',
          borderRadius: isUser
            ? `${theme.radii.bubble} ${theme.radii.bubble} 4px ${theme.radii.bubble}`
            : `${theme.radii.bubble} ${theme.radii.bubble} ${theme.radii.bubble} 4px`,
          padding: theme.spacing.messagePadding,
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: theme.fonts.body,
          ...(isUser
            ? { backgroundColor: theme.colors.userBubble, color: theme.colors.userBubbleText }
            : {
                backgroundColor: theme.colors.assistantBubble,
                border: `1px solid ${theme.colors.assistantBubbleBorder}`,
                color: theme.colors.assistantBubbleText,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
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
              backgroundColor: isUser ? 'rgba(255,255,255,0.6)' : theme.colors.textMuted,
              animation: 'auxos-blink 1s infinite',
            }}
          />
        )}
      </div>
    </div>
  )
}
