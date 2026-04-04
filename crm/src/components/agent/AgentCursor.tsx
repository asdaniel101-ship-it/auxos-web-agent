'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useAgentUIStore } from '@/store/agent-ui'

interface CursorPosition {
  x: number
  y: number
  visible: boolean
  clicking: boolean
  moveDuration: number
}

interface AgentStep {
  type: 'move' | 'click' | 'type' | 'wait' | 'scroll-to' | 'dismiss' | 'select-option'
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
const MOVE_PX_PER_SEC = 1600

let aborted = false

// Use a global queue on window to avoid module duplication in Next.js
function getQueue(): QueueItem[] {
  const w = window as any
  if (!w.__agentCursorQueue) w.__agentCursorQueue = []
  return w.__agentCursorQueue
}

/**
 * Cancel all pending cursor animation steps.
 * Resolves all queued promises so awaiting callers unblock immediately.
 */
export function cancelAllSteps() {
  aborted = true
  const queue = getQueue()
  while (queue.length > 0) {
    const item = queue.shift()!
    item.resolve()
  }
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
    moveDuration: 0,
  })
  const processingRef = useRef(false)
  const lastPosRef = useRef({ x: -1, y: -1 })
  const clickCountRef = useRef(0)

  /**
   * Calculate move duration based on pixel distance at constant speed.
   */
  function calcMoveDuration(fromX: number, fromY: number, toX: number, toY: number): number {
    const dx = toX - fromX
    const dy = toY - fromY
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ms = (dist / MOVE_PX_PER_SEC) * 1000
    return Math.max(MIN_MOVE_MS, ms)
  }

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
    aborted = false

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
      if (aborted) break
      const item = queue.shift()!

      for (const step of item.steps) {
        if (aborted) break
        switch (step.type) {
          case 'scroll-to': {
            if (!step.selector) break
            const el = await waitForElement(step.selector, 3000)
            if (!el || aborted) break
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            await sleep(500)
            break
          }

          case 'move': {
            if (!step.selector) break
            const el = await waitForElement(step.selector, 2500)
            if (!el || aborted) break
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            await sleep(150)
            const rect = el.getBoundingClientRect()
            const dur = moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
            await sleep(dur + 80)
            break
          }

          case 'click': {
            if (!step.selector) break
            const el = await waitForElement(step.selector, 2500)
            if (!el || aborted) break
            const clickLabel = getClickLabel(el)
            if (clickLabel) useAgentUIStore.getState().setCurrentAction(clickLabel)
            // Skip scroll for elements inside portals/dropdowns
            const inPortal = el.closest('[data-radix-popper-content-wrapper]') || el.closest('[role="listbox"]')
            if (!inPortal) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              await sleep(150)
            }
            const rect = el.getBoundingClientRect()
            const dur = moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
            await sleep(dur + 80)
            if (aborted) break
            // Click animation
            clickCountRef.current++
            setPos((p) => ({ ...p, clicking: true }))
            await sleep(180)
            // Dispatch full pointer event sequence (Radix UI needs this)
            const center = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, bubbles: true }
            const pointerOpts = { ...center, pointerId: 1, pointerType: 'mouse' as const }
            el.dispatchEvent(new PointerEvent('pointerdown', pointerOpts))
            el.dispatchEvent(new MouseEvent('mousedown', center))
            el.dispatchEvent(new PointerEvent('pointerup', pointerOpts))
            el.dispatchEvent(new MouseEvent('mouseup', center))
            ;(el as HTMLElement).click()

            // Handle form submit buttons (type="submit" inside a <form>).
            // .click() triggers React's onClick via event delegation, but
            // for submit buttons the form's onSubmit needs an explicit nudge.
            if (el instanceof HTMLButtonElement && el.type === 'submit') {
              const form = el.closest('form')
              if (form) {
                form.requestSubmit(el)
              }
            }

            await sleep(120)
            setPos((p) => ({ ...p, clicking: false }))
            await sleep(250)
            break
          }

          case 'type': {
            if (!step.selector || !step.text) break
            const el = await waitForElement(step.selector, 3000) as HTMLInputElement | HTMLTextAreaElement | null
            if (!el || aborted) break
            useAgentUIStore.getState().setCurrentAction(getTypeLabel(el))
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            await sleep(200)
            const rect = el.getBoundingClientRect()
            // Move to field
            const dur = moveTo(rect.left + 40, rect.top + rect.height / 2)
            await sleep(dur + 80)
            // Click to focus
            clickCountRef.current++
            setPos((p) => ({ ...p, clicking: true }))
            await sleep(150)
            setPos((p) => ({ ...p, clicking: false }))
            el.focus()
            el.click()
            await sleep(180)
            if (aborted) break
            // Paste the full value at once
            const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
            const newValue = (el.value || '') + step.text
            if (nativeSetter) {
              nativeSetter.call(el, newValue)
            } else {
              el.value = newValue
            }
            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
            await sleep(150)
            break
          }

          case 'select-option': {
            if (!step.text) break
            useAgentUIStore.getState().setCurrentAction(`Selecting ${step.text}`)
            const option = await waitForElementByText('[role="option"]', step.text, 3000)
            if (!option || aborted) break
            const inPortal = option.closest('[data-radix-popper-content-wrapper]') || option.closest('[role="listbox"]')
            if (!inPortal) {
              option.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              await sleep(150)
            }
            const rect = option.getBoundingClientRect()
            const dur = moveTo(rect.left + rect.width / 2, rect.top + rect.height / 2)
            await sleep(dur + 80)
            if (aborted) break
            clickCountRef.current++
            setPos((p) => ({ ...p, clicking: true }))
            await sleep(180)
            const center = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, bubbles: true }
            const pointerOpts = { ...center, pointerId: 1, pointerType: 'mouse' as const }
            option.dispatchEvent(new PointerEvent('pointerdown', pointerOpts))
            option.dispatchEvent(new MouseEvent('mousedown', center))
            option.dispatchEvent(new PointerEvent('pointerup', pointerOpts))
            option.dispatchEvent(new MouseEvent('mouseup', center))
            ;(option as HTMLElement).click()
            await sleep(120)
            setPos((p) => ({ ...p, clicking: false }))
            await sleep(250)
            break
          }

          case 'dismiss': {
            const listbox = document.querySelector('[role="listbox"]')
            if (listbox) {
              listbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
            }
            await sleep(200)
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

      // If more items are queued, add a brief inter-tool pause
      if (queue.length > 0) {
        await sleep(300)
      }
    }

    // Fade out gracefully
    if (!aborted) {
      await sleep(400)
    }
    setPos((p) => ({ ...p, visible: false }))
    await sleep(400)
    processingRef.current = false
    aborted = false

    // Items may have been queued during the hide-cursor sleep
    if (getQueue().length > 0) {
      processQueue()
    }
  }, [])

  useEffect(() => {
    const handler = () => processQueue()
    window.addEventListener('agent-steps-queued', handler)
    return () => window.removeEventListener('agent-steps-queued', handler)
  }, [processQueue])

  const executing = useAgentUIStore((s) => s.executing)

  const cursor = executing
    ? { size: 18, left: pos.x - 9, top: pos.y - 9, rippleOffset: '1px', filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' }
    : { size: 28, left: pos.x - 4, top: pos.y - 2, rippleOffset: '6px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }

  return (
    <div
      style={{
        position: 'fixed',
        left: cursor.left,
        top: cursor.top,
        width: `${cursor.size}px`,
        height: `${cursor.size}px`,
        pointerEvents: 'none',
        zIndex: 99999,
        transition: `left ${pos.moveDuration}ms cubic-bezier(0.4, 0, 0.2, 1), top ${pos.moveDuration}ms cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s, opacity 0.35s`,
        transform: pos.clicking ? 'scale(0.75)' : 'scale(1)',
        opacity: pos.visible ? 1 : 0,
        filter: cursor.filter,
      }}
    >
      {executing ? (
        <div
          style={{
            width: `${cursor.size}px`,
            height: `${cursor.size}px`,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #a5b4fc, #6366f1, #4338ca)',
            boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
          }}
        />
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 3L19 12L12 13L9 20L5 3Z"
            fill="#6366f1"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {pos.clicking && (
        <>
          <div
            key={`ripple-${clickCountRef.current}`}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              border: '2px solid rgba(99, 102, 241, 0.5)',
              animation: 'agent-ripple 0.6s ease-out forwards',
              width: '16px',
              height: '16px',
              opacity: 0.8,
              left: cursor.rippleOffset,
              top: executing ? cursor.rippleOffset : '4px',
            }}
          />
          <div
            key={`ripple2-${clickCountRef.current}`}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              animation: 'agent-ripple-fill 0.4s ease-out forwards',
              width: '16px',
              height: '16px',
              opacity: 0.3,
              left: cursor.rippleOffset,
              top: executing ? cursor.rippleOffset : '4px',
            }}
          />
        </>
      )}
    </div>
  )
}

