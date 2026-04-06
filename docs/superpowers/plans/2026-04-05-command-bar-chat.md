# Command Bar Chat UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the sidebar chat panel with a centered command-bar UI that merges chat input and action status into one seamless surface.

**Architecture:** The SiriOrb stays at bottom-right as the idle entry point. Clicking it opens a centered command bar (580px pill) at the bottom of the content area with a subtle scrim. During execution, action steps stack upward above the bar. On completion, a result card shows the assistant response with collapsed step history. Esc or click-outside dismisses back to the orb.

**Tech Stack:** React, Zustand (existing agent-ui store), inline styles (matching existing codebase patterns), Lucide icons

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `crm/src/store/agent-ui.ts` | Modify | Add `actionHistory` array to track completed/active steps |
| `packages/auxos-agent/src/components/AgentPanel.tsx` | Rewrite | Centered command bar with action log + result card |
| `packages/auxos-agent/src/components/AuxosAgent.tsx` | Modify | Add scrim overlay, keep panel visible during execution, add Esc handler |
| `crm/src/components/agent/AgentWrapper.tsx` | Modify | Track `tool_end` events to build action history |
| `crm/src/components/layout/MainContent.tsx` | Modify | Remove margin-right logic (no sidebar) |
| `crm/src/app/layout.tsx` | Modify | Remove ActionBubble |
| `crm/src/components/agent/ActionBubble.tsx` | Delete | Functionality moves into command bar |

---

### Task 1: Add Action History to Store

**Files:**
- Modify: `crm/src/store/agent-ui.ts`

- [ ] **Step 1: Add action history state and methods to the store interface and implementation**

Replace the full content of `crm/src/store/agent-ui.ts` with:

```typescript
'use client'

import { create } from 'zustand'

export interface ActionStep {
  label: string
  status: 'active' | 'completed'
}

interface AgentUIStore {
  executing: boolean
  currentAction: string | null
  pendingQuestion: string | null
  respondFn: ((answer: string) => void) | null
  panelOpen: boolean
  actionHistory: ActionStep[]

  startExecution: () => void
  setCurrentAction: (label: string | null) => void
  completeCurrentAction: () => void
  finishExecution: () => void
  askUser: (question: string, respond: (answer: string) => void) => void
  answerQuestion: (answer: string) => void
  setPanelOpen: (open: boolean) => void
  clearActionHistory: () => void
}

function createAgentUIStore() {
  return create<AgentUIStore>((set, get) => ({
    executing: false,
    currentAction: null,
    pendingQuestion: null,
    respondFn: null,
    panelOpen: false,
    actionHistory: [],

    startExecution: () => set({ executing: true, currentAction: null, actionHistory: [] }),
    setCurrentAction: (label) => {
      const { actionHistory, currentAction } = get()
      // Mark previous active step as completed, add new active step
      const updated = actionHistory.map((s) =>
        s.status === 'active' ? { ...s, status: 'completed' as const } : s
      )
      if (label) {
        updated.push({ label, status: 'active' })
      }
      set({ currentAction: label, actionHistory: updated })
    },
    completeCurrentAction: () => {
      const { actionHistory } = get()
      set({
        actionHistory: actionHistory.map((s) =>
          s.status === 'active' ? { ...s, status: 'completed' as const } : s
        ),
      })
    },
    finishExecution: () => {
      const { actionHistory } = get()
      // Mark any remaining active steps as completed
      set({
        executing: false,
        currentAction: null,
        pendingQuestion: null,
        respondFn: null,
        actionHistory: actionHistory.map((s) =>
          s.status === 'active' ? { ...s, status: 'completed' as const } : s
        ),
      })
    },
    askUser: (question, respond) => set({ pendingQuestion: question, respondFn: respond, currentAction: null }),
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p crm/tsconfig.json`
Expected: No errors (AgentWrapper still references old API — will be updated in Task 3)

---

### Task 2: Rewrite AgentPanel as Command Bar

**Files:**
- Rewrite: `packages/auxos-agent/src/components/AgentPanel.tsx`

- [ ] **Step 1: Replace AgentPanel with the command bar implementation**

Replace the full content of `packages/auxos-agent/src/components/AgentPanel.tsx` with:

