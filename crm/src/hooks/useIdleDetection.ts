'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface UseIdleDetectionOptions {
  /** Idle timeout in ms. Default 10000 (10s). */
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
  timeout = 10000,
  cooldown = 300000,
  enabled = true,
}: UseIdleDetectionOptions = {}): UseIdleDetectionReturn {
  const pathname = usePathname()
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
    cooldownTimerRef.current = setTimeout(() => {
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
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    }
  }, [enabled, resetTimer])

  // Reset on page navigation
  useEffect(() => {
    setIsIdle(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
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