/** Derive a human-readable label from a clicked element's aria-label or text. */
function getClickLabel(el: Element): string | null {
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel
  const text = el.textContent?.trim()
  if (text && text.length < 40) return text
  return null
}

/** Derive a label for a text input from its aria-label, associated <label>, or placeholder. */
function getTypeLabel(el: HTMLInputElement | HTMLTextAreaElement): string {
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return `Entering ${ariaLabel.toLowerCase()}`
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`)
    if (label?.textContent) return `Entering ${label.textContent.trim().toLowerCase()}`
  }
  if (el.placeholder) return `Entering ${el.placeholder.toLowerCase()}`
  return 'Entering text'
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
    }, 100)
  })
}

/** Find an element matching `selector` whose trimmed textContent equals `text`. */
function waitForElementByText(selector: string, text: string, timeout: number): Promise<Element | null> {
  return new Promise((resolve) => {
    function find() {
      const els = Array.from(document.querySelectorAll(selector))
      for (let i = 0; i < els.length; i++) {
        if (els[i].textContent?.trim() === text) return els[i]
      }
      return null
    }

    const el = find()
    if (el) return resolve(el)

    const start = Date.now()
    const interval = setInterval(() => {
      const el = find()
      if (el) {
        clearInterval(interval)
        resolve(el)
      } else if (Date.now() - start > timeout) {
        clearInterval(interval)
        resolve(null)
      }
    }, 100)
  })
}