```tsx
'use client'

import { useEffect, useRef, KeyboardEvent, useState } from 'react'
import { Send, Square, ChevronRight, Check } from 'lucide-react'
import { SiriOrb } from './SiriOrb'
import type { AuxosTheme, DisplayMessage } from '../types'

export interface ActionStep {
  label: string
  status: 'active' | 'completed'
}

interface AgentPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: DisplayMessage[]
  isLoading: boolean
  streamingText: string
  onSend: (text: string) => void
  onStop?: () => void
  name?: string
  tagline?: string
  suggestions?: string[]
  theme: AuxosTheme
  actionHistory?: ActionStep[]
}

const commandBarKeyframes = `
@keyframes auxos-bar-appear {
  from { transform: translateY(12px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes auxos-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes auxos-ping {
  75%, 100% { transform: scale(2.5); opacity: 0; }
}
`

export function AgentPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  streamingText,
  onSend,
  onStop,
  name = 'Assistant',
  suggestions = [],
  theme,
  actionHistory = [],
}: AgentPanelProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [stepsExpanded, setStepsExpanded] = useState(false)

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) setStepsExpanded(false)
  }, [isOpen])

  function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || isLoading) return
    setInput('')
    onSend(content)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  // Determine state: idle (no messages), executing (loading), completed (has response)
  const hasMessages = messages.length > 0
  const lastMessage = messages[messages.length - 1]
  const hasResult = hasMessages && !isLoading && lastMessage?.type === 'assistant'
  const completedCount = actionHistory.filter((s) => s.status === 'completed').length
  const activeStep = actionHistory.find((s) => s.status === 'active')

  // Find the last user message for display above action log
  const lastUserMessage = [...messages].reverse().find((m) => m.type === 'user')

  // Get the final assistant response
  const finalResponse = hasResult ? lastMessage.content : streamingText || null

  return (
    <>
      <style>{commandBarKeyframes}</style>

      {/* Container — anchored to bottom center of content area */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '240px',
          right: '0',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          animation: 'auxos-bar-appear 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }}
      >
        {/* Result card — shown when agent has a response */}
        {finalResponse && (
          <div
            style={{
              width: '580px',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              pointerEvents: 'auto',
              fontFamily: theme.fonts.body,
            }}
          >
            {/* Collapsed steps header */}
            {completedCount > 0 && (
              <button
                onClick={() => setStepsExpanded(!stepsExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  fontFamily: theme.fonts.body,
                }}
              >
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check style={{ width: '10px', height: '10px', color: '#16a34a' }} />
                </div>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {completedCount} step{completedCount !== 1 ? 's' : ''} completed
                </span>
                <ChevronRight
                  style={{
                    width: '12px',
                    height: '12px',
                    color: '#cbd5e1',
                    marginLeft: 'auto',
                    transition: 'transform 0.15s',
                    transform: stepsExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  }}
                />
              </button>
            )}

            {/* Expanded step list */}
            {stepsExpanded && (
              <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                {actionHistory
                  .filter((s) => s.status === 'completed')
                  .map((step, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '4px 0',
                      }}
                    >
                      <div
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          background: '#f0fdf4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check style={{ width: '8px', height: '8px', color: '#16a34a' }} />
                      </div>
                      <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: theme.fonts.body }}>
                        {step.label}
                      </span>
                    </div>
                  ))}
              </div>
            )}

            {/* Assistant response */}
            <div style={{ padding: '14px 16px' }}>
              <div
                style={{
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.6,
                  fontFamily: theme.fonts.body,
                }}
              >
                {finalResponse.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < finalResponse.split('\n').length - 1 && <br />}
                  </span>
                ))}
                {isLoading && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '14px',
                      marginLeft: '2px',
                      verticalAlign: 'text-bottom',
                      borderRadius: '2px',
                      backgroundColor: '#94a3b8',
                      animation: 'auxos-blink 1s infinite',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action log — shown during execution, before result */}
        {isLoading && !finalResponse && (hasMessages || actionHistory.length > 0) && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              width: '580px',
              pointerEvents: 'auto',
              fontFamily: theme.fonts.body,
            }}
          >
            {/* User message bubble */}
            {lastUserMessage && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'white',
                    background: theme.colors.primary,
                    padding: '8px 14px',
                    borderRadius: '14px 14px 4px 14px',
                    maxWidth: '360px',
                  }}
                >
                  {lastUserMessage.content}
                </div>
              </div>
            )}

            {/* Action steps */}
            {actionHistory.map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0 4px',
                }}
              >
                {step.status === 'completed' ? (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#f0fdf4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Check style={{ width: '10px', height: '10px', color: '#16a34a' }} />
                  </div>
                ) : (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: '#eef2ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        animation: 'auxos-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                      }}
                    />
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#6366f1',
                      }}
                    />
                  </div>
                )}
                <span
                  style={{
                    fontSize: '12px',
                    color: step.status === 'active' ? '#475569' : '#94a3b8',
                    fontWeight: step.status === 'active' ? 500 : 400,
                  }}
                >
                  {step.label}{step.status === 'active' ? '...' : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Command bar input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 10px 10px 20px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '99px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
            width: '580px',
            pointerEvents: 'auto',
            fontFamily: theme.fonts.body,
          }}
        >
          {/* Mini orb indicator */}
          <div style={{ width: '10px', height: '10px', flexShrink: 0 }}>
            <SiriOrb state="dormant" onClick={() => {}} size={10} />
          </div>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasResult
                ? 'Follow up or ask something else...'
                : `Ask ${name} anything...`
            }
            disabled={false}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              fontSize: '14px',
              color: theme.colors.text,
              outline: 'none',
              border: 'none',
              fontFamily: theme.fonts.body,
            }}
          />

          {!isLoading && !hasMessages && (
            <span
              style={{
                fontSize: '11px',
                color: '#94a3b8',
                padding: '4px 8px',
              }}
            >
              Esc to close
            </span>
          )}

          {isLoading ? (
            <button
              onClick={() => onStop?.()}
              aria-label="Stop agent"
              style={{
                flexShrink: 0,
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                background: '#ef4444',
                color: 'white',
              }}
            >
              <Square style={{ height: '10px', width: '10px', fill: 'white' }} />
            </button>
          ) : input.trim() ? (
            <button
              onClick={() => handleSend()}
              aria-label="Send message"
              style={{
                flexShrink: 0,
                height: '32px',
                width: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
                color: 'white',
              }}
            >
              <Send style={{ height: '14px', width: '14px' }} />
            </button>
          ) : null}
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p packages/auxos-agent/tsconfig.json`
Expected: No errors

---

### Task 3: Update AuxosAgent — Scrim, Esc, Keep Panel During Execution

**Files:**
- Modify: `packages/auxos-agent/src/components/AuxosAgent.tsx`

- [ ] **Step 1: Update AuxosAgent to add scrim, Esc handler, and pass actionHistory**

Replace the full content of `packages/auxos-agent/src/components/AuxosAgent.tsx` with:

```tsx
'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { AgentButton } from './AgentButton'
import { SiriOrb } from './SiriOrb'
import { SpeechBubble } from './SpeechBubble'
import { AgentPanel } from './AgentPanel'
import { useAgent } from '../hooks/useAgent'
import { createTheme } from '../theme'
import type { AuxosConfig } from '../types'
import type { OrbState } from './SiriOrb'
import type { ActionStep } from './AgentPanel'

export function AuxosAgent(config: AuxosConfig & { actionHistory?: ActionStep[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isOrbHovered, setIsOrbHovered] = useState(false)
  const theme = useMemo(() => createTheme(config.theme || {}), [config.theme])

  const { messages, isLoading, streamingText, send, stop } = useAgent({
    tools: config.tools,
    endpoint: config.endpoint,
    getContext: config.getContext,
    systemPrompt: config.systemPrompt,
    onNavigate: config.onNavigate,
    onEvent: config.onEvent,
    maxIterations: config.maxIterations,
  })

  // Orb mode: only when consumer passes isIdle prop (CRM). Otherwise use classic AgentButton (SolaGlow).
  const useOrbMode = config.isIdle !== undefined
  const isIdle = config.isIdle ?? false
  const idleMessage = config.idleMessage ?? ''

  const isExecuting = config.executing ?? false
  const orbState: OrbState = isOpen ? 'active' : isIdle ? 'alert' : 'dormant'

  const updateOpen = useCallback((open: boolean) => {
    setIsOpen(open)
    config.onOpenChange?.(open)
  }, [config.onOpenChange])

  // Opens panel and sends the idle message after a short delay to let the panel mount
  const openWithIdleMessage = useCallback(() => {
    config.onIdleDismiss?.()
    updateOpen(true)
    if (idleMessage) {
      setTimeout(() => send(idleMessage), 100)
    }
  }, [idleMessage, config.onIdleDismiss, send, updateOpen])

  const handleOrbClick = useCallback(() => {
    if (isOpen) {
      updateOpen(false)
    } else if (isIdle && idleMessage) {
      openWithIdleMessage()
    } else {
      updateOpen(true)
    }
  }, [isOpen, isIdle, idleMessage, openWithIdleMessage, updateOpen])

  // Global Esc key handler
  useEffect(() => {
    if (!isOpen) return
    function handleEsc(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        updateOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, updateOpen])

  const minimized = config.minimized ?? false

  return (
    <>
      {/* Scrim — subtle overlay when command bar is open */}
      {isOpen && !minimized && (
        <div
          onClick={() => updateOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: 'rgba(0, 0, 0, 0.04)',
            pointerEvents: 'auto',
          }}
        />
      )}

      {/* Entry point: SiriOrb (CRM) or AgentButton (SolaGlow fallback) */}
      {!isOpen && !minimized && (
        useOrbMode ? (
          <div
            data-auxos-orb
            onMouseEnter={() => setIsOrbHovered(true)}
            onMouseLeave={() => setIsOrbHovered(false)}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* Hover label — shown on hover, hidden when idle speech bubble is visible */}
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                right: '0',
                marginBottom: '10px',
                background: theme.colors.glassBg,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${theme.colors.glassBorder}`,
                borderRadius: '10px',
                padding: '6px 12px',
                whiteSpace: 'nowrap',
                fontSize: '13px',
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.body,
                opacity: isOrbHovered && !isIdle ? 1 : 0,
                transition: 'opacity 0.2s ease',
                pointerEvents: isOrbHovered && !isIdle ? 'auto' : 'none',
              }}
            >
              Need help? Just ask!
            </div>
            <SpeechBubble
              message={idleMessage}
              visible={isIdle}
              onClick={openWithIdleMessage}
              theme={theme}
            />
            <SiriOrb state={orbState} onClick={handleOrbClick} size={36} />
          </div>
        ) : (
          <AgentButton isOpen={isOpen} onClick={() => updateOpen(true)} theme={theme} />
        )
      )}

      <AgentPanel
        isOpen={isOpen && !minimized}
        onClose={() => updateOpen(false)}
        messages={messages}
        isLoading={isLoading}
        streamingText={streamingText}
        onSend={send}
        onStop={stop}
        name={config.name}
        tagline={config.tagline}
        suggestions={config.suggestions}
        theme={theme}
        actionHistory={config.actionHistory}
      />
    </>
  )
}
```

Key changes from original:
- Removed `!isExecuting` from panel visibility — panel stays open during execution
- Added scrim overlay (click to dismiss)
- Added global Esc handler
- Passes `actionHistory` through to AgentPanel

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p packages/auxos-agent/tsconfig.json`
Expected: No errors

