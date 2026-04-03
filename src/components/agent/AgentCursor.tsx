'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useStore } from '@/store'

interface CursorPosition {
  x: number
  y: number
  visible: boolean
  clicking: boolean
}

interface AgentStep {
  type: 'move' | 'click' | 'type' | 'wait'
  selector?: string
  text?: string
  delay?: number
}

// Global queue for agent visual actions
let stepQueue: AgentStep[] = []
let isProcessing = false
let onStepComplete: (() => void) | null = null

export function queueAgentSteps(steps: AgentStep[]): Promise<void> {
  return new Promise((resolve) => {
    stepQueue.push(...steps)
    onStepComplete = resolve
    // Trigger processing via a custom event
    window.dispatchEvent(new CustomEvent('agent-steps-queued'))
  })
}

export function AgentCursor() {
  const [pos, setPos] = useState<CursorPosition>({ x: -100, y: -100, visible: false, clicking: false })
  const processingRef = useRef(false)

  const processQueue = useCallback(async () => {
    if (processingRef.current || stepQueue.length === 0) return
    processingRef.current = true
    setPos((p) => ({ ...p, visible: true }))

    while (stepQueue.length > 0) {
      const step = stepQueue.shift()!

      switch (step.type) {
        case 'move': {
          if (!step.selector) break
          const el = document.querySelector(step.selector)
          if (!el) break
          const rect = el.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          setPos((p) => ({ ...p, x, y, clicking: false }))
          await sleep(400) // let cursor animation finish
          break
        }

        case 'click': {
          if (!step.selector) break
          const el = document.querySelector(step.selector)
          if (!el) break
          const rect = el.getBoundingClientRect()
          const x = rect.left + rect.width / 2
          const y = rect.top + rect.height / 2
          // Move to element
          setPos((p) => ({ ...p, x, y, clicking: false }))
          await sleep(300)
          // Click animation
          setPos((p) => ({ ...p, clicking: true }))
          await sleep(150)
          setPos((p) => ({ ...p, clicking: false }))
          // Actually click the element
          ;(el as HTMLElement).click()
          await sleep(300)
          break
        }

        case 'type': {
          if (!step.selector || !step.text) break
          const el = document.querySelector(step.selector) as HTMLInputElement | HTMLTextAreaElement
          if (!el) break
          const rect = el.getBoundingClientRect()
          // Move to field
          setPos((p) => ({ ...p, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, clicking: false }))
          await sleep(300)
          // Click to focus
          setPos((p) => ({ ...p, clicking: true }))
          await sleep(100)
          setPos((p) => ({ ...p, clicking: false }))
          el.focus()
          await sleep(150)
          // Type character by character
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
          )?.set || Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 'value'
          )?.set
          let currentValue = ''
          for (const char of step.text) {
            currentValue += char
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(el, currentValue)
            } else {
              el.value = currentValue
            }
            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
            await sleep(30 + Math.random() * 40) // human-like typing speed
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

    // Hide cursor after all steps done
    await sleep(300)
    setPos((p) => ({ ...p, visible: false }))
    processingRef.current = false

    if (onStepComplete) {
      onStepComplete()
      onStepComplete = null
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
        width: '20px',
        height: '20px',
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.35s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s',
        transform: pos.clicking ? 'scale(0.8)' : 'scale(1)',
        opacity: pos.visible ? 1 : 0,
      }}
    >
      {/* Cursor SVG */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M5 3L19 12L12 13L9 20L5 3Z"
          fill="#6366f1"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {/* Click ripple */}
      {pos.clicking && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(99, 102, 241, 0.3)',
            transform: 'translate(-50%, -50%)',
            animation: 'agent-ripple 0.4s ease-out',
          }}
        />
      )}
      <style>{`
        @keyframes agent-ripple {
          0% { width: 8px; height: 8px; opacity: 0.6; }
          100% { width: 40px; height: 40px; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
