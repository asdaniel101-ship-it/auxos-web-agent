'use client'

import { create } from 'zustand'

interface AgentUIStore {
  executing: boolean
  currentAction: string | null

  startExecution: () => void
  setCurrentAction: (label: string | null) => void
  finishExecution: () => void
}

function createAgentUIStore() {
  return create<AgentUIStore>((set) => ({
    executing: false,
    currentAction: null,

    startExecution: () => set({ executing: true, currentAction: null }),
    setCurrentAction: (label) => set({ currentAction: label }),
    finishExecution: () => set({ executing: false, currentAction: null }),
  }))
}

// Singleton: survive Next.js module duplication across chunks.
function getOrCreateStore() {
  if (typeof window !== 'undefined') {
    const w = window as any
    if (!w.__agentUIStore) {
      w.__agentUIStore = createAgentUIStore()
    }
    return w.__agentUIStore as ReturnType<typeof createAgentUIStore>
  }
  return createAgentUIStore()
}

export const useAgentUIStore = getOrCreateStore()

const TOOL_LABELS: Record<string, string> = {
  navigate_to: 'Navigating',
  create_contact: 'Creating contact',
  create_company: 'Creating company',
  create_deal: 'Creating deal',
  create_task: 'Creating task',
  update_contact: 'Updating contact',
  update_company: 'Updating company',
  update_deal: 'Updating deal',
  update_task: 'Updating task',
  delete_contact: 'Deleting contact',
  complete_task: 'Completing task',
  move_deal_stage: 'Moving deal stage',
  send_email: 'Sending email',
  draft_email: 'Drafting email',
  reply_to_email: 'Replying to email',
  update_settings: 'Updating settings',
  invite_team_member: 'Inviting team member',
  onboard_client: 'Onboarding client',
  search: 'Searching',
  list_contacts: 'Looking up contacts',
  list_companies: 'Looking up companies',
  list_deals: 'Looking up deals',
  list_tasks: 'Looking up tasks',
  list_emails: 'Looking up emails',
  get_contact: 'Loading contact',
  get_company: 'Loading company',
  get_deal: 'Loading deal',
  get_task: 'Loading task',
  get_email_thread: 'Loading email thread',
  generate_report: 'Generating report',
  bulk_update_contacts: 'Bulk updating contacts',
}

export function getToolLabel(toolName: string, input?: Record<string, unknown>): string {
  const base = TOOL_LABELS[toolName] || 'Working'
  if (toolName === 'navigate_to' && input?.page) return `${base} to ${input.page}`
  return base
}
