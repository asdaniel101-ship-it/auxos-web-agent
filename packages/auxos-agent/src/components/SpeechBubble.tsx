'use client'

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
}

export function SpeechBubble({ message, visible, onClick }: SpeechBubbleProps) {
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
          background: 'rgba(30, 32, 48, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '10px 16px',
          fontSize: '13px',
          color: '#cbd5e1',
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
            background: 'rgba(30, 32, 48, 0.8)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        />
      </button>
    </>
  )
}
