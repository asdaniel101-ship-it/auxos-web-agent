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
              theme={theme}
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
