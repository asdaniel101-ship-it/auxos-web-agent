'use client'

import { useState } from 'react'

export type OrbState = 'dormant' | 'alert' | 'active'

interface SiriOrbProps {
  state: OrbState
  onClick: () => void
  size?: number
}

const keyframes = `
@keyframes auxos-orb-rotate {
  to { transform: rotate(360deg); }
}
@keyframes auxos-orb-rotate-reverse {
  to { transform: rotate(-360deg); }
}
@keyframes auxos-orb-glow-dormant {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}
@keyframes auxos-orb-glow-alert {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes auxos-orb-highlight {
  0%, 100% { opacity: 0.3; transform: translate(0, 0); }
  50% { opacity: 0.6; transform: translate(5px, 3px); }
}
`

export function SiriOrb({ state, onClick, size = 60 }: SiriOrbProps) {
  const [isHovered, setIsHovered] = useState(false)

  const outerSpeed = state === 'alert' ? '3s' : '4s'
  const glowAnim = state === 'alert' ? 'auxos-orb-glow-alert' : 'auxos-orb-glow-dormant'
  const scale = isHovered ? 1.1 : 1

  return (
    <>
      <style>{keyframes}</style>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open assistant"
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'transparent',
          padding: 0,
          transform: `scale(${scale})`,
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Glow layer */}
        <div
          style={{
            position: 'absolute',
            inset: `-${size * 0.33}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            animation: `${glowAnim} 3s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Outer rotating gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #f43f5e, #6366f1)',
            animation: `auxos-orb-rotate ${outerSpeed} linear infinite`,
          }}
        />

        {/* Inner counter-rotating gradient */}
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            borderRadius: '50%',
            background: 'conic-gradient(from 180deg, #818cf8, #a78bfa, #f472b6, #fb7185, #818cf8)',
            animation: 'auxos-orb-rotate-reverse 6s linear infinite',
            filter: 'blur(4px)',
          }}
        />

        {/* Highlight */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '30%',
            height: '20%',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '50%',
            filter: 'blur(8px)',
            animation: 'auxos-orb-highlight 3s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      </button>
    </>
  )
}
