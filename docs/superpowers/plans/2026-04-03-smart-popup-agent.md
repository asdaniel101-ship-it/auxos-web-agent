# Smart Popup Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the CRM's passive chatbot button with a Siri-style animated orb that detects idle stalling and proactively offers help, backed by a glassmorphism-reskinned chat panel.

**Architecture:** Client-side idle detection hook (CRM-specific) triggers orb state changes. `AuxosAgent` conditionally renders `SiriOrb` (when idle props are provided) or the original `AgentButton` (backward compat for SolaGlow). The chat panel uses theme-driven styling throughout — CRM passes dark glass theme overrides while SolaGlow keeps its existing light theme unchanged. New optional props on `AuxosConfig` allow any consumer to opt into the orb + idle detection.

**Tech Stack:** React 18, Next.js 14 App Router, TypeScript, CSS-in-JS (inline styles, matching existing codebase patterns), CSS keyframe animations

**Spec:** `docs/superpowers/specs/2026-04-03-smart-popup-agent-design.md`

---

## File Structure

### New Files
| File | Responsibility |
|------|---------------|
| `packages/auxos-agent/src/components/SiriOrb.tsx` | Animated Siri-style orb with 4 states (dormant/alert/hover/active) and CSS keyframe animations |
| `packages/auxos-agent/src/components/SpeechBubble.tsx` | Frosted glass speech bubble for idle alert messages |
| `crm/src/hooks/useIdleDetection.ts` | CRM-specific hook: tracks mousemove/click/scroll/keydown, fires after 30s idle, page-aware contextual messages |

### Modified Files
| File | Changes |
|------|---------|
| `packages/auxos-agent/src/types.ts` | Add optional idle props to `AuxosConfig` |
| `packages/auxos-agent/src/components/AuxosAgent.tsx` | Replace `AgentButton` with `SiriOrb`, wire idle props, handle alert→panel transition |
| `packages/auxos-agent/src/components/AgentPanel.tsx` | Full glassmorphism reskin: frosted container, minimal header, pill input bar with mini orb |
| `packages/auxos-agent/src/components/AgentMessage.tsx` | Frosted glass bubble styling for both user and assistant messages |
| `packages/auxos-agent/src/components/ToolMessage.tsx` | Glass aesthetic update |
| `packages/auxos-agent/src/theme.ts` | Add dark/glass theme colors to `defaultTheme` and `createTheme` |
| `packages/auxos-agent/src/index.ts` | Export `SiriOrb`, `SpeechBubble`; keep `AgentButton` export for SolaGlow backward compat |
| `crm/src/components/agent/AgentWrapper.tsx` | Integrate `useIdleDetection`, pass idle state to `AuxosAgent` |

---

### Task 1: Add Idle Props to AuxosConfig

**Files:**
- Modify: `packages/auxos-agent/src/types.ts`

- [ ] **Step 1: Add idle-related optional props to AuxosConfig**

In `packages/auxos-agent/src/types.ts`, add these props to the `AuxosConfig` interface after the `maxIterations` field (line 101):

```typescript
  /** Whether the user is currently idle (triggers orb alert state). */
  isIdle?: boolean
  /** Contextual message to show in the speech bubble when idle. */
  idleMessage?: string
  /** Called when the user dismisses the idle alert. */
  onIdleDismiss?: () => void
```

- [ ] **Step 2: Commit**

```bash
git add packages/auxos-agent/src/types.ts
git commit -m "feat: add idle detection props to AuxosConfig"
```

---

### Task 2: Update Theme for Glassmorphism

**Files:**
- Modify: `packages/auxos-agent/src/types.ts`
- Modify: `packages/auxos-agent/src/theme.ts`

- [ ] **Step 1: Add glass-specific color fields to AuxosTheme**

In `packages/auxos-agent/src/types.ts`, add these fields to the `colors` object in `AuxosTheme` (after `inputBorder` on line 58):

```typescript
    /** Glassmorphism panel background */
    glassBg: string
    /** Glassmorphism surface tint */
    glassSurface: string
    /** Glass border color */
    glassBorder: string
```

- [ ] **Step 2: Add default glass colors to theme.ts**

In `packages/auxos-agent/src/theme.ts`, add these to `defaultTheme.colors` (after `inputBorder`):