---

### Task 4: Update AgentWrapper to Track Action History

**Files:**
- Modify: `crm/src/components/agent/AgentWrapper.tsx`

- [ ] **Step 1: Pass actionHistory from store to AuxosAgent**

In `crm/src/components/agent/AgentWrapper.tsx`, add the `actionHistory` selector and pass it as a prop:

After this line:
```typescript
const executing = useAgentUIStore((s) => s.executing)
```

Add:
```typescript
const actionHistory = useAgentUIStore((s) => s.actionHistory)
```

Then in the `<AuxosAgent>` JSX, add the prop after `executing={executing}`:
```tsx
actionHistory={actionHistory}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p crm/tsconfig.json`
Expected: No errors

---

### Task 5: Remove ActionBubble and Sidebar Margin

**Files:**
- Modify: `crm/src/app/layout.tsx`
- Modify: `crm/src/components/layout/MainContent.tsx`

- [ ] **Step 1: Remove ActionBubble from layout**

In `crm/src/app/layout.tsx`:

Remove the import line:
```typescript
import { ActionBubble } from '@/components/agent/ActionBubble'
```

Remove the JSX element:
```tsx
<ActionBubble />
```

- [ ] **Step 2: Remove sidebar margin logic from MainContent**

Replace the full content of `crm/src/components/layout/MainContent.tsx` with:

