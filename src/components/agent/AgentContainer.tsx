'use client'

import { useState } from 'react'
import { AgentButton } from './AgentButton'
import { AgentPanel } from './AgentPanel'

export function AgentContainer() {
  const [isOpen, setIsOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  return (
    <>
      <AgentButton isOpen={isOpen && !minimized} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <AgentPanel
          isOpen={!minimized}
          onClose={() => setIsOpen(false)}
          onMinimize={() => setMinimized(true)}
          onRestore={() => setMinimized(false)}
        />
      )}
    </>
  )
}
