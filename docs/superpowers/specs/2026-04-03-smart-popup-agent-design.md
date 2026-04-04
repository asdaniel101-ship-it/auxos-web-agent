# Smart Popup Agent — Design Spec

## Overview

Transform the CRM agent from a passive chatbot (hidden behind a button) into a proactive, Siri-inspired ambient assistant that detects user idle stalling and intelligently offers help. The existing agent button is replaced by a fluid, iridescent orb that serves as both the always-visible entry point and the idle-triggered alert mechanism. The chat panel gets a full glassmorphism redesign to match.

## Scope

- **App:** CRM only (not SolaGlow)
- **Trigger:** Idle stalling (30s of no user activity)
- **Architecture:** Client-side idle watcher, no API calls for the popup itself
- **Visual:** Siri-style orb + glassmorphism chat panel

---

## 1. Idle Detection System

### Hook: `useIdleDetection`

A React hook added to the CRM layout that monitors user activity and triggers the orb's alert state.

**Tracked events:** `mousemove`, `click`, `scroll`, `keydown`

**Behavior:**
- After **30 seconds** of no tracked events, the hook fires an `onIdle` callback
- The hook is **page-aware** — reads the current Next.js route to determine which contextual message to display
- After the user dismisses the alert or interacts with the page, a **5-minute cooldown** prevents re-triggering
- If the chat panel is open, idle detection is **paused entirely**
- When the panel is closed, the idle timer resets fresh (no immediate re-trigger)
- The hook resets its timer on every tracked event

**Contextual messages by route:**

| Route | Message |
|-------|---------|
| `/contacts` | "Need help finding a contact?" |
| `/companies` | "Want to look up a company?" |
| `/deals` | "Want me to update any deal stages?" |
| `/tasks` | "I can help knock out some tasks." |
| `/emails` | "Want me to draft an email?" |
| `/dashboard` | "Want a summary of today's activity?" |
| `/reports` | "I can generate a report for you." |
| `/settings` | "Need help with configuration?" |
| Fallback | "Need a hand with anything?" |

**Interface:**
```typescript
interface UseIdleDetectionOptions {
  timeout: number;          // ms, default 30000
  cooldown: number;         // ms, default 300000 (5 min)
  enabled: boolean;         // pause when panel is open
}

interface UseIdleDetectionReturn {
  isIdle: boolean;          // true when idle threshold exceeded
  idleMessage: string;      // contextual message for current page
  dismiss: () => void;      // dismiss and start cooldown
  reset: () => void;        // reset idle timer
}
```

---

## 2. Siri-Style Orb (Replaces Agent Button)

The existing `AgentButton` (56px gradient circle in bottom-right) is replaced by an animated Siri-style orb.

### Visual Design

- **Size:** 60px diameter, fixed position bottom-right (24px from edges)
- **Appearance:** Two counter-rotating conic gradients layered on top of each other
  - Outer layer: `conic-gradient(from 0deg, #6366f1, #8b5cf6, #ec4899, #f43f5e, #6366f1)` rotating clockwise at 4s/revolution
  - Inner layer: `conic-gradient(from 180deg, #818cf8, #a78bfa, #f472b6, #fb7185, #818cf8)` rotating counter-clockwise at 6s/revolution, with slight blur
  - A drifting highlight (white, 30% opacity, blurred) that moves across the surface on a 3s loop
- **Glow:** A radial gradient behind the orb (`rgba(99,102,241,0.15)`) that pulses gently

### Orb States

**1. Dormant (default)**
- Slow rotation (4s/revolution outer, 6s/revolution inner)
- Minimal glow (opacity 0.3, scale 1.0)
- Static, just sitting in the corner

**2. Alert (idle triggered)**
- Rotation speed increases slightly (3s/revolution outer)
- Glow expands and pulses (opacity cycles 0.5 → 1.0, scale cycles 1.0 → 1.15 on a 3s loop)
- A frosted-glass speech bubble fades in to the left of the orb with the contextual message
- Transition from dormant → alert is a smooth 0.5s animation

**3. Hover**
- Orb scales to 1.1x
- Glow intensifies (opacity 0.8)
- Cursor changes to pointer

**4. Active (panel open)**
- Orb remains visible — morphs down to 28px and moves into the input bar of the chat panel
- Continues rotating as a visual anchor connecting the orb to the panel

### Speech Bubble (Alert State)

