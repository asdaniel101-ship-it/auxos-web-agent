import Anthropic from '@anthropic-ai/sdk'
import type { ApiHandlerConfig, AuxosTool, ToolSchema } from '../types'

function toAnthropicTool(tool: any): Anthropic.Tool {
  // Handle AuxosTool (has .parameters)
  if ('parameters' in tool && !('input_schema' in tool)) {
    return {
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: 'object' as const,
        properties: tool.parameters.properties,
        required: tool.parameters.required || [],
      },
    }
  }
  // Already in Anthropic format (has .input_schema)
  return tool as Anthropic.Tool
}

/**
 * Create a reusable API route handler for Next.js App Router.
 * Supports both streaming and non-streaming responses.
 *
 * ```ts
 * export const POST = createApiHandler({
 *   tools: myTools,
 *   systemPrompt: 'You are a helpful assistant.',
 * })
 * ```
 */
export function createApiHandler(config: ApiHandlerConfig) {
  const {
    model = 'claude-sonnet-4-6',
    maxTokens = 4096,
    stream: enableStreaming = true,
  } = config

  const toolSchemas = config.tools.map(toAnthropicTool)

  return async function handler(request: Request): Promise<Response> {
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const client = new Anthropic({ apiKey })

    try {
      const body = await request.json()
      const { messages, context = {}, stream: clientWantsStream } = body

      // Resolve system prompt
      let systemPrompt: string | undefined
      if (typeof config.systemPrompt === 'function') {
        systemPrompt = config.systemPrompt(context)
      } else {
        systemPrompt = config.systemPrompt
      }

      const params: Anthropic.MessageCreateParams = {
        model,
        max_tokens: maxTokens,
        tools: toolSchemas,
        messages,
      }

      if (systemPrompt) {
        params.system = systemPrompt
      }

      // Streaming response
      if (enableStreaming && clientWantsStream !== false) {
        const stream = client.messages.stream(params)

        const encoder = new TextEncoder()
        const readable = new ReadableStream({
          async start(controller) {
            try {
              for await (const event of stream) {
                const data = JSON.stringify(event)
                controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              }
              // Send the final message object
              const finalMessage = await stream.finalMessage()
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'final_message', message: finalMessage })}\n\n`)
              )
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
            } catch (err: any) {
              const errorData = JSON.stringify({
                type: 'error',
                error: err.message || 'Stream error',
                status: err.status,
              })
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
              controller.close()
            }
          },
        })

        return new Response(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        })
      }

      // Non-streaming response (fallback)
      const response = await client.messages.create(params)
      return Response.json(response)
    } catch (error: any) {
      const status = error.status || 500
      const message = error.message || 'Internal server error'
      console.error('Agent API handler error:', status, message)

      if (status === 401) {
        return Response.json({ error: 'Invalid API key', code: 'auth_error' }, { status: 401 })
      }
      if (status === 429) {
        return Response.json({ error: 'Rate limited. Try again shortly.', code: 'rate_limit', retryable: true }, { status: 429 })
      }
      if (status >= 500) {
        return Response.json({ error: 'Claude API is temporarily unavailable.', code: 'upstream_error', retryable: true }, { status: 502 })
      }

      return Response.json({ error: message }, { status })
    }
  }
}
