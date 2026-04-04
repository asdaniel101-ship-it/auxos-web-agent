'use client'

import type { AuxosTheme } from '../types'

const keyframes = `
@keyframes auxos-bubble-fade-in {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
`

interface SpeechBubbleProps {
  message: string
  visible: boolean
  onClick: () => void
  theme: AuxosTheme
}

export function SpeechBubble({ message, visible, onClick, theme }: SpeechBubbleProps) {
  if (!visible) return null

  return (
    <>
      <style>{keyframes}</style>
      <button
        onClick={onClick}
        style={{
          position: 'absolute',
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '12px',
          background: theme.colors.glassBg,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: `1px solid ${theme.colors.glassBorder}`,
          borderRadius: '12px',
          padding: '10px 16px',
          fontSize: '13px',
          color: theme.colors.textSecondary,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          animation: 'auxos-bubble-fade-in 0.5s ease forwards',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          fontFamily: 'inherit',
        }}
      >
        {message}
        {/* Arrow pointing right toward orb */}
        <div
          style={{
            position: 'absolute',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            background: theme.colors.glassBg,
            borderRight: `1px solid ${theme.colors.glassBorder}`,
            borderTop: `1px solid ${theme.colors.glassBorder}`,
          }}
        />
      </button>
    </>
  )
}
