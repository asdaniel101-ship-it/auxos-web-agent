'use client'

import { MessageSquare, X } from 'lucide-react'
import type { AuxosTheme } from '../types'

interface AgentButtonProps {
  isOpen: boolean
  onClick: () => void
  theme: AuxosTheme
}

export function AgentButton({ isOpen, onClick, theme }: AgentButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 50,
        height: '56px',
        width: '56px',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)'
      }}
    >
      {isOpen ? (
        <X style={{ height: '24px', width: '24px' }} />
      ) : (
        <MessageSquare style={{ height: '24px', width: '24px' }} />
      )}
    </button>
  )
}
