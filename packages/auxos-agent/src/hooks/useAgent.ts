'use client'

import { useState, useRef, useCallback } from 'react'
import type { AuxosTool, DisplayMessage, ToolResult, AuxosEvent } from '../types'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: any
}

interface UseAgentOptions {
  tools: AuxosTool[]
  endpoint: string
  getContext?: () => Record<string, unknown>
  systemPrompt?: string
  onNavigate?: (path: string) => void
  onEvent?: (event: AuxosEvent) => void
  maxIterations?: number
}

interface UseAgentReturn {
  messages: DisplayMessage[]
  isLoading: boolean
  streamingText: string
  send: (text: string) => Promise<void>
  reset: () => void
}

const MAX_RETRIES = 2
const RETRY_DELAYS = [1000, 3000] // ms
const DEFAULT_MAX_ITERATIONS = 10
const FETCH_TIMEOUT = 60_000 // 60s

export function useAgent(options: UseAgentOptions): UseAgentReturn {
  const {
    tools,
    endpoint,
    getContext,
    systemPrompt,
    onNavigate,
    onEvent,
    maxIterations = DEFAULT_MAX_ITERATIONS,
  } = options

  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const claudeMessagesRef = useRef<ClaudeMessage[]>([])

  const toolMap = useRef<Map<string, AuxosTool['execute']>>(new Map())
  toolMap.current = new Map(tools.map((t) => [t.name, t.execute]))

  const toolSchemas = tools.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: {
      type: t.parameters.type,
      properties: t.parameters.properties,
      required: t.parameters.required || [],
    },
  }))

  const emit = useCallback(
    (event: AuxosEvent) => {
      onEvent?.(event)
    },
    [onEvent]
  )

  async function fetchWithRetry(
    url: string,
    init: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    try {
      const response = await fetch(url, { ...init, signal: controller.signal })

      if (response.status === 429 || response.status >= 500) {
        if (retries > 0) {
          const delay = RETRY_DELAYS[MAX_RETRIES - retries] || 3000
          emit({ type: 'error', error: `Retrying (${response.status})...`, retryable: true })
          await new Promise((r) => setTimeout(r, delay))
          return fetchWithRetry(url, init, retries - 1)
        }
      }

      return response
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.')
      }
      if (retries > 0) {
        const delay = RETRY_DELAYS[MAX_RETRIES - retries] || 3000
        emit({ type: 'error', error: 'Network error, retrying...', retryable: true })
        await new Promise((r) => setTimeout(r, delay))
        return fetchWithRetry(url, init, retries - 1)
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }

  async function parseStream(
    response: Response
  ): Promise<{ text: string; assistantContent: any[]; stopReason: string }> {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let text = ''
    let assistantContent: any[] = []
    let stopReason = 'end_turn'
    let currentBlockIndex = -1
    let currentBlockType = ''
    let toolInputJson = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue

        try {
          const event = JSON.parse(data)

          if (event.type === 'content_block_start') {
            currentBlockIndex = event.index
            currentBlockType = event.content_block?.type || ''
            if (currentBlockType === 'tool_use') {
              toolInputJson = ''
              assistantContent.push({
                type: 'tool_use',
                id: event.content_block.id,
                name: event.content_block.name,
                input: {},
              })
            } else if (currentBlockType === 'text') {
              assistantContent.push({ type: 'text', text: '' })
            }
          } else if (event.type === 'content_block_delta') {
            if (event.delta?.type === 'text_delta' && event.delta.text) {
              text += event.delta.text
              // Update the text block
              const textBlock = assistantContent.find(
                (b: any, i: number) => i === currentBlockIndex && b.type === 'text'
              )
              if (textBlock) textBlock.text += event.delta.text
              setStreamingText(text)
              emit({ type: 'response_text', text: event.delta.text })
            } else if (event.delta?.type === 'input_json_delta' && event.delta.partial_json) {
              toolInputJson += event.delta.partial_json
            }
          } else if (event.type === 'content_block_stop') {
            if (currentBlockType === 'tool_use' && toolInputJson) {
              const toolBlock = assistantContent[currentBlockIndex]
              if (toolBlock && toolBlock.type === 'tool_use') {
                try {
                  toolBlock.input = JSON.parse(toolInputJson)
                } catch {
                  toolBlock.input = {}
                }
              }
            }
            currentBlockType = ''
            toolInputJson = ''
          } else if (event.type === 'message_delta') {
            if (event.delta?.stop_reason) {
              stopReason = event.delta.stop_reason
            }
          } else if (event.type === 'final_message') {
            // Use the final message as authoritative
            assistantContent = event.message.content
            stopReason = event.message.stop_reason
            const finalText = assistantContent
              .filter((b: any) => b.type === 'text')
              .map((b: any) => b.text)
              .join('\n')
            if (finalText) text = finalText
          } else if (event.type === 'error') {
            throw new Error(event.error || 'Stream error')
          }
        } catch (e: any) {
          if (e.message === 'Stream error' || e.message?.includes('error')) throw e
          // Skip malformed JSON lines
        }
      }
    }

    return { text, assistantContent, stopReason }
  }

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return

      setIsLoading(true)
      setStreamingText('')
      emit({ type: 'message_sent', content: text })

      const newDisplay: DisplayMessage[] = [
        ...displayMessages,
        { type: 'user', content: text },
      ]
      setDisplayMessages(newDisplay)

      const newClaude: ClaudeMessage[] = [
        ...claudeMessagesRef.current,
        { role: 'user', content: text },
      ]

      try {
        let currentMessages = newClaude
        let finalText = ''
        let toolMessages: DisplayMessage[] = []
        let iterations = 0

        // Tool execution loop with max iterations guard
        while (iterations < maxIterations) {
          iterations++
          const context = getContext?.() || {}

          emit({ type: 'response_start' })

          const response = await fetchWithRetry(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: currentMessages,
              context,
              tools: toolSchemas,
              systemPrompt,
              stream: true,
            }),
          })

          if (!response.ok) {
            const errorBody = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
            throw new Error(errorBody.error || `API error: ${response.status}`)
          }

          let assistantContent: any[]
          let textContent: string
          let stopReason: string

          const contentType = response.headers.get('content-type') || ''

          if (contentType.includes('text/event-stream')) {
            // Streaming response
            const parsed = await parseStream(response)
            textContent = parsed.text
            assistantContent = parsed.assistantContent
            stopReason = parsed.stopReason
          } else {
            // JSON response (non-streaming fallback)
            const data = await response.json()
            if (data.error) throw new Error(data.error)
            assistantContent = data.content
            stopReason = data.stop_reason
            textContent = assistantContent
              .filter((b: any) => b.type === 'text')
              .map((b: any) => b.text)
              .join('\n')
          }

          finalText = textContent
          setStreamingText('')

          const toolUseBlocks = assistantContent.filter((b: any) => b.type === 'tool_use')

          if (toolUseBlocks.length === 0 || stopReason === 'end_turn') {
            currentMessages = [
              ...currentMessages,
              { role: 'assistant', content: assistantContent },
            ]
            emit({ type: 'response_end' })
            break
          }

          // Execute tools and build visibility messages
          const toolResults: any[] = []
          for (const toolUse of toolUseBlocks) {
            const executeFn = toolMap.current.get(toolUse.name)
            let result: ToolResult

            emit({ type: 'tool_start', toolName: toolUse.name, input: toolUse.input })

            if (!executeFn) {
              result = { success: false, error: `Unknown tool: ${toolUse.name}` }
            } else {
              try {
                result = await Promise.resolve(executeFn(toolUse.input))
              } catch (err) {
                result = { success: false, error: String(err) }
              }
            }

            emit({ type: 'tool_end', toolName: toolUse.name, result })

            // Tool visibility message
            toolMessages.push({
              type: 'tool',
              toolName: toolUse.name,
              toolInput: toolUse.input,
              result,
            })

            // Handle navigation side effect
            if (
              result.success &&
              result.data &&
              typeof result.data === 'object' &&
              'navigate' in (result.data as any) &&
              onNavigate
            ) {
              onNavigate((result.data as any).navigate)
            }

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            })
          }

          // Update display with tool messages as they happen
          setDisplayMessages([...newDisplay, ...toolMessages])

          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: assistantContent },
            { role: 'user', content: toolResults },
          ]

          emit({ type: 'response_end' })
        }

        if (iterations >= maxIterations) {
          finalText += '\n\n(Stopped after reaching the maximum number of steps.)'
          emit({ type: 'error', error: 'Max iterations reached', retryable: false })
        }

        claudeMessagesRef.current = currentMessages
        setDisplayMessages([
          ...newDisplay,
          ...toolMessages,
          { type: 'assistant', content: finalText || 'Done!' },
        ])
      } catch (error: any) {
        emit({ type: 'error', error: error.message, retryable: false })
        setDisplayMessages([
          ...newDisplay,
          {
            type: 'assistant',
            content: `Sorry, I encountered an error: ${error.message}`,
          },
        ])
      } finally {
        setIsLoading(false)
        setStreamingText('')
      }
    },
    [displayMessages, isLoading, endpoint, getContext, systemPrompt, onNavigate, toolSchemas, maxIterations, emit]
  )

  const reset = useCallback(() => {
    setDisplayMessages([])
    setStreamingText('')
    claudeMessagesRef.current = []
  }, [])

  return { messages: displayMessages, isLoading, streamingText, send, reset }
}
