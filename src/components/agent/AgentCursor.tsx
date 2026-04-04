'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface CursorPosition {
  x: number
  y: number
  visible: boolean
  clicking: boolean
  /** CSS transition duration for movement, dynamically set based on distance */
  moveDuration: number
}

interface AgentStep {
  type: 'move' | 'click' | 'type' | 'wait' | 'scroll-to'
  selector?: string
  text?: string
  delay?: number
}

type QueueItem = {
  steps: AgentStep[]
  resolve: () => void
}

/** Minimum move duration so very short moves don't look instant */
const MIN_MOVE_MS = 200
/** Constant speed: pixels per second */
const MOVE_PX_PER_SEC = 400

// Use a global queue on window to avoid module duplication in Next.js
function getQueue(): QueueItem[] {
  const w = window as any
  if (!w.__agentCursorQueue) w.__agentCursorQueue = []
  return w.__agentCursorQueue
}

/**
 * Queue visual steps and return a Promise that resolves when they complete.
 * The caller should AWAIT this before mutating state.
 */
export function queueAgentSteps(steps: AgentStep[]): Promise<void> {
  return new Promise((resolve) => {
    getQueue().push({ steps, resolve })
    window.dispatchEvent(new CustomEvent('agent-steps-queued'))
  })
}

export function AgentCursor() {
  const [pos, setPos] = useState<CursorPosition>({
    x: -100,
    y: -100,
    visible: false,
    clicking: false,
    moveDuration: MIN_MOVE_MS,
  })
  const processingRef = useRef(false)
  /** Track last known cursor position for distance calculations */
  const lastPosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 })
  /** Stable key for ripple animations, incremented on each click */
  const clickCountRef = useRef(0)

  /**
   * Calculate a natural-feeling move duration based on pixel distance.
   */
  function calcMoveDuration(fromX: number, fromY: number, toX: number, toY: number): number {
    const dx = toX - fromX
    const dy = toY - fromY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ms = (dist / MOVE_PX_PER_SEC) * 1000
    return Math.max(MIN_MOVE_MS, ms)
  }

  /**
   * Move the cursor to (x, y) with distance-based timing.
   * Returns the computed move duration so callers can await the right amount.
   */
  function moveTo(x: number, y: number): number {
    const duration = calcMoveDuration(lastPosRef.current.x, lastPosRef.current.y, x, y)
    lastPosRef.current = { x, y }
    setPos((p) => ({ ...p, x, y, clicking: false, moveDuration: duration }))
    return duration
  }

  const processQueue = useCallback(async () => {
    const queue = getQueue()
    if (processingRef.current || queue.length === 0) return
    processingRef.current = true

    // Always start from the chat button position (bottom-right corner)
    const startX = window.innerWidth - 34
    const startY = window.innerHeight - 34
    lastPosRef.current = { x: startX, y: startY }
    setPos((p) => ({ ...p, x: startX, y: startY, moveDuration: 0 }))
    // Small delay so the opacity transition has a frame to start from
    await sleep(30)
    setPos((p) => ({ ...p, visible: true }))
    await sleep(350) // let fade-in complete

    while (queue.length > 0) {
      const item = queue.shift()!

      for (const step of item.steps) {
        switch (step.type) {
          case 'scroll-to': {
            if (!step.selector) break
            const el = document.querySelector(step.selector)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            await sleep(500)
            break
          }

          case 'move': {
            if (!step.selector) break
            const el = await waitForElement(step.selector, 2500)
            if (!el) break
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            await sleep(150)
            const rect = el.getBoundingClientRect()
            const dur = moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
            await sleep(dur + 80) // wait for CSS transition + small settle
            break
          }

          case 'click': {
            if (!step.selector) break
            const el = await waitForElement(step.selector, 2500)
            if (!el) break
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            await sleep(150)
            const rect = el.getBoundingClientRect()
            // Move to element
            const dur = moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
            await sleep(dur + 80)
            // Click animation — slight press down
            clickCountRef.current++
            setPos((p) => ({ ...p, clicking: true }))
            await sleep(180)
            // Trigger the actual click
            ;(el as HTMLElement).click()
            await sleep(120)
            setPos((p) => ({ ...p, clicking: false }))
            await sleep(250) // breathing room after click
            break
          }

          case 'type': {
            if (!step.selector || !step.text) break
            const el = (await waitForElement(step.selector, 3000)) as
              | HTMLInputElement
              | HTMLTextAreaElement
              | null
            if (!el) break
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            await sleep(200)
            const rect = el.getBoundingClientRect()
            // Move into the field (left-biased so the cursor sits where text starts)
            const dur = moveTo(rect.left + 40, rect.top + rect.height / 2)
            await sleep(dur + 60)
            // Click to focus
            clickCountRef.current++
            setPos((p) => ({ ...p, clicking: true }))
            await sleep(140)
            setPos((p) => ({ ...p, clicking: false }))
            el.focus()
            el.click()
            await sleep(180)
            // Type character by character with natural rhythm
            const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
            let currentValue = el.value || ''
            for (let i = 0; i < step.text.length; i++) {
              const char = step.text[i]
              currentValue += char
              if (nativeSetter) {
                nativeSetter.call(el, currentValue)
              } else {
                el.value = currentValue
              }
              el.dispatchEvent(new Event('input', { bubbles: true }))
              // Slightly faster base speed, with occasional micro-pauses for realism
              const isSpace = char === ' '
              const baseDelay = isSpace ? 60 : 35
              const jitter = Math.random() * 40
              // Every ~8 chars, add a tiny "thinking" pause
              const thinkPause = i > 0 && i % (7 + Math.floor(Math.random() * 4)) === 0 ? 80 : 0
              await sleep(baseDelay + jitter + thinkPause)
            }
            await sleep(250)
            break
          }

          case 'wait': {
            await sleep(step.delay || 500)
            break
          }
        }
      }

      // Resolve this queue item's promise so the caller can proceed
      item.resolve()

      // If more items are queued, add a brief inter-tool pause for continuity
      if (queue.length > 0) {
        await sleep(300)
      }
    }

    // Fade out gracefully
    await sleep(400)
    setPos((p) => ({ ...p, visible: false }))
    // Wait for the fade-out transition to finish before fully resetting
    await sleep(400)
    processingRef.current = false
  }, [])

  useEffect(() => {
    const handler = () => processQueue()
    window.addEventListener('agent-steps-queued', handler)
    return () => window.removeEventListener('agent-steps-queued', handler)
  }, [processQueue])

  return (
    <div
      style={{
        position: 'fixed',
        left: pos.x - 4,
        top: pos.y - 2,
        width: '28px',
        height: '28px',
        pointerEvents: 'none',
        zIndex: 99999,
        transition: [
          `left ${pos.moveDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          `top ${pos.moveDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          'transform 0.15s ease-out',
          'opacity 0.35s ease-in-out',
        ].join(', '),
        transform: pos.clicking ? 'scale(0.8)' : 'scale(1)',
        opacity: pos.visible ? 1 : 0,
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill="#6366f1"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {pos.clicking && (
        <>
          <div
            key={`ripple-${clickCountRef.current}`}
            style={{
              position: 'absolute',
              left: '6px',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: '2px solid rgba(99, 102, 241, 0.6)',
              animation: 'agent-ripple 0.6s ease-out forwards',
            }}
          />
          <div
            key={`ripple2-${clickCountRef.current}`}
            style={{
              position: 'absolute',
              left: '6px',
              top: '4px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'rgba(99, 102, 241, 0.15)',
              animation: 'agent-ripple-fill 0.4s ease-out forwards',
            }}
          />
        </>
      )}
    </div>
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function waitForElement(selector: string, timeout: number): Promise<Element | null> {
  return new Promise((resolve) => {
    const el = document.querySelector(selector)
    if (el) return resolve(el)

    const start = Date.now()
    const interval = setInterval(() => {
      const el = document.querySelector(selector)
      if (el) {
        clearInterval(interval)
        resolve(el)
      } else if (Date.now() - start > timeout) {
        clearInterval(interval)
        resolve(null)
      }
    }, 80)
  })
}
