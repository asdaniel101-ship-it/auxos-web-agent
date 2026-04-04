'use client'

import { MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function AgentButton({ isOpen, onClick }: AgentButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close Auxos assistant' : 'Open Auxos assistant'}
      className={cn(
        'fixed bottom-6 right-6 z-50',
        'h-14 w-14 rounded-full',
        'bg-gradient-to-br from-amber-600 to-amber-800',
        'flex items-center justify-center',
        'shadow-lg',
        'text-white',
        'transition-all duration-200 ease-in-out',
        'hover:scale-105 hover:shadow-xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
      )}
    >
      {isOpen ? (
        <X className="h-6 w-6" />
      ) : (
        <MessageSquare className="h-6 w-6" />
      )}
    </button>
  )
}