```typescript
    glassBg: 'rgba(15, 17, 23, 0.7)',
    glassSurface: 'rgba(255, 255, 255, 0.08)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
```

And in the `createTheme` function, ensure these get included in the spread (they already will since they're in `defaultTheme.colors` and overrides spread on top).

- [ ] **Step 3: Commit**

```bash
git add packages/auxos-agent/src/types.ts packages/auxos-agent/src/theme.ts
git commit -m "feat: add glassmorphism color tokens to theme"
```

---

### Task 3: Create SiriOrb Component

**Files:**
- Create: `packages/auxos-agent/src/components/SiriOrb.tsx`

- [ ] **Step 1: Create the SiriOrb component**

Create `packages/auxos-agent/src/components/SiriOrb.tsx`:

```tsx
'use client'

import { useState } from 'react'

export type OrbState = 'dormant' | 'alert' | 'active'

interface SiriOrbProps {
  state: OrbState
  onClick: () => void
  size?: number
}

const keyframes = `
@keyframes auxos-orb-rotate {
  to { transform: rotate(360deg); }
}
@keyframes auxos-orb-rotate-reverse {
  to { transform: rotate(-360deg); }
}
@keyframes auxos-orb-glow-dormant {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}
@keyframes auxos-orb-glow-alert {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.15); }
}
@keyframes auxos-orb-highlight {
  0%, 100% { opacity: 0.3; transform: translate(0, 0); }
  50% { opacity: 0.6; transform: translate(5px, 3px); }
}
`

export function SiriOrb({ state, onClick, size = 60 }: SiriOrbProps) {
  const [isHovered, setIsHovered] = useState(false)

  const outerSpeed = state === 'alert' ? '3s' : '4s'
  const glowAnim = state === 'alert' ? 'auxos-orb-glow-alert' : 'auxos-orb-glow-dormant'
  const scale = isHovered ? 1.1 : 1

  return (
    <>
      <style>{keyframes}</style>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Open assistant"
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: 'transparent',
          padding: 0,
          transform: `scale(${scale})`,
          transition: 'transform 0.2s ease',
        }}
      >
        {/* Glow layer */}
        <div
          style={{
            position: 'absolute',
            inset: `-${size * 0.33}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
            animation: `${glowAnim} 3s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Outer rotating gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #f43f5e, #6366f1)',
            animation: `auxos-orb-rotate ${outerSpeed} linear infinite`,
          }}
        />

        {/* Inner counter-rotating gradient */}
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            borderRadius: '50%',
            background: 'conic-gradient(from 180deg, #818cf8, #a78bfa, #f472b6, #fb7185, #818cf8)',
            animation: 'auxos-orb-rotate-reverse 6s linear infinite',
            filter: 'blur(4px)',
          }}
        />

        {/* Highlight */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '20%',
            width: '30%',
            height: '20%',
            background: 'rgba(255,255,255,0.4)',
            borderRadius: '50%',
            filter: 'blur(8px)',
            animation: 'auxos-orb-highlight 3s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      </button>
    </>
  )
}
```

- [ ] **Step 2: Verify the component renders**

```bash
cd /Users/jerrywu/conductor/workspaces/auxos-web-agent/tacoma && npx tsc --noEmit --project packages/auxos-agent/tsconfig.json 2>&1 | head -20
```

If no tsconfig exists in the package, just check that the file has no syntax errors by running:

```bash
cd /Users/jerrywu/conductor/workspaces/auxos-web-agent/tacoma && npx -y typescript --noEmit packages/auxos-agent/src/components/SiriOrb.tsx 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add packages/auxos-agent/src/components/SiriOrb.tsx
git commit -m "feat: create SiriOrb component with animated gradient states"
```

---

### Task 4: Create SpeechBubble Component

**Files:**
- Create: `packages/auxos-agent/src/components/SpeechBubble.tsx`

- [ ] **Step 1: Create the SpeechBubble component**

Create `packages/auxos-agent/src/components/SpeechBubble.tsx`:

