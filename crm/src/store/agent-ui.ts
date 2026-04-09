'use client'

import { create } from 'zustand'

export interface ActionStep {
  label: string
  status: 'active' | 'completed'
  /** 'tool' = tool invocation label (shown in pill only, hidden from history) */
  source?: 'tool'
}

interface AgentUIStore {
  executing: boolean
  toolsDone: boolean
  pendingQuestion: string | null
  respondFn: ((answer: string) => void) | null
  panelOpen: boolean
  actionHistory: ActionStep[]

  startExecution: () => void
  setCurrentAction: (label: string | null, source?: 'tool') => void
  /** Atomically complete the current action and set the next one (avoids intermediate renders). */
  completeAndSetNext: (label: string) => void
  completeCurrentAction: () => void
  setToolsDone: () => void
  finishExecution: () => void
  askUser: (question: string, respond: (answer: string) => void) => void
  answerQuestion: (answer: string) => void
  setPanelOpen: (open: boolean) => void
  clearActionHistory: () => void
}

let finishTimer: ReturnType<typeof setTimeout> | null = null

/** Mark all 'active' steps as 'completed'. */
function completeAllActive(history: ActionStep[]): ActionStep[] {
  return history.map((s) =>
    s.status === 'active' ? { ...s, status: 'completed' as const } : s
  )
}

function createAgentUIStore() {
  return create<AgentUIStore>((set, get) => ({
    executing: false,
    toolsDone: false,
    pendingQuestion: null,
    respondFn: null,
    panelOpen: false,
    actionHistory: [],

    startExecution: () => {
      if (finishTimer) { clearTimeout(finishTimer); finishTimer = null }
      set({ executing: true, toolsDone: false, actionHistory: [] })
    },
    setCurrentAction: (label, source) => {
      const updated = completeAllActive(get().actionHistory)
      if (label) {
        updated.push({ label, status: 'active', ...(source && { source }) })
      }
      set({ actionHistory: updated })
    },
    completeAndSetNext: (label) => {
      const updated = completeAllActive(get().actionHistory)
      updated.push({ label, status: 'active' })
      set({ actionHistory: updated })
    },
    completeCurrentAction: () => {
      set({ actionHistory: completeAllActive(get().actionHistory) })
    },
    setToolsDone: () => {
      set({
        toolsDone: true,
        actionHistory: completeAllActive(get().actionHistory),
      })
    },
    finishExecution: () => {
      // Clear toolsDone immediately to prevent stale state if user sends
      // another message quickly. The 600ms debounce only delays clearing
      // `executing` (used by cursor animation).
      set({ toolsDone: false })
      if (finishTimer) clearTimeout(finishTimer)
      finishTimer = setTimeout(() => {
        finishTimer = null
        set({
          executing: false,
          pendingQuestion: null,
          respondFn: null,
          actionHistory: completeAllActive(get().actionHistory),
        })
      }, 600)
    },
    askUser: (question, respond) => set({ pendingQuestion: question, respondFn: respond }),
    answerQuestion: (answer) => {
      const { respondFn } = get()
      if (respondFn) {
        respondFn(answer)
        set({ pendingQuestion: null, respondFn: null })
      }
    },
    setPanelOpen: (open) => set({ panelOpen: open }),
    clearActionHistory: () => set({ actionHistory: [] }),
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
  ask_user: 'Waiting for your input',
}

export function getToolLabel(toolName: string, input?: Record<string, unknown>): string {
  const base = TOOL_LABELS[toolName] || 'Working'
  if (toolName === 'navigate_to' && input?.page) return `${base} to ${input.page}`
  return base
}
