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
    timeout: 10000,
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
          primary: '#0052D4',
          primaryDark: '#0043AE',
          primaryLight: 'rgba(0, 82, 212, 0.1)',
          primaryAlpha: 'rgba(0, 82, 212, 0.05)',
          background: 'rgba(255, 255, 255, 0.85)',
          surface: 'rgba(0, 0, 0, 0.03)',
          surfaceBorder: 'rgba(0, 0, 0, 0.08)',
          text: '#1e293b',
          textSecondary: '#475569',
          textMuted: '#94a3b8',
          userBubble: '#0052D4',
          userBubbleText: '#ffffff',
          assistantBubble: 'rgba(0, 0, 0, 0.04)',
          assistantBubbleBorder: 'rgba(0, 0, 0, 0.06)',
          assistantBubbleText: '#334155',
          inputBackground: 'rgba(0, 0, 0, 0.04)',
          inputBorder: 'rgba(0, 0, 0, 0.1)',
          glassBg: 'rgba(255, 255, 255, 0.85)',
          glassSurface: 'rgba(0, 0, 0, 0.04)',
          glassBorder: 'rgba(0, 0, 0, 0.08)',
        },
      }}
      isIdle={isIdle}
      idleMessage={idleMessage}
      onIdleDismiss={dismiss}
      onOpenChange={setPanelOpen}
    />
  )
}