```tsx
'use client'

const keyframes = `
@keyframes auxos-bubble-fade-in {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}
`

interface SpeechBubbleProps {
  message: string
  visible: boolean
  onClick: () => void
}

export function SpeechBubble({ message, visible, onClick }: SpeechBubbleProps) {
  if (!visible) return null

  return (
    <>
      <style>{keyframes}</style>
      <button
        onClick={onClick}
        style={{
          position: 'absolute',
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: '12px',
          background: 'rgba(30, 32, 48, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '10px 16px',
          fontSize: '13px',
          color: '#cbd5e1',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          animation: 'auxos-bubble-fade-in 0.5s ease forwards',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          fontFamily: 'inherit',
        }}
      >
        {message}
        {/* Arrow pointing right toward orb */}
        <div
          style={{
            position: 'absolute',
            right: '-6px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            background: 'rgba(30, 32, 48, 0.8)',
            borderRight: '1px solid rgba(255,255,255,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        />
      </button>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/auxos-agent/src/components/SpeechBubble.tsx
git commit -m "feat: create SpeechBubble component with frosted glass styling"
```

---

### Task 5: Update AuxosAgent to Use SiriOrb

**Files:**
- Modify: `packages/auxos-agent/src/components/AuxosAgent.tsx`

- [ ] **Step 1: Replace AgentButton with SiriOrb and wire idle props**

Replace the entire contents of `packages/auxos-agent/src/components/AuxosAgent.tsx` with:

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

