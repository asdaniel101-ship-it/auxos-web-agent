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
import type { ActionStep } from './AgentPanel'

export function AuxosAgent(config: AuxosConfig & { actionHistory?: ActionStep[]; toolsDone?: boolean }) {
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

  // Global Esc key handler
  useEffect(() => {
    if (!isOpen) return
    function handleEsc(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        updateOpen(false)
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, updateOpen])

  const minimized = config.minimized ?? false

  return (
    <>
      {/* Scrim — subtle overlay when command bar is open */}
      {isOpen && !minimized && (
        <div
          onClick={() => updateOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            background: 'rgba(0, 0, 0, 0.04)',
            pointerEvents: 'auto',
          }}
        />
      )}

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
                bottom: '100%',
                right: '0',
                marginBottom: '10px',
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
              Need help? Just ask!
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
        theme={theme}
        actionHistory={config.actionHistory}
        toolsDone={config.toolsDone}
      />
    </>
  )
}
