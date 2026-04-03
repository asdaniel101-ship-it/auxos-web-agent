import Anthropic from '@anthropic-ai/sdk'
import { tools } from '@/agent/tools'
import { getSystemPrompt } from '@/agent/system-prompt'
import { NextRequest } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  const { messages, context } = await request.json()

  const systemPrompt = getSystemPrompt(context)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    })

    return Response.json(response)
  } catch (error: any) {
    console.error('Agent API error:', error)
    return Response.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}
