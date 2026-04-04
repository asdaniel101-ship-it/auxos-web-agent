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

  const minimized = config.minimized ?? false

  return (
    <>
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
                right: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginRight: '10px',
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
              {config.name ?? 'Auxos'}
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
      />
    </>
  )
}
