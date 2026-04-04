'use client'

import { useMemo, useCallback } from 'react'
import { AuxosAgent } from '@auxos/agent'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/store'
import { getCrmTools } from '@/agent/client-tools'
import { cancelAllSteps } from '@/components/agent/AgentCursor'
import type { AuxosEvent } from '@auxos/agent'

export function AgentWrapper() {
  const router = useRouter()
  const pathname = usePathname()

  const tools = useMemo(() => getCrmTools(), [])

  const handleEvent = useCallback((event: AuxosEvent) => {
    if (event.type === 'stopped') {
      cancelAllSteps()
    }
  }, [])

  return (
    <AuxosAgent
      tools={tools}
      endpoint="/api/agent"
      name="Auxos"
      tagline="AI Assistant"
      suggestions={[
        'Show me all deals worth over $100k',
        'Create a new contact named Alex Chen at Quantum Labs',
        'What does my pipeline look like?',
        'Move the Meridian Corp deal to Negotiation',
        "Reassign all of Priya's tasks to Marcus",
      ]}
      onNavigate={(path) => router.push(path)}
      onEvent={handleEvent}
      getContext={() => ({
        teamMembers: useStore.getState().teamMembers.map((m) => m.name),
        currentPage: pathname,
      })}
      theme={{
        colors: {
          primary: '#3b82f6',
          primaryDark: '#2563eb',
        },
      }}
    />
  )
}
