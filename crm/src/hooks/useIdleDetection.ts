'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

interface UseIdleDetectionOptions {
  /** Idle timeout in ms. Default 30000 (30s). */
  timeout?: number
  /** Cooldown after dismiss in ms. Default 300000 (5 min). */
  cooldown?: number
  /** Auto-dismiss idle message after this many ms. Default 5000 (5s). */
  autoDismiss?: number
  /** Set to false to pause detection (e.g., when panel is open). */
  enabled?: boolean
}

interface UseIdleDetectionReturn {
  isIdle: boolean
  idleMessage: string
  dismiss: () => void
}

const MESSAGES: Record<string, string> = {
  '/contacts': 'I can find or manage contacts for you',
  '/companies': 'I can look up company details for you',
  '/deals': 'I can update deal stages and info',
  '/tasks': 'I can help manage your tasks',
  '/emails': 'I can draft emails for you',
  '/dashboard': 'I can summarize today\'s activity',
  '/': 'I can summarize today\'s activity',
  '/reports': 'I can generate reports for you',
  '/settings': 'I can help with settings',
}

const FALLBACK_MESSAGE = 'I can help — just ask'

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
  autoDismiss = 5000,
  enabled = true,
}: UseIdleDetectionOptions = {}): UseIdleDetectionReturn {
  const pathname = usePathname()
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cooldownRef = useRef(false)

  const clearAllTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)
    if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current)
  }, [])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    // If in cooldown or disabled, don't start a new timer
    if (cooldownRef.current || !enabled) return

    setIsIdle((prev) => prev ? false : prev)

    timerRef.current = setTimeout(() => {
      setIsIdle(true)
    }, timeout)
  }, [timeout, enabled])

  const dismiss = useCallback(() => {
    setIsIdle(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current)

    // Start cooldown
    cooldownRef.current = true
    cooldownTimerRef.current = setTimeout(() => {
      cooldownRef.current = false
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

    resetTimer()

    const handler = () => resetTimer()
    const events = ['mousemove', 'click', 'scroll', 'keydown'] as const
    events.forEach((evt) => window.addEventListener(evt, handler, { passive: true }))

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handler))
      clearAllTimers()
    }
  }, [enabled, resetTimer, clearAllTimers])

  // Auto-dismiss: just hide the bubble without triggering cooldown
  useEffect(() => {
    if (!isIdle || autoDismiss <= 0) return
    autoDismissTimerRef.current = setTimeout(() => setIsIdle(false), autoDismiss)
    return () => {
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current)
    }
  }, [isIdle, autoDismiss])

  // Reset on page navigation
  useEffect(() => {
    setIsIdle(false)
    clearAllTimers()
    if (!cooldownRef.current && enabled) {
      timerRef.current = setTimeout(() => setIsIdle(true), timeout)
    }
  }, [pathname, timeout, enabled, clearAllTimers])

  return {
    isIdle,
    idleMessage: getMessageForRoute(pathname),
    dismiss,
  }
}