- Appears to the left of the orb
- Frosted glass background: `rgba(30, 32, 48, 0.8)` with `backdrop-filter: blur(12px)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Rounded corners (12px)
- Small right-pointing arrow connecting to the orb
- Single line of text, 13px, light gray
- Fade-in animation: 0.5s ease, with slight translateX from right to left
- Clicking the bubble or the orb opens the chat panel with the contextual message pre-loaded as the agent's first message (as if the user typed it)

### Dismissal

- Clicking anywhere on the page (not the orb/bubble) dismisses the alert
- Scrolling dismisses the alert
- Speech bubble fades out, orb returns to dormant state
- 5-minute cooldown begins

---

## 3. Glassmorphism Chat Panel

The existing `AgentPanel` is redesigned with a Siri-inspired frosted glass aesthetic.

### Panel Container

- **Size:** 400px wide, 600px tall (same as current)
- **Position:** Fixed, bottom-right, positioned so the orb aligns with the input bar
- **Background:** `rgba(15, 17, 23, 0.7)` with `backdrop-filter: blur(20px)`
- **Border:** `1px solid rgba(255, 255, 255, 0.1)`
- **Border radius:** 20px
- **Shadow:** `0 8px 32px rgba(0, 0, 0, 0.4)`, plus a subtle indigo-tinted outer glow `0 0 40px rgba(99, 102, 241, 0.1)`

### Open/Close Transition

- **Opening:** The panel grows outward from the orb's position, expanding upward. The orb simultaneously slides down and shrinks to 28px to become the input bar's icon. One connected motion (~0.4s, cubic-bezier ease).
- **Closing:** Reverse — panel collapses back down into the orb, which grows back to 60px. The orb returns to its dormant state.

### Header

- Minimal: "Auxos" text with a subtle gradient treatment (indigo → purple via `background-clip: text`)
- No heavy background — the frosted glass shows through
- Close button (X): barely visible (opacity 0.3) until hovered (opacity 1.0)
- Height: ~48px

### Message Area

- Scrollable container with the frosted panel showing through behind messages
- **User messages:** Right-aligned pill bubbles, frosted glass background with a slight white tint (`rgba(255,255,255,0.08)`), border `rgba(255,255,255,0.06)`
- **Agent messages:** Left-aligned, slightly darker frosted bubbles (`rgba(255,255,255,0.04)`)
- **Tool messages:** Compact, inherit the glass aesthetic, subtle border to differentiate
- Clean typography (14px body), generous spacing (12px gap between messages)
- Auto-scroll to latest message

### Suggestion Chips (Empty State)

- Frosted glass pill buttons in a flex-wrap layout
- Subtle border, slight scale on hover
- Same contextual suggestions as current implementation

### Input Bar

- **Shape:** Pill-shaped (border-radius: 28px), matching the Siri input bar from the reference image
- **Background:** Frosted glass, slightly more opaque than the panel (`rgba(255,255,255,0.08)`) with `backdrop-filter: blur(12px)`
- **Border:** `1px solid rgba(255,255,255,0.1)`
- **Left icon:** The 28px mini orb, still rotating (connects visually to the main orb)
- **Placeholder:** "Ask Auxos..." in light gray (opacity 0.5)
- **Send button:** Only appears when there's text input — a small indigo circle with an arrow icon, fades in smoothly
- **Height:** ~48px, auto-expands for multiline input

---

## 4. Component Architecture

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SiriOrb` | `packages/auxos-agent/src/components/SiriOrb.tsx` | The animated orb with dormant/alert/hover/active states |
| `SpeechBubble` | `packages/auxos-agent/src/components/SpeechBubble.tsx` | Frosted glass bubble shown during alert state |
| `useIdleDetection` | `crm/src/hooks/useIdleDetection.ts` | Idle monitoring hook (CRM-specific, page-aware) |

### Modified Components

| Component | Changes |
|-----------|---------|
| `AuxosAgent` | Replace `AgentButton` with `SiriOrb`, add idle detection integration, new panel open/close transition |
| `AgentPanel` | Full glassmorphism reskin — container, header, messages, input bar |
| `AgentMessage` | Frosted glass bubble styling |
| `AgentWrapper` (CRM) | Wire up `useIdleDetection` hook, pass idle state and messages to `AuxosAgent` |

### Removed Components

| Component | Reason |
|-----------|--------|
| `AgentButton` | Replaced entirely by `SiriOrb` |

### Props Flow

```
AgentWrapper (CRM)
  └─ useIdleDetection(timeout: 30000, cooldown: 300000)
  └─ AuxosAgent
       ├─ SiriOrb (state: dormant | alert | hover | active)
       │    └─ SpeechBubble (visible when alert, message from idle hook)
       └─ AgentPanel (glassmorphism reskin)
            ├─ Header
            ├─ Messages (AgentMessage, ToolMessage)
            ├─ Suggestions
            └─ Input bar (with mini orb)
```

---

## 5. Animation Specifications

### Orb Gradient Rotation
```css
/* Outer layer */
animation: orbRotate 4s linear infinite;
/* Dormant → Alert: transition to 3s */

/* Inner layer */
animation: orbRotateReverse 6s linear infinite;
filter: blur(4px);
```

### Glow Pulse (Alert State)
```css
animation: orbGlow 3s ease-in-out infinite;
/* 0%: opacity 0.5, scale 1.0 */
/* 50%: opacity 1.0, scale 1.15 */
/* 100%: opacity 0.5, scale 1.0 */
```

### Panel Open
```css
animation: panelExpand 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
/* From: scale(0.3), opacity 0, transform-origin bottom-right */
/* To: scale(1), opacity 1 */
```

### Speech Bubble Fade-In
```css
animation: bubbleFadeIn 0.5s ease forwards;
/* From: opacity 0, translateX(10px) */
/* To: opacity 1, translateX(0) */
```

---

## 6. Edge Cases

- **Multiple rapid idle triggers:** Cooldown prevents this. One trigger per 5-minute window.
- **User opens panel manually during idle alert:** Alert dismisses, panel opens normally, idle detection pauses.
- **Page navigation during alert:** Alert dismisses, timer resets for new page.
- **Mobile/small screens:** Orb and panel behavior unchanged, but panel should be full-width on screens < 480px.
- **AgentCursor interaction:** The animated cursor system (existing CRM feature) continues to work independently. The cursor appears above the panel when the agent is executing visual actions.

---

## 7. Out of Scope (Future)

- LLM-powered contextual messages (Approach B)
- Frustration detection beyond idle stalling (rage clicks, search thrashing, etc.)
- SolaGlow integration
- Sound effects or haptics
- User-configurable idle thresholds
