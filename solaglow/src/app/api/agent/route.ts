import Anthropic from '@anthropic-ai/sdk'
import { tools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured. Add it to solaglow/.env.local' },
      { status: 500 }
    )
  }

  const client = new Anthropic({ apiKey })

  try {
    const body = await request.json()
    const { messages, context = {} } = body

    const systemPrompt = getSystemPrompt({
      currentPage: (context.currentPage as string) || '/',
    })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      tools: tools as Anthropic.Tool[],
      messages,
    })

    return Response.json(response)
  } catch (error: any) {
    const status = error.status || 500
    const message = error.message || 'Internal server error'
    console.error('Agent API error:', status, message)

    if (status === 401) {
      return Response.json({ error: 'Invalid API key', code: 'auth_error' }, { status: 401 })
    }
    if (status === 429) {
      return Response.json({ error: 'Rate limited. Try again shortly.', code: 'rate_limit' }, { status: 429 })
    }

    return Response.json({ error: message }, { status })
  }
}
