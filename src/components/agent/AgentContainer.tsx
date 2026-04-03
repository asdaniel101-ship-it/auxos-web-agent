'use client'

import { AuxosAgent } from '@auxos/agent'
import { getCrmTools } from '@/agent/client-tools'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/store'

const SUGGESTIONS = [
  'Show me all deals worth over $100k',
  'Create a new contact named Alex Chen at Quantum Labs',
  'What does my pipeline look like?',
  'Move the Meridian Corp deal to Negotiation',
  "Reassign all of Priya's tasks to Marcus",
]

export function AgentContainer() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <AuxosAgent
      tools={getCrmTools()}
      endpoint="/api/agent"
      name="Auxos"
      tagline="CRM Assistant"
      suggestions={SUGGESTIONS}
      theme={{ colors: { primary: '#6366f1' } }}
      onNavigate={(path) => router.push(path)}
      getContext={() => ({
        teamMembers: useStore.getState().teamMembers.map((m) => m.name),
        currentPage: pathname,
      })}
    />
  )
}
