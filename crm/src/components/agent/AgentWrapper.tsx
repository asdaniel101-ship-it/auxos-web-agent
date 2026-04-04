'use client'

import { useMemo, useState } from 'react'
import { AuxosAgent } from '@auxos/agent'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/store'
import { getCrmTools } from '@/agent/client-tools'
import { useIdleDetection } from '@/hooks/useIdleDetection'

export function AgentWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const [panelOpen, setPanelOpen] = useState(false)

  const tools = useMemo(() => getCrmTools(), [])

  const { isIdle, idleMessage, dismiss } = useIdleDetection({
    timeout: 30000,
    cooldown: 300000,
    enabled: !panelOpen,
  })

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
      getContext={() => ({
        teamMembers: useStore.getState().teamMembers.map((m) => m.name),
        currentPage: pathname,
      })}
      theme={{
        colors: {
          primary: '#818cf8',
          primaryDark: '#6366f1',
          primaryLight: 'rgba(129, 140, 248, 0.15)',
          primaryAlpha: 'rgba(129, 140, 248, 0.08)',
          background: 'rgba(15, 17, 23, 0.7)',
          surface: 'rgba(255, 255, 255, 0.06)',
          surfaceBorder: 'rgba(255, 255, 255, 0.1)',
          text: '#e2e8f0',
          textSecondary: '#cbd5e1',
          textMuted: '#94a3b8',
          userBubble: 'rgba(255, 255, 255, 0.1)',
          userBubbleText: '#e2e8f0',
          assistantBubble: 'rgba(255, 255, 255, 0.05)',
          assistantBubbleBorder: 'rgba(255, 255, 255, 0.06)',
          assistantBubbleText: '#cbd5e1',
          inputBackground: 'rgba(255, 255, 255, 0.08)',
          inputBorder: 'rgba(255, 255, 255, 0.1)',
          glassBg: 'rgba(15, 17, 23, 0.7)',
          glassSurface: 'rgba(255, 255, 255, 0.08)',
          glassBorder: 'rgba(255, 255, 255, 0.1)',
        },
      }}
      isIdle={isIdle}
      idleMessage={idleMessage}
      onIdleDismiss={dismiss}
      onOpenChange={setPanelOpen}
    />
  )
}
