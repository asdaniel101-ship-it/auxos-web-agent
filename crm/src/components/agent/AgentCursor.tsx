'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface CursorPosition {
  x: number
  y: number
  visible: boolean
  clicking: boolean
}

interface AgentStep {
  type: 'move' | 'click' | 'type' | 'wait' | 'scroll-to' | 'dismiss'
  selector?: string
  text?: string
  delay?: number
}

type QueueItem = {
  steps: AgentStep[]
  resolve: () => void
}

const queue: QueueItem[] = []
let aborted = false

/**
 * Cancel all pending cursor animation steps.
 * Resolves all queued promises so awaiting callers unblock immediately.
 */
export function cancelAllSteps() {
  aborted = true
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
    queue.push({ steps, resolve })
    window.dispatchEvent(new CustomEvent('agent-steps-queued'))
  })
}

export function AgentCursor() {
  const [pos, setPos] = useState<CursorPosition>({ x: -100, y: -100, visible: false, clicking: false })
  const processingRef = useRef(false)

  const processQueue = useCallback(async () => {
    if (processingRef.current || queue.length === 0) return
    processingRef.current = true
    aborted = false
    setPos((p) => ({ ...p, visible: true }))

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
            const el = await waitForElement(step.selector, 2000)
            if (!el || aborted) break
            const rect = el.getBoundingClientRect()
            setPos((p) => ({ ...p, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false }))
            await sleep(600)
            break
          }

          case 'click': {
            if (!step.selector) break
            const el = await waitForElement(step.selector, 2000)
            if (!el || aborted) break
            // Skip scroll for elements inside portals/dropdowns — scrolling
            // an ancestor would cause Radix to close the popover.
            const inPortal = el.closest('[data-radix-popper-content-wrapper]') || el.closest('[role="listbox"]')
            if (!inPortal) {
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              await sleep(300)
            }
            const rect = el.getBoundingClientRect()
            // Move to element
            setPos((p) => ({ ...p, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false }))
            await sleep(500)
            if (aborted) break
            // Click animation
            setPos((p) => ({ ...p, clicking: true }))
            await sleep(200)
            setPos((p) => ({ ...p, clicking: false }))
            // Dispatch full pointer event sequence (Radix UI needs pointerdown/pointerup
            // with pointerType: 'mouse' for Select item selection to trigger)
            const center = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, bubbles: true }
            const pointerOpts = { ...center, pointerId: 1, pointerType: 'mouse' as const }
            el.dispatchEvent(new PointerEvent('pointerdown', pointerOpts))
            el.dispatchEvent(new MouseEvent('mousedown', center))
            el.dispatchEvent(new PointerEvent('pointerup', pointerOpts))
            el.dispatchEvent(new MouseEvent('mouseup', center))
            ;(el as HTMLElement).click()
            await sleep(500)
            break
          }

          case 'type': {
            if (!step.selector || !step.text) break
            const el = await waitForElement(step.selector, 3000) as HTMLInputElement | HTMLTextAreaElement | null
            if (!el || aborted) break
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            await sleep(200)
            const rect = el.getBoundingClientRect()
            // Move to field
            setPos((p) => ({ ...p, x: rect.left + 40, y: rect.top + rect.height / 2, clicking: false }))
            await sleep(400)
            // Click to focus
            setPos((p) => ({ ...p, clicking: true }))
            await sleep(150)
            setPos((p) => ({ ...p, clicking: false }))
            el.focus()
            el.click()
            await sleep(200)
            if (aborted) break
            // Paste the full value at once
            const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
            const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
            const fullValue = (el.value || '') + step.text
            if (nativeSetter) {
              nativeSetter.call(el, fullValue)
            } else {
              el.value = fullValue
            }
            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
            await sleep(300)
            break
          }

          case 'dismiss': {
            // Close any open dropdown/popover without closing the parent dialog.
            // Dispatch Escape on the listbox so Radix's topmost layer handles it.
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
    }

    // Hide cursor (skip if aborted — cancelAllSteps already resolved all promises)
    if (!aborted) {
      await sleep(500)
    }
    setPos((p) => ({ ...p, visible: false }))
    processingRef.current = false
    aborted = false

    // Items may have been queued during the hide-cursor sleep while
    // processingRef was still true (event handler bailed early). Restart.
    if (queue.length > 0) {
      processQueue()
    }
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
        width: '24px',
        height: '24px',
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1), top 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s, opacity 0.3s',
        transform: pos.clicking ? 'scale(0.75)' : 'scale(1)',
        opacity: pos.visible ? 1 : 0,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill="#6366f1"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {pos.clicking && (
        <div
          style={{
            position: 'absolute',
            left: '4px',
            top: '2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: '2px solid rgba(99, 102, 241, 0.5)',
            animation: 'agent-ripple 0.5s ease-out forwards',
          }}
        />
      )}
      <style>{`
        @keyframes agent-ripple {
          0% { width: 16px; height: 16px; opacity: 0.7; left: 4px; top: 2px; }
          100% { width: 48px; height: 48px; opacity: 0; left: -12px; top: -14px; }
        }
      `}</style>
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
    }, 100)
  })
}
