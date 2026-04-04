'use client'

import { useAgentUIStore } from '@/store/agent-ui'

export function ActionBubble() {
  const executing = useAgentUIStore((s) => s.executing)
  const currentAction = useAgentUIStore((s) => s.currentAction)
  const visible = executing && !!currentAction

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
        zIndex: 99998,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '9999px',
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
      <style>{`
        @keyframes action-ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