```tsx
'use client'

export function MainContent({ children }: { children: React.ReactNode }) {
  return (
    <main className="ml-60 min-h-screen bg-slate-50 p-6">
      {children}
    </main>
  )
}
```

- [ ] **Step 3: Delete ActionBubble component**

Delete the file: `crm/src/components/agent/ActionBubble.tsx`

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit -p crm/tsconfig.json`
Expected: No errors

---

### Task 6: Verify Full Build and Smoke Test

- [ ] **Step 1: Type-check both packages**

Run: `npx tsc --noEmit -p packages/auxos-agent/tsconfig.json && npx tsc --noEmit -p crm/tsconfig.json`
Expected: No errors

- [ ] **Step 2: Build the CRM app**

Run: `cd crm && npx next build`
Expected: Build succeeds

- [ ] **Step 3: Visual smoke test**

Start the dev server: `cd crm && npm run dev`

Verify:
1. Orb appears at bottom-right when idle
2. Clicking orb opens the centered command bar with subtle scrim
3. Pressing Esc or clicking the scrim dismisses back to orb
4. Typing and sending a message shows the user message bubble and action steps stacking upward
5. On completion, result card appears with collapsed step count and assistant response
6. The input placeholder changes to "Follow up or ask something else..."
7. No ActionBubble appears anywhere
8. AgentCursor still works (it's independent of this change)
