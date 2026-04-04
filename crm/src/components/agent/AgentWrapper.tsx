'use client'

import { useMemo, useState, useCallback } from 'react'
import { AuxosAgent } from '@auxos/agent'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/store'
import { getCrmTools } from '@/agent/client-tools'
import { useIdleDetection } from '@/hooks/useIdleDetection'
import { cancelAllSteps } from '@/components/agent/AgentCursor'
import { useAgentUIStore, getToolLabel } from '@/store/agent-ui'
import type { AuxosEvent } from '@auxos/agent'
import type { CrmStore } from '@/store'

/** Build a human-readable summary of the entity visible on the current detail page. */
function getPageContext(pathname: string, state: CrmStore): string | null {
  const segments = pathname.split('/')
  if (segments.length < 3) return null
  const [, section, entityId] = segments

  switch (section) {
    case 'deals': {
      const deal = state.deals.find((d) => d.id === entityId)
      if (!deal) return null
      const contacts = deal.contactIds
        .map((id) => state.contacts.find((c) => c.id === id))
        .filter(Boolean)
      const company = deal.companyId ? state.companies.find((c) => c.id === deal.companyId) : null
      const tasks = state.tasks.filter((t) => t.linkedDealId === entityId)
      const lines = [
        `Viewing deal "${deal.name}" (${deal.id})`,
        `  Value: $${deal.value.toLocaleString()}, Stage: ${deal.stage}, Owner: ${deal.owner}`,
        `  Close date: ${deal.closeDate}, Probability: ${deal.probability}%`,
      ]
      if (company) lines.push(`  Company: ${company.name} (${company.industry})`)
      for (const c of contacts) {
        if (c) lines.push(`  Contact: ${c.firstName} ${c.lastName} <${c.email}> — ${c.title}`)
      }
      if (tasks.length) lines.push(`  Tasks: ${tasks.map((t) => `${t.name} (${t.status})`).join(', ')}`)
      if (deal.notes) lines.push(`  Notes: ${deal.notes}`)
      return lines.join('\n')
    }
    case 'contacts': {
      const contact = state.contacts.find((c) => c.id === entityId)
      if (!contact) return null
      const company = contact.companyId ? state.companies.find((c) => c.id === contact.companyId) : null
      const deals = state.deals.filter((d) => d.contactIds.includes(entityId))
      const lines = [
        `Viewing contact "${contact.firstName} ${contact.lastName}" (${contact.id})`,
        `  Email: ${contact.email}, Phone: ${contact.phone}, Title: ${contact.title}`,
        `  Status: ${contact.status}, Owner: ${contact.owner}`,
      ]
      if (company) lines.push(`  Company: ${company.name}`)
      if (deals.length) lines.push(`  Deals: ${deals.map((d) => `${d.name} ($${d.value.toLocaleString()})`).join(', ')}`)
      return lines.join('\n')
    }
    case 'companies': {
      const company = state.companies.find((c) => c.id === entityId)
      if (!company) return null
      const contacts = state.contacts.filter((c) => c.companyId === entityId)
      const deals = state.deals.filter((d) => d.companyId === entityId)
      const lines = [
        `Viewing company "${company.name}" (${company.id})`,
        `  Industry: ${company.industry}, Size: ${company.size}, Revenue: $${company.revenue.toLocaleString()}`,
      ]
      if (contacts.length) lines.push(`  Contacts: ${contacts.map((c) => `${c.firstName} ${c.lastName} <${c.email}>`).join(', ')}`)
      if (deals.length) lines.push(`  Deals: ${deals.map((d) => `${d.name} (${d.stage})`).join(', ')}`)
      return lines.join('\n')
    }
    case 'tasks': {
      const task = state.tasks.find((t) => t.id === entityId)
      if (!task) return null
      const deal = task.linkedDealId ? state.deals.find((d) => d.id === task.linkedDealId) : null
      const contact = task.linkedContactId ? state.contacts.find((c) => c.id === task.linkedContactId) : null
      const lines = [
        `Viewing task "${task.name}" (${task.id})`,
        `  Assignee: ${task.assignee}, Priority: ${task.priority}, Status: ${task.status}, Due: ${task.dueDate}`,
      ]
      if (deal) lines.push(`  Linked deal: ${deal.name}`)
      if (contact) lines.push(`  Linked contact: ${contact.firstName} ${contact.lastName} <${contact.email}>`)
      return lines.join('\n')
    }
    default:
      return null
  }
}

export function AgentWrapper() {
  const router = useRouter()
  const pathname = usePathname()
  const [panelOpen, setPanelOpen] = useState(false)

  const tools = useMemo(() => getCrmTools(), [])

  const { isIdle, idleMessage, dismiss } = useIdleDetection({
    timeout: 15000,
    cooldown: 300000,
    enabled: !panelOpen,
  })

  const executing = useAgentUIStore((s) => s.executing)

  const handleEvent = useCallback((event: AuxosEvent) => {
    const { executing: isExec, startExecution, setCurrentAction, finishExecution, askUser } = useAgentUIStore.getState()
    switch (event.type) {
      case 'tool_start':
        if (!isExec) startExecution()
        setCurrentAction(getToolLabel(event.toolName, event.input))
        break
      case 'ask_user':
        askUser(event.question, event.respond)
        break
      case 'done':
        if (isExec) finishExecution()
        break
      case 'stopped':
        cancelAllSteps()
        if (isExec) finishExecution()
        break
      case 'error':
        if (isExec) finishExecution()
        break
    }
  }, [])

  return (
    <AuxosAgent
      tools={tools}
      endpoint="/api/agent"
      name="Auxos"
      tagline="AI Assistant"
      suggestions={[
        'Create a new contact named Alex Chen at Quantum Labs',
        'Move the Meridian Corp deal to Negotiation',
        "Reassign all of Priya's tasks to Marcus",
        'Show me all deals worth over $100k',
        'What workflows can you help me with?',
      ]}
      onNavigate={(path) => router.push(path)}
      onEvent={handleEvent}
      getContext={() => {
        const state = useStore.getState()
        return {
          teamMembers: state.teamMembers.map((m) => m.name),
          currentPage: pathname,
          pageContext: getPageContext(pathname, state),
        }
      }}
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
      executing={executing}
    />
  )
}
