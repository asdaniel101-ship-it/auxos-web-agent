'use client'

import { useState, useMemo } from 'react'
import { AgentButton } from './AgentButton'
import { AgentPanel } from './AgentPanel'
import { useAgent } from '../hooks/useAgent'
import { createTheme } from '../theme'
import type { AuxosConfig } from '../types'

/**
 * Drop-in AI agent component. Add this to any React app.
 *
 * ```tsx
 * <AuxosAgent
 *   tools={myTools}
 *   endpoint="/api/agent"
 *   name="My Assistant"
 *   suggestions={['Create a task', 'Show dashboard']}
 *   theme={{ colors: { primary: '#8b5cf6' } }}
 * />
 * ```
 */
export function AuxosAgent(config: AuxosConfig) {
  const [isOpen, setIsOpen] = useState(false)
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

  return (
    <>
      <AgentButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} theme={theme} />
      <AgentPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
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
