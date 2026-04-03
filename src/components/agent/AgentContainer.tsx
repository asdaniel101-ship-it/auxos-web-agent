'use client'

import { useState } from 'react'
import { AgentButton } from './AgentButton'
import { AgentPanel } from './AgentPanel'

export function AgentContainer() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AgentButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
      {isOpen && <AgentPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  )
}