export function AuxosAgent(config: AuxosConfig) {
  const [isOpen, setIsOpen] = useState(false)
  const theme = useMemo(() => createTheme(config.theme || {}), [config.theme])

  const { messages, isLoading, streamingText, send } = useAgent({
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

  const orbState: OrbState = isOpen ? 'active' : isIdle ? 'alert' : 'dormant'

  const updateOpen = useCallback((open: boolean) => {
    setIsOpen(open)
    config.onOpenChange?.(open)
  }, [config.onOpenChange])

  // Dismiss idle alert on click-anywhere or scroll
  useEffect(() => {
    if (!isIdle) return

    function handleDismiss(e: Event) {
      // Don't dismiss if clicking on the orb/bubble container
      const target = e.target as HTMLElement
      if (target.closest('[data-auxos-orb]')) return
      config.onIdleDismiss?.()
    }

    window.addEventListener('click', handleDismiss)
    window.addEventListener('scroll', handleDismiss, { once: true })
    return () => {
      window.removeEventListener('click', handleDismiss)
      window.removeEventListener('scroll', handleDismiss)
    }
  }, [isIdle, config.onIdleDismiss])

  const handleOrbClick = useCallback(() => {
    if (isOpen) {
      updateOpen(false)
    } else {
      if (isIdle && idleMessage) {
        config.onIdleDismiss?.()
        updateOpen(true)
        setTimeout(() => send(idleMessage), 100)
      } else {
        updateOpen(true)
      }
    }
  }, [isOpen, isIdle, idleMessage, config.onIdleDismiss, send, updateOpen])

  const handleBubbleClick = useCallback(() => {
    config.onIdleDismiss?.()
    updateOpen(true)
    if (idleMessage) {
      setTimeout(() => send(idleMessage), 100)
    }
  }, [idleMessage, config.onIdleDismiss, send, updateOpen])

  return (
    <>
      {/* Entry point: SiriOrb (CRM) or AgentButton (SolaGlow fallback) */}
      {!isOpen && (
        useOrbMode ? (
          <div
            data-auxos-orb
            style={{
              position: 'fixed',
              bottom: '24px',
              right: '24px',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SpeechBubble
              message={idleMessage}
              visible={isIdle}
              onClick={handleBubbleClick}
            />
            <SiriOrb state={orbState} onClick={handleOrbClick} />
          </div>
        ) : (
          <AgentButton isOpen={isOpen} onClick={() => updateOpen(true)} theme={theme} />
        )
      )}

      <AgentPanel
        isOpen={isOpen}
        onClose={() => updateOpen(false)}
        messages={messages}
        isLoading={isLoading}
        streamingText={streamingText}
        onSend={send}
        name={config.name}
        tagline={config.tagline}
        suggestions={config.suggestions}
        theme={theme}
      />
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/auxos-agent/src/components/AuxosAgent.tsx
git commit -m "feat: replace AgentButton with SiriOrb in AuxosAgent"
```

---

### Task 6: Reskin AgentPanel with Glassmorphism

**Files:**
- Modify: `packages/auxos-agent/src/components/AgentPanel.tsx`

- [ ] **Step 1: Rewrite AgentPanel with glassmorphism styling**

Replace the entire contents of `packages/auxos-agent/src/components/AgentPanel.tsx` with:

```tsx
'use client'

import { useEffect, useRef, KeyboardEvent, useState } from 'react'
import { X, Send } from 'lucide-react'
import { SiriOrb } from './SiriOrb'
import { AgentMessage } from './AgentMessage'
import { ToolMessage } from './ToolMessage'
import type { AuxosTheme, DisplayMessage } from '../types'

interface AgentPanelProps {
  isOpen: boolean
  onClose: () => void
  messages: DisplayMessage[]
  isLoading: boolean
  streamingText: string
  onSend: (text: string) => void
  name?: string
  tagline?: string
  suggestions?: string[]
  theme: AuxosTheme
}

const panelKeyframes = `
@keyframes auxos-panel-expand {
  from { transform: scale(0.3); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes auxos-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
`

export function AgentPanel({
  isOpen,
  onClose,
  messages,
  isLoading,
  streamingText,
  onSend,
  name = 'Assistant',
  tagline = 'AI Assistant',
  suggestions = [],
  theme,
}: AgentPanelProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, streamingText])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 76) + 'px'
  }, [input])

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 100)
  }, [isOpen])

  function handleSend(text?: string) {
    const content = (text ?? input).trim()
    if (!content || isLoading) return
    setInput('')
    onSend(content)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <style>{panelKeyframes}</style>
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 50,
          width: '400px',
          height: '600px',
          background: theme.colors.glassBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: `1px solid ${theme.colors.glassBorder}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.1)',
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'auxos-panel-expand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transformOrigin: 'bottom right',
          fontFamily: theme.fonts.body,
        }}
      >
        {/* Header — minimal glassmorphism */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: `1px solid ${theme.colors.glassBorder}`,
            flexShrink: 0,
          }}
        >
          <p
            style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: 0,
              background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {name}
          </p>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              height: '28px',
              width: '28px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textMuted,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.text
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textMuted
            }}
          >
            <X style={{ height: '16px', width: '16px' }} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.length === 0 && !isLoading ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ margin: '0 auto 12px', width: '48px', height: '48px' }}>
                  <SiriOrb state="dormant" onClick={() => {}} size={48} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: theme.colors.text, margin: 0 }}>
                  How can I help you today?
                </p>
              </div>
              {suggestions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {suggestions.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      style={{
                        textAlign: 'left',
                        fontSize: '12px',
                        color: theme.colors.textMuted,
                        background: theme.colors.glassSurface,
                        border: `1px solid ${theme.colors.glassBorder}`,
                        borderRadius: '10px',
                        padding: '10px 14px',
                        cursor: 'pointer',
                        fontFamily: theme.fonts.body,
                        transition: 'all 0.15s',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
                        e.currentTarget.style.color = theme.colors.text
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.colors.glassSurface
                        e.currentTarget.style.borderColor = theme.colors.glassBorder
                        e.currentTarget.style.color = theme.colors.textMuted
                      }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {messages.map((msg, i) =>
                msg.type === 'tool' ? (
                  <ToolMessage key={i} toolName={msg.toolName} result={msg.result} theme={theme} />
                ) : (
                  <AgentMessage key={i} role={msg.type} content={msg.content} theme={theme} />
                )
              )}
              {streamingText && (
                <AgentMessage role="assistant" content={streamingText} isStreaming theme={theme} />
              )}
              {isLoading && !streamingText && (
                <AgentMessage role="assistant" content="" isStreaming theme={theme} />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input — Siri-style pill */}
        <div style={{ flexShrink: 0, padding: '12px 16px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
              background: theme.colors.glassSurface,
              border: `1px solid ${theme.colors.glassBorder}`,
              borderRadius: '28px',
              padding: '6px 6px 6px 8px',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.glassBorder
            }}
          >
            {/* Mini orb in input */}
            <div style={{ flexShrink: 0, width: '28px', height: '28px', marginBottom: '2px' }}>
              <SiriOrb state="dormant" onClick={() => {}} size={28} />
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask ${name}...`}
              disabled={isLoading}
              rows={1}
              suppressHydrationWarning
              style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: '0%',
                backgroundColor: 'transparent',
                fontSize: '14px',
                color: theme.colors.text,
                resize: 'none',
                outline: 'none',
                border: 'none',
                minHeight: '28px',
                maxHeight: '76px',
                lineHeight: '28px',
                fontFamily: theme.fonts.body,
                opacity: isLoading ? 0.5 : 1,
              }}
            />

            {/* Send button — only visible when there's input */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
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
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                transition: 'all 0.2s',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'transparent',
                color: input.trim() && !isLoading ? 'white' : 'transparent',
                opacity: input.trim() && !isLoading ? 1 : 0,
              }}
            >
              <Send style={{ height: '14px', width: '14px' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/auxos-agent/src/components/AgentPanel.tsx
git commit -m "feat: reskin AgentPanel with glassmorphism and Siri-style input"
```

---

### Task 7: Reskin AgentMessage with Glassmorphism

**Files:**
- Modify: `packages/auxos-agent/src/components/AgentMessage.tsx`

- [ ] **Step 1: Update message bubble styling**

Replace the entire contents of `packages/auxos-agent/src/components/AgentMessage.tsx` with:

```tsx
'use client'

import type { AuxosTheme } from '../types'

interface AgentMessageProps {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  theme: AuxosTheme
}

export function AgentMessage({ role, content, isStreaming = false, theme }: AgentMessageProps) {
  const isUser = role === 'user'
  const lines = content.split('\n')

  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '12px',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          maxWidth: '78%',
          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '10px 14px',
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: theme.fonts.body,
          ...(isUser
            ? {
                background: theme.colors.glassSurface,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1px solid ${theme.colors.glassBorder}`,
                color: theme.colors.text,
              }
            : {
                background: theme.colors.glassSurface,
                border: `1px solid ${theme.colors.glassBorder}`,
                color: theme.colors.textSecondary,
              }),
        }}
      >
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
        {isStreaming && (
          <span
            style={{
              display: 'inline-block',
              width: '6px',
              height: '14px',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              borderRadius: '2px',
              backgroundColor: theme.colors.textMuted,
              animation: 'auxos-blink 1s infinite',
            }}
          />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/auxos-agent/src/components/AgentMessage.tsx
git commit -m "feat: reskin AgentMessage with frosted glass bubbles"
```

---

### Task 8: Reskin ToolMessage with Glassmorphism

**Files:**
- Modify: `packages/auxos-agent/src/components/ToolMessage.tsx`

- [ ] **Step 1: Update tool message styling**

Replace the entire contents of `packages/auxos-agent/src/components/ToolMessage.tsx` with:

```tsx
'use client'

import { Wrench, Check, AlertCircle } from 'lucide-react'
import type { AuxosTheme, ToolResult } from '../types'

interface ToolMessageProps {
  toolName: string
  result: ToolResult
  theme: AuxosTheme
}

function formatToolName(name: string): string {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function summarizeResult(result: ToolResult): string {
  if (!result.success) return result.error || 'Failed'
  if (!result.data) return 'Done'
  if (typeof result.data === 'object' && result.data !== null) {
    const d = result.data as Record<string, unknown>
    if (d.name) return String(d.name)
    if (d.updatedCount) return `${d.updatedCount} updated`
    if (d.navigate) return `→ ${d.navigate}`
    if (d.id) return `ID: ${d.id}`
    const keys = Object.keys(d)
    if (keys.length <= 4) return keys.join(', ')
  }
  return 'Done'
}

export function ToolMessage({ toolName, result, theme }: ToolMessageProps) {
  const Icon = result.success ? Check : AlertCircle
  const iconColor = result.success ? '#34d399' : '#f87171'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '8px',
        padding: '6px 10px',
        borderRadius: '8px',
        background: result.success ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        border: `1px solid ${result.success ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`,
        fontSize: '12px',
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.body,
      }}
    >
      <Wrench style={{ height: '12px', width: '12px', flexShrink: 0, color: theme.colors.textMuted }} />
      <span style={{ fontWeight: 500 }}>{formatToolName(toolName)}</span>
      <span style={{ color: theme.colors.textMuted }}>&mdash;</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {summarizeResult(result)}
      </span>
      <Icon style={{ height: '12px', width: '12px', flexShrink: 0, color: iconColor }} />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/auxos-agent/src/components/ToolMessage.tsx
git commit -m "feat: reskin ToolMessage with glass aesthetic"
```

---

### Task 9: Create useIdleDetection Hook

**Files:**
- Create: `crm/src/hooks/useIdleDetection.ts`

- [ ] **Step 1: Create the hook**

Create `crm/src/hooks/useIdleDetection.ts`:

```typescript
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface UseIdleDetectionOptions {
  /** Idle timeout in ms. Default 30000 (30s). */
  timeout?: number
  /** Cooldown after dismiss in ms. Default 300000 (5 min). */
  cooldown?: number
  /** Set to false to pause detection (e.g., when panel is open). */
  enabled?: boolean
}

interface UseIdleDetectionReturn {
  isIdle: boolean
  idleMessage: string
  dismiss: () => void
}

const MESSAGES: Record<string, string> = {
  '/contacts': 'Need help finding a contact?',
  '/companies': 'Want to look up a company?',
  '/deals': 'Want me to update any deal stages?',
  '/tasks': 'I can help knock out some tasks.',
  '/emails': 'Want me to draft an email?',
  '/dashboard': 'Want a summary of today\'s activity?',
  '/': 'Want a summary of today\'s activity?',
  '/reports': 'I can generate a report for you.',
  '/settings': 'Need help with configuration?',
}

const FALLBACK_MESSAGE = 'Need a hand with anything?'

function getMessageForRoute(pathname: string): string {
  // Exact match first
  if (MESSAGES[pathname]) return MESSAGES[pathname]
  // Prefix match (e.g., /contacts/123 → /contacts)
  const prefix = '/' + pathname.split('/').filter(Boolean)[0]
  return MESSAGES[prefix] || FALLBACK_MESSAGE
}

export function useIdleDetection({
  timeout = 30000,
  cooldown = 300000,
  enabled = true,
}: UseIdleDetectionOptions = {}): UseIdleDetectionReturn {
  const pathname = usePathname()
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownRef = useRef(false)

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    // If in cooldown or disabled, don't start a new timer
    if (cooldownRef.current || !enabled) return

    // If currently idle, dismiss on any activity
    setIsIdle(false)

    timerRef.current = setTimeout(() => {
      setIsIdle(true)
    }, timeout)
  }, [timeout, enabled])

  const dismiss = useCallback(() => {
    setIsIdle(false)
    if (timerRef.current) clearTimeout(timerRef.current)

    // Start cooldown
    cooldownRef.current = true
    setTimeout(() => {
      cooldownRef.current = false
      // Reset timer after cooldown ends
      resetTimer()
    }, cooldown)
  }, [cooldown, resetTimer])

  // Track user activity
  useEffect(() => {
    if (!enabled) {
      setIsIdle(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const events = ['mousemove', 'click', 'scroll', 'keydown'] as const

    // Start initial timer
    resetTimer()

    // Reset on any activity
    const handler = () => resetTimer()
    events.forEach((evt) => window.addEventListener(evt, handler, { passive: true }))

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handler))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, resetTimer])

  // Reset on page navigation
  useEffect(() => {
    setIsIdle(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!cooldownRef.current && enabled) {
      timerRef.current = setTimeout(() => setIsIdle(true), timeout)
    }
  }, [pathname, timeout, enabled])

  return {
    isIdle,
    idleMessage: getMessageForRoute(pathname),
    dismiss,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add crm/src/hooks/useIdleDetection.ts
git commit -m "feat: create useIdleDetection hook with page-aware messages"
```

---

### Task 10: Update AgentWrapper to Integrate Idle Detection

**Files:**
- Modify: `crm/src/components/agent/AgentWrapper.tsx`

- [ ] **Step 1: Wire up the idle detection hook**

Replace the entire contents of `crm/src/components/agent/AgentWrapper.tsx` with:

```tsx
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
    />
  )
}
```

Note: The theme primary color changes from blue (`#3b82f6`) to indigo (`#6366f1`) to match the orb's color palette.

- [ ] **Step 2: Handle panelOpen state**

There's a problem: `AuxosAgent` manages its own `isOpen` state internally, but `AgentWrapper` needs to know when the panel is open to pause idle detection. We need to expose an `onOpenChange` callback on `AuxosConfig`.

Add to `packages/auxos-agent/src/types.ts`, in the `AuxosConfig` interface:

```typescript
  /** Called when the panel opens or closes. */
  onOpenChange?: (isOpen: boolean) => void
```

Then in `packages/auxos-agent/src/components/AuxosAgent.tsx`, add a call to `onOpenChange` whenever `isOpen` changes. Replace the `setIsOpen` calls with a wrapper:

After the existing `const [isOpen, setIsOpen] = useState(false)` line, add:

```typescript
  const updateOpen = useCallback((open: boolean) => {
    setIsOpen(open)
    config.onOpenChange?.(open)
  }, [config.onOpenChange])
```

Then replace all `setIsOpen(false)` with `updateOpen(false)` and `setIsOpen(true)` with `updateOpen(true)` in the component.

Update `AgentWrapper` to use this:

```tsx
      onOpenChange={setPanelOpen}
```

- [ ] **Step 3: Commit**

```bash
git add packages/auxos-agent/src/types.ts packages/auxos-agent/src/components/AuxosAgent.tsx crm/src/components/agent/AgentWrapper.tsx
git commit -m "feat: wire up idle detection in AgentWrapper with onOpenChange callback"
```

---

### Task 11: Update Package Exports

**Files:**
- Modify: `packages/auxos-agent/src/index.ts`

- [ ] **Step 1: Add new exports, keep AgentButton for backward compat**

Replace the contents of `packages/auxos-agent/src/index.ts` with:

```typescript
// Components
export { AuxosAgent } from './components/AuxosAgent'
export { AgentPanel } from './components/AgentPanel'
export { AgentButton } from './components/AgentButton'
export { AgentMessage } from './components/AgentMessage'
export { ToolMessage } from './components/ToolMessage'
export { SiriOrb } from './components/SiriOrb'
export { SpeechBubble } from './components/SpeechBubble'

// Hooks
export { useAgent } from './hooks/useAgent'

// Theme
export { createTheme, defaultTheme } from './theme'

// Tool builders
export { crud, search, navigation, custom } from './tools/builder'

// Types
export type {
  AuxosTool,
  AuxosConfig,
  AuxosTheme,
  AuxosEvent,
  DisplayMessage,
  ToolResult,
  ToolSchema,
  ApiHandlerConfig,
  CrudConfig,
  CrudField,
  SearchConfig,
  NavigationConfig,
} from './types'

export type { OrbState } from './components/SiriOrb'
```

- [ ] **Step 2: Commit**

```bash
git add packages/auxos-agent/src/index.ts
git commit -m "feat: export SiriOrb, SpeechBubble, and OrbState from package"
```

---

### Task 12: Build Verification

- [ ] **Step 1: Run the Next.js dev server and verify no build errors**

```bash
cd /Users/jerrywu/conductor/workspaces/auxos-web-agent/tacoma && npm run dev --workspace=auxos-crm
```

Fix any TypeScript or import errors that surface.

- [ ] **Step 2: Visual verification checklist**

Open `http://localhost:3000` in a browser and verify:

1. The Siri orb appears in the bottom-right corner (60px, rotating gradients)
2. The orb is in "dormant" state — slow rotation, minimal glow
3. After 30 seconds of no activity, the orb transitions to "alert" — glow intensifies, speech bubble appears with a page-contextual message
4. Clicking the orb or bubble opens the glassmorphism chat panel
5. The panel has frosted glass background, gradient "Auxos" header text, Siri-style pill input bar with mini orb
6. Message bubbles are frosted glass style
7. Suggestion chips work and have glass styling
8. Clicking close collapses the panel back to the orb
9. After dismissing the alert, it doesn't re-trigger for 5 minutes
10. Navigating to a different page shows a different contextual message

- [ ] **Step 3: Verify SolaGlow still works**

```bash
cd /Users/jerrywu/conductor/workspaces/auxos-web-agent/tacoma && npm run dev --workspace=auxos-solaglow
```

SolaGlow should still use `AgentButton` (not the orb) since it uses its own `AgentWrapper` that doesn't pass idle props. Verify it renders without errors.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A && git commit -m "fix: resolve build issues from smart popup agent integration"
```
